package main

import (
  "fmt"
  "path/filepath"
  "github.com/cloudwego/thriftgo/parser"
)

func main() {
  path := "idl/user.thrift"
  thr, _ := parser.ParseFile(path, []string{filepath.Dir(path)}, true)
  for _, s := range thr.Structs {
    if s.Name == "CreateUserRes" || s.Name == "ListUsersRes" {
      fmt.Println("Struct:", s.Name)
      for _, f := range s.Fields {
        t := f.Type
        ref := ""
        if t.Reference != nil { ref = fmt.Sprintf("ref(name=%s,index=%d)", t.Reference.Name, t.Reference.Index) }
        fmt.Printf(" field=%s cat=%d name=%q %s\n", f.Name, t.Category, t.Name, ref)
      }
    }
  }
  for _, svc := range thr.Services {
    if svc.Name == "UserService" {
      for _, fn := range svc.Functions {
        rt := "void"
        if !fn.Void && fn.FunctionType != nil {
          rt = fmt.Sprintf("%d:%s", fn.FunctionType.Category, fn.FunctionType.Name)
        }
        at := ""
        if len(fn.Arguments) > 0 {
          at = fmt.Sprintf("%d:%s", fn.Arguments[0].Type.Category, fn.Arguments[0].Type.Name)
        }
        fmt.Printf("fn=%s req=%s res=%s\n", fn.Name, at, rt)
      }
    }
  }
}

