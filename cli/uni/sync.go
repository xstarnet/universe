package uni

import (
	"context"
	"fmt"
	"os/exec"

	"github.com/spf13/viper"
)

func doSync(ctx context.Context, build bool, del bool) error {
	cwd := mustRoot()
	if build {
		err := exec.Command("go", "install", "./cli/uni.go").Run()
		assertErr("build uni failed", err)
		Infoln("build uni success")
	}

	viper.AddConfigPath(cwd)
	err := viper.ReadInConfig()
	assertErr("read config failed", err)

	remote := viper.GetString("remote")
	assertBool("remote is empty", remote != "")

	args := []string{}
	if del {
		args = append(args, "--delete-after")
	}
	args = append(args, "--filter")
	args = append(args, ":- .gitignore")
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
}
