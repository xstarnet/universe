package uni

import (
    "context"
    "fmt"
    "os"
    "os/exec"
    "path/filepath"
    "strings"

    "github.com/urfave/cli/v3"
)

func idlCmd() *cli.Command {
    return &cli.Command{
        Name:                   "idl",
        Usage:                  "使用 hz 根据指定的 .thrift 生成/更新服务代码",
        UsageText:              "uni idl [文件名]",
        UseShortOptionHandling: true,
        ShellComplete: func(ctx context.Context, cmd *cli.Command) {
            cwd := mustRoot()
            idlDir := filepath.Join(cwd, "idl")
            entries, err := os.ReadDir(idlDir)
            if err != nil {
                return
            }
            for _, e := range entries {
                if e.IsDir() {
                    continue
                }
                name := e.Name()
                if strings.HasSuffix(name, ".thrift") {
                    fmt.Println(strings.TrimSuffix(name, ".thrift"))
                }
            }
        },
        Action: func(ctx context.Context, cmd *cli.Command) error {
            cwd := mustRoot()
            args := cmd.Args()
            if args.Len() < 1 {
                Errorf("缺少文件名参数，例如: uni idl ledger")
                os.Exit(1)
            }

            base := args.First()
            idlRel := filepath.Join(".", "idl", base+".thrift")
            idlAbs := filepath.Join(cwd, "idl", base+".thrift")

            if _, err := os.Stat(idlAbs); err != nil {
                Errorf("未找到 idl 文件: %s", idlRel)
                os.Exit(1)
            }

            hzArgs := []string{"update", "-module", "universe", "-idl", idlRel}
            cmdExec := exec.Command("hz", hzArgs...)
            cmdExec.Dir = cwd

            Infoln("执行:", "hz", strings.Join(hzArgs, " "))
            err := spawn(cmdExec, Infoln, Errorln)
            assertErr("hz 执行失败", err)
            return nil
        },
    }
}
