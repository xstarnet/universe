package uni

import (
	"context"
	"log"
	"os"

	"github.com/spf13/viper"
	"github.com/urfave/cli/v3"
)

func init() {
	viper.SetConfigName("uni")
	viper.SetConfigType("yaml")

	cmd := &cli.Command{
		EnableShellCompletion: true,
		Commands: []*cli.Command{
			idlCmd(),
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
					return doSync(ctx, true, cmd.Bool("del"))
				},
			},
			deployCmd(),
			xstarCmd(),
			v2rayCmd(),
		},
	}
	if err := cmd.Run(context.Background(), os.Args); err != nil {
		log.Fatal(err)
	}
}
