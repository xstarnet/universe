package main

import (
	"errors"
	"flag"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"unicode"

	"github.com/cloudwego/thriftgo/parser"
)

func main() {
	var root string
	var out string
	flag.StringVar(&root, "root", "./idl", "root directory to scan for .thrift files")
	flag.StringVar(&out, "out", "./schema", "output root directory; defaults to same as root")
	flag.Parse()
	if out == "" {
		out = root
	}

	rootAbs, err := filepath.Abs(root)
	if err != nil {
		fatalf("abs root error: %v", err)
	}
	outAbs, err := filepath.Abs(out)
	if err != nil {
		fatalf("abs out error: %v", err)
	}

	var thriftFiles []string
	err = filepath.WalkDir(rootAbs, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		if strings.HasSuffix(strings.ToLower(d.Name()), ".thrift") {
			thriftFiles = append(thriftFiles, path)
		}
		return nil
	})
	if err != nil {
		fatalf("scan error: %v", err)
	}
	sort.Strings(thriftFiles)
	if len(thriftFiles) == 0 {
		fatalf("no .thrift files found under %s", root)
	}

	for _, tf := range thriftFiles {
		thr, perr := parseThrift(tf, rootAbs)
		if perr != nil {
			fatalf("parse %s: %v", tf, perr)
		}

		rel, _ := filepath.Rel(rootAbs, tf)
		outPath := filepath.Join(outAbs, strings.TrimSuffix(rel, ".thrift")+".ts")
		if mkerr := os.MkdirAll(filepath.Dir(outPath), 0o755); mkerr != nil {
			fatalf("mkdir %s: %v", filepath.Dir(outPath), mkerr)
		}

		code := generateTS(thr)
		if werr := os.WriteFile(outPath, []byte(code), 0o644); werr != nil {
			fatalf("write %s: %v", outPath, werr)
		}
		fmt.Printf("generated: %s\n", outPath)
	}
}

func fatalf(format string, a ...any) {
	fmt.Fprintf(os.Stderr, format+"\n", a...)
	os.Exit(1)
}

func parseThrift(path string, root string) (*parser.Thrift, error) {
	dirs := uniqueStrings([]string{filepath.Dir(path), root})
	thr, err := parser.ParseFile(path, dirs, true)
	if err != nil {
		return nil, err
	}
	if thr == nil {
		return nil, errors.New("nil AST from thrift parser")
	}
	return thr, nil
}

func generateTS(thr *parser.Thrift) string {
	var b strings.Builder
	requestStructs := collectRequestStructNames(thr)
	hasHttpRequest := make(map[string]bool)
	// Structs
	for _, s := range thr.Structs {
		b.WriteString("export interface ")
		b.WriteString(s.Name)
		b.WriteString(" {\n")
		for _, f := range s.Fields {
			name := fieldAlias(f)
			tsType := toTSType(f.Type, thr)
			optional := f.Requiredness != parser.FieldType_Required
			b.WriteString("  ")
			b.WriteString(tsPropertyName(name))
			if optional {
				b.WriteString("?: ")
			} else {
				b.WriteString(": ")
			}
			b.WriteString(tsType)
			if annStr := fieldAnnSummary(f); annStr != "" {
				b.WriteString("; // ")
				b.WriteString(annStr)
			} else {
				b.WriteString(";")
			}
			b.WriteString("\n")
		}
		b.WriteString("}\n\n")

		if requestStructs[s.Name] {
			parts := partitionFields(s.Fields)
			if len(parts.headers) > 0 {
				writeStructPartInterface(&b, s.Name+"Headers", parts.headers, thr)
			}
			if len(parts.path) > 0 {
				writeStructPartInterface(&b, s.Name+"Path", parts.path, thr)
			}
			if len(parts.query) > 0 {
				writeStructPartInterface(&b, s.Name+"Query", parts.query, thr)
			}
			if len(parts.body) > 0 {
				writeStructPartInterface(&b, s.Name+"Body", parts.body, thr)
			}
			if parts.hasAny() {
				b.WriteString("export interface ")
				b.WriteString(s.Name)
				b.WriteString("HttpRequest {\n")
				if len(parts.headers) > 0 {
					b.WriteString("  headers?: ")
					b.WriteString(s.Name)
					b.WriteString("Headers;\n")
				}
				if len(parts.path) > 0 {
					b.WriteString("  path?: ")
					b.WriteString(s.Name)
					b.WriteString("Path;\n")
				}
				if len(parts.query) > 0 {
					b.WriteString("  query?: ")
					b.WriteString(s.Name)
					b.WriteString("Query;\n")
				}
				if len(parts.body) > 0 {
					b.WriteString("  body?: ")
					b.WriteString(s.Name)
					b.WriteString("Body;\n")
				}
				b.WriteString("}\n\n")
				hasHttpRequest[s.Name] = true
			}
		}
	}

	// Services and configs
	for _, svc := range thr.Services {
		b.WriteString("export interface ")
		b.WriteString(svc.Name)
		b.WriteString(" {\n")
		for _, fn := range svc.Functions {
			reqType := "void"
			if len(fn.Arguments) > 0 {
				reqType = toTSType(fn.Arguments[0].Type, thr)
			}
			if reqType != "void" {
				if structName := structNameFromType(fn.Arguments[0].Type); structName != "" && hasStruct(thr, structName) && hasHttpRequest[structName] {
					reqType = structName + "HttpRequest"
				}
			}
			b.WriteString("  ")
			b.WriteString(fn.Name)
			b.WriteString("(")
			if reqType != "void" {
				b.WriteString("req: ")
				b.WriteString(reqType)
			}
			b.WriteString("):")
			if fn.Void {
				b.WriteString(" void")
			} else if fn.FunctionType != nil {
				b.WriteString(" ")
				b.WriteString(toTSType(fn.FunctionType, thr))
			} else {
				b.WriteString(" any")
			}
			b.WriteString(";\n")
		}
		b.WriteString("}\n\n")

		b.WriteString("export const ")
		b.WriteString(svc.Name)
		b.WriteString("Config = {\n")
		for _, fn := range svc.Functions {
			method, path := methodAndPath(fn.Annotations)
			b.WriteString("  ")
			b.WriteString(fn.Name)
			b.WriteString(": { method: \"")
			b.WriteString(method)
			b.WriteString("\", path: \"")
			b.WriteString(path)
			b.WriteString("\" },\n")
		}
		b.WriteString("}\n")
		b.WriteString("\n")
	}
	return b.String()
}

