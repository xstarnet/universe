package uni

import (
	"context"

	"github.com/urfave/cli/v3"
)

func xstarCmd() *cli.Command {
	return &cli.Command{
		Name:                   "xstar",
		Usage:                  "xstar",
		UseShortOptionHandling: true,
		Action: func(ctx context.Context, cmd *cli.Command) error {
			mustRoot()
			doSync(ctx, true, false)
			return Ssh().Go().Exec("./script/xstar.sh").Run()
		},
	}
}
