package uni

import (
	"context"
	"io"
	"log"
	"net/http"

	"github.com/urfave/cli/v3"
)

func build(r *sshCmd) *sshCmd {
	if r == nil {
		r = Ssh()
	}
	return r.Go().Exec("./build-bin.sh")
}

func release(r *sshCmd) *sshCmd {
	if r == nil {
		r = Ssh()
	}
	return r.Exec("./output/docker.sh")
}

func ping() {
	res, err := http.Get("https://www.miemie.tech/universe/ping")
	assertErr("get failed", err)
	resBody, err := io.ReadAll(res.Body)
	assertErr("read res body failed", err)
	log.Println(string(resBody))
}

func deployCmd() *cli.Command {
	return &cli.Command{
		Name:                   "deploy",
		Usage:                  "deploy",
		UseShortOptionHandling: true,
		Flags: []cli.Flag{
			&cli.BoolFlag{
				Name:     "release",
				Aliases:  []string{"r"},
				Usage:    "release",
				Required: false,
				Value:    true,
			},
			&cli.BoolFlag{
				Name:     "build",
				Aliases:  []string{"b"},
				Usage:    "build",
				Required: false,
				Value:    true,
			},
			&cli.BoolFlag{
				Name:     "test",
				Aliases:  []string{"t"},
				Usage:    "test",
				Required: false,
				Value:    false,
			},
		},
		Action: func(ctx context.Context, cmd *cli.Command) error {
			mustRoot()
			doSync(ctx, false, true)
			r := Ssh().Go()
			if cmd.Bool("build") {
				r = build(r)
			}
			if cmd.Bool("release") {
				r = release(r)
			}
			if r != nil {
				r.Run()
			}
			if cmd.Bool("test") {
				ping()
			}
			return nil
		},
	}
}
