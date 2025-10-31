package uni

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"

	"github.com/spf13/viper"
	"github.com/urfave/cli/v3"
)

func init() {
	viper.SetConfigName("uni")
	viper.SetConfigType("yaml")

	cmd := &cli.Command{
		EnableShellCompletion: true,
		Commands: []*cli.Command{
			{
				Name:    "sync",
				Aliases: []string{"u"},
				Usage:   "sync to remote",
				Flags: []cli.Flag{
					&cli.BoolFlag{
						Name:     "del",
						Aliases:  []string{"d"},
						Usage:    "delete remote additional files",
						Required: false,
						Value:    false,
					},
				},
				Action: func(ctx context.Context, cmd *cli.Command) error {
					cwd := mustRoot()
					err := exec.Command("go", "install", "./cli/uni.go").Run()
					assertErr("build uni failed", err)
					Infoln("build uni success")

					viper.AddConfigPath(cwd)
					err = viper.ReadInConfig()
					assertErr("read config failed", err)

					remote := viper.GetString("remote")
					assertBool("remote is empty", remote != "")

					args := []string{}
					if cmd.Bool("del") {
						args = append(args, "--delete-after")
					}
					args = append(args, "--filter")
					args = append(args, ":e- .gitignore")
					args = append(args, "--filter")
					args = append(args, `- .git/`)
					args = append(args, "-v")
					args = append(args, "-aP")
					args = append(args, "./")
					args = append(args, fmt.Sprintf("%s:~/universe", remote))

					err = spawn(exec.Command("rsync", args...), Infoln, Errorln)
					assertErr("rsync failed", err)

					err = Ssh().Exec("./build-cli.sh").Run()
					assertErr("uni update failed", err)

					return nil
				},
			},
			//gwCmd(),
			//teleCmd(),
			//rpcCmd(),
			//devCmd(),
		},
	}
	if err := cmd.Run(context.Background(), os.Args); err != nil {
		log.Fatal(err)
	}
}