type structParts struct {
	headers []*parser.Field
	path    []*parser.Field
	query   []*parser.Field
	body    []*parser.Field
}

func (p structParts) hasAny() bool {
	return len(p.headers) > 0 || len(p.path) > 0 || len(p.query) > 0 || len(p.body) > 0
}

func partitionFields(fields []*parser.Field) structParts {
	var p structParts
	for _, f := range fields {
		loc := fieldLocation(f)
		if loc == "" {
			loc = "body"
		}
		switch loc {
		case "header":
			p.headers = append(p.headers, f)
		case "path":
			p.path = append(p.path, f)
		case "query":
			p.query = append(p.query, f)
		case "body":
			p.body = append(p.body, f)
		}
	}
	return p
}

func fieldLocation(f *parser.Field) string {
	if f == nil {
		return ""
	}
	for _, a := range f.Annotations {
		if a == nil || len(a.Values) == 0 {
			continue
		}
		switch strings.ToLower(a.Key) {
		case "api.header":
			return "header"
		case "api.path":
			return "path"
		case "api.query":
			return "query"
		case "api.body":
			return "body"
		}
	}
	return ""
}

func writeStructPartInterface(b *strings.Builder, name string, fields []*parser.Field, thr *parser.Thrift) {
	if b == nil {
		return
	}
	b.WriteString("export interface ")
	b.WriteString(name)
	b.WriteString(" {\n")
	for _, f := range fields {
		propName := fieldAlias(f)
		tsType := toTSType(f.Type, thr)
		optional := f.Requiredness != parser.FieldType_Required
		b.WriteString("  ")
		b.WriteString(tsPropertyName(propName))
		if optional {
			b.WriteString("?: ")
		} else {
			b.WriteString(": ")
		}
		b.WriteString(tsType)
		b.WriteString(";\n")
	}
	b.WriteString("}\n\n")
}

func structNameFromType(t *parser.Type) string {
	if t == nil {
		return ""
	}
	if t.Name != "" {
		return t.Name
	}
	if t.Reference != nil && t.Reference.Name != "" {
		return t.Reference.Name
	}
	return ""
}

func collectRequestStructNames(thr *parser.Thrift) map[string]bool {
	out := make(map[string]bool)
	if thr == nil {
		return out
	}
	for _, svc := range thr.Services {
		for _, fn := range svc.Functions {
			if len(fn.Arguments) == 0 {
				continue
			}
			name := structNameFromType(fn.Arguments[0].Type)
			if name == "" {
				continue
			}
			out[name] = true
		}
	}
	return out
}

func hasStruct(thr *parser.Thrift, name string) bool {
	if thr == nil || name == "" {
		return false
	}
	for _, s := range thr.Structs {
		if s != nil && s.Name == name {
			return true
		}
	}
	return false
}

