package uni

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path"
	"strings"
)

func assertErr(info string, err error) {
	if err != nil {
		Errorf("%s, err= %v", info, err)
		os.Exit(1)
	}
}

func assertBool(info string, cond bool) {
	if !cond {
		Errorf("%s", info)
		os.Exit(1)
	}
}

func mustGetCwd() string {
	path, err := os.Getwd()
	assertErr("get cwd failed", err)
	return path
}

func getRoot(dir string) bool {
	if _, err := os.Stat(path.Join(dir, "uni.yaml")); err == nil {
		return true
	}
	return false
}

func mustRoot() string {
	cwd := mustGetCwd()
	if getRoot(cwd) {
		return cwd
	}
	log.Fatalf("not in uni root")
	return ""
}

func spawn(cmd *exec.Cmd, o func(v ...any), e func(v ...any)) error {
	out, err := cmd.StdoutPipe()
	if err != nil {
		assertErr("get stdout pipe failed", err)
		return err
	}

	eout, err := cmd.StderrPipe()
	if err != nil {
		assertErr("get stderr pipe failed", err)
		return err
	}

	err = cmd.Start()
	if err != nil {
		return err
	}

	go func() {
		scanner := bufio.NewScanner(out)
		scanner.Split(bufio.ScanLines)
		for scanner.Scan() {
			o(">", scanner.Text())
		}
		if scanner.Err() != nil {
			e(">", scanner.Err())
		}
	}()

	go func() {
		scanner := bufio.NewScanner(eout)
		scanner.Split(bufio.ScanLines)
		for scanner.Scan() {
			e(">", scanner.Text())
		}
		if scanner.Err() != nil {
			e(">", scanner.Err())
		}
	}()

	err = cmd.Wait()
	assertErr("spawn failed", err)

	return nil
}

type sshSubCmd struct {
	bin  string
	args []string
}

func (s *sshSubCmd) Generate() string {
	args := []string{}
	for _, arg := range s.args {
		args = append(args, fmt.Sprintf(`'%s'`, arg))
	}

	return fmt.Sprintf("%s %s", s.bin, strings.Join(args, " "))
}

type sshCmd struct {
	Dir  string
	cmds []*sshSubCmd
}

func Ssh() *sshCmd {
	s := &sshCmd{
		Dir:  "",
		cmds: []*sshSubCmd{},
	}
	return s
}

func (s *sshCmd) Exec(cmd string, args ...string) *sshCmd {
	s.cmds = append(s.cmds, &sshSubCmd{
		bin:  cmd,
		args: args,
	})
	return s
}

func (s *sshCmd) Go() *sshCmd {
	return s.Exec("source ~/.profile")
}

func (s *sshCmd) Run() error {
	dir := s.Dir
	if dir == "" {
		dir = "/root/universe"
	}

	subCmds := []string{}
	for _, cmd := range s.cmds {
		subCmds = append(subCmds, cmd.Generate())
	}

	runCmds := fmt.Sprintf("cd %s && %s", dir, strings.Join(subCmds, " &&\n"))

	Infoln(runCmds)

	cmd := exec.Command("ssh", "Aliyun", runCmds)
	return spawn(cmd, ROutln, RErrln)
}

func nvl[T any](p *T, v T) T {
	if p == nil {
		return v
	}
	return *p
}

func nvls[T any](p *T, v T) string {
	if p == nil {
		return fmt.Sprintf("%v", v)
	}
	return fmt.Sprintf("%v", *p)
}
