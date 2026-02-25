package handler

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/common/utils"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func schemaBaseDir() string {
	if v := os.Getenv("SCHEMA_DIR"); v != "" {
		return v
	}
	if wd, err := os.Getwd(); err == nil {
		p := filepath.Join(wd, "schema")
		if st, err := os.Stat(p); err == nil && st.IsDir() {
			return p
		}
	}
	if exe, err := os.Executable(); err == nil {
		p := filepath.Join(filepath.Dir(exe), "schema")
		return p
	}
	return "schema"
}

func SchemaDownload(ctx context.Context, c *app.RequestContext) {
	name := c.Param("filename")
	if name == "" {
		c.String(consts.StatusBadRequest, "missing filename")
		return
	}
	if strings.Contains(name, "/") || strings.Contains(name, "..") {
		c.String(consts.StatusBadRequest, "invalid filename")
		return
	}
	if !strings.HasSuffix(name, ".ts") {
		c.String(consts.StatusBadRequest, "only .ts files are allowed")
		return
	}

	base := schemaBaseDir()
	full := filepath.Join(base, name)

	f, err := os.Open(full)
	if err != nil {
		c.String(consts.StatusNotFound, "file not found")
		return
	}
	defer f.Close()

	hasher := sha256.New()
	data, err := io.ReadAll(io.TeeReader(f, hasher))
	if err != nil {
		c.String(consts.StatusInternalServerError, "failed to read file")
		return
	}
	etag := "\"sha256-" + hex.EncodeToString(hasher.Sum(nil)) + "\""

	inm := string(c.Request.Header.Peek("If-None-Match"))
	if inm != "" && inm == etag {
		c.Header("ETag", etag)
		c.Status(consts.StatusNotModified)
		return
	}

	c.Header("ETag", etag)
	c.Header("Cache-Control", "public, max-age=0")
	c.Header("Content-Disposition", "attachment; filename="+name)
	c.Data(consts.StatusOK, "application/typescript", data)
}

func SchemaList(ctx context.Context, c *app.RequestContext) {
	base := schemaBaseDir()
	entries, err := os.ReadDir(base)
	if err != nil {
		c.String(consts.StatusInternalServerError, "failed to read schema directory")
		return
	}
	files := make([]string, 0, len(entries))
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		name := e.Name()
		if strings.HasSuffix(name, ".ts") {
			files = append(files, name)
		}
	}
	sort.Strings(files)
	c.JSON(consts.StatusOK, utils.H{
		"files": files,
	})
}