func toTSType(t *parser.Type, thr *parser.Thrift) string {
	if t == nil {
		return "any"
	}
	// First try by type name for builtins
	switch strings.ToLower(t.Name) {
	case "bool":
		return "boolean"
	case "byte", "i8", "i16", "i32", "i64", "double":
		return "number"
	case "string", "binary":
		return "string"
	case "list":
		return toTSType(t.ValueType, thr) + "[]"
	case "set":
		return toTSType(t.ValueType, thr) + "[]"
	case "map":
		key := mapKeyTSType(t.KeyType)
		val := toTSType(t.ValueType, thr)
		return "Record<" + key + ", " + val + ">"
	}
	if t.Name != "" {
		return t.Name
	}
	switch t.Category {
	case parser.Category_List:
		return toTSType(t.ValueType, thr) + "[]"
	case parser.Category_Set:
		return toTSType(t.ValueType, thr) + "[]"
	case parser.Category_Map:
		key := mapKeyTSType(t.KeyType)
		val := toTSType(t.ValueType, thr)
		return "Record<" + key + ", " + val + ">"
	case parser.Category_Struct, parser.Category_Typedef, parser.Category_Enum:
		if t.Name != "" {
			return t.Name
		}
		if t.Reference != nil && t.Reference.Name != "" {
			return t.Reference.Name
		}
		if t.Reference != nil {
			idx := int(t.Reference.Index)
			switch t.Category {
			case parser.Category_Struct:
				if idx >= 0 && idx < len(thr.Structs) {
					return thr.Structs[idx].Name
				}
			case parser.Category_Enum:
				if idx >= 0 && idx < len(thr.Enums) {
					return thr.Enums[idx].Name
				}
			case parser.Category_Typedef:
				if idx >= 0 && idx < len(thr.Typedefs) {
					return thr.Typedefs[idx].Alias
				}
			}
		}
		return "any"
	default:
		return "any"
	}
}

func mapKeyTSType(t *parser.Type) string {
	if t == nil {
		return "string"
	}
	switch strings.ToLower(t.Name) {
	case "string":
		return "string"
	case "bool":
		return "string"
	case "byte", "i8", "i16", "i32", "i64", "double":
		return "number"
	default:
		return "string"
	}
}

func fieldAlias(f *parser.Field) string {
	if f == nil {
		return ""
	}
	for _, a := range f.Annotations {
		if a == nil || len(a.Values) == 0 {
			continue
		}
		switch strings.ToLower(a.Key) {
		case "api.body", "api.path", "api.header":
			return a.Values[0]
		}
	}
	// default: lowerCamel the original field name
	return lowerFirst(f.Name)
}

func fieldAnnSummary(f *parser.Field) string {
	if f == nil || f.Annotations == nil {
		return ""
	}
	var parts []string
	for _, a := range f.Annotations {
		if a == nil || len(a.Values) == 0 {
			continue
		}
		parts = append(parts, fmt.Sprintf("%s: \"%s\"", a.Key, a.Values[0]))
	}
	sort.Strings(parts)
	return strings.Join(parts, ", ")
}

func methodAndPath(anns parser.Annotations) (string, string) {
	if anns == nil {
		return "post", "" // default
	}
	// Detect method
	var method string
	var path string
	for _, a := range anns {
		if a == nil || len(a.Values) == 0 {
			continue
		}
		v := a.Values[0]
		lk := strings.ToLower(a.Key)
		if strings.HasPrefix(lk, "api.") {
			m := strings.TrimPrefix(lk, "api.")
			switch m {
			case "get", "post", "put", "patch", "delete":
				method = m
				path = v
			}
		}
	}
	if method == "" {
		method = "post"
	}
	return method, path
}

func lowerFirst(s string) string {
	if s == "" {
		return s
	}
	r := []rune(s)
	r[0] = []rune(strings.ToLower(string(r[0])))[0]
	return string(r)
}

func uniqueStrings(v []string) []string {
	seen := make(map[string]struct{}, len(v))
	out := make([]string, 0, len(v))
	for _, s := range v {
		s = strings.TrimSpace(s)
		if s == "" {
			continue
		}
		if _, ok := seen[s]; ok {
			continue
		}
		seen[s] = struct{}{}
		out = append(out, s)
	}
	return out
}

func tsPropertyName(name string) string {
	if isValidTSIdentifier(name) {
		return name
	}
	return strconv.Quote(name)
}

func isValidTSIdentifier(s string) bool {
	if s == "" {
		return false
	}
	if isTSKeyword(s) {
		return false
	}
	for i, r := range s {
		if i == 0 {
			if !(unicode.IsLetter(r) || r == '_' || r == '$') {
				return false
			}
			continue
		}
		if !(unicode.IsLetter(r) || unicode.IsDigit(r) || r == '_' || r == '$') {
			return false
		}
	}
	return true
}

func isTSKeyword(s string) bool {
	switch s {
	case "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "enum", "export", "extends", "false", "finally", "for", "function", "if", "import", "in", "instanceof", "new", "null", "return", "super", "switch", "this", "throw", "true", "try", "typeof", "var", "void", "while", "with", "let", "static", "implements", "interface", "package", "private", "protected", "public", "yield", "await", "of", "as", "any", "never", "unknown", "number", "string", "boolean", "symbol", "bigint", "object", "undefined":
		return true
	default:
		return false
	}
}
