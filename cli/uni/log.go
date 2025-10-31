package uni

import (
	"log"

	"github.com/fatih/color"
)

func Infof(format string, v ...any) {
	level := color.New(color.FgBlue).Sprintf("[I]")
	content := color.New(color.FgWhite).Sprintf(format, v...)
	log.Printf("%s %s", level, content)
}

func Infoln(v ...any) {
	level := color.New(color.FgBlue).Sprintf("[I]")
	content := color.New(color.FgWhite).Sprintln(v...)
	log.Printf("%s %s", level, content)
}

func Warnf(format string, v ...any) {
	level := color.New(color.FgYellow).Sprintf("[W]")
	content := color.New(color.FgYellow).Sprintf(format, v...)
	log.Printf("%s %s", level, content)
}
func Warnln(v ...any) {
	level := color.New(color.FgYellow).Sprintf("[W]")
	content := color.New(color.FgYellow).Sprintln(v...)
	log.Printf("%s %s", level, content)
}

func Errorf(format string, v ...any) {
	level := color.New(color.FgRed).Sprintf("[E]")
	content := color.New(color.FgRed).Sprintf(format, v...)
	log.Printf("%s %s", level, content)
}
func Errorln(v ...any) {
	level := color.New(color.FgRed).Sprintf("[E]")
	content := color.New(color.FgRed).Sprintln(v...)
	log.Printf("%s %s", level, content)
}

func ROutf(format string, v ...any) {
	level := color.New(color.FgGreen).Sprintf("[SSH][O]")
	content := color.New(color.FgGreen).Sprintf(format, v...)
	log.Printf("%s %s", level, content)
}
func ROutln(v ...any) {
	level := color.New(color.FgGreen).Sprintf("[SSH][O]")
	content := color.New(color.FgGreen).Sprintln(v...)
	log.Printf("%s %s", level, content)
}

func RErrf(format string, v ...any) {
	level := color.New(color.FgRed).Sprintf("[SSH][E]")
	content := color.New(color.FgRed).Sprintf(format, v...)
	log.Printf("%s %s", level, content)
}
func RErrln(v ...any) {
	level := color.New(color.FgRed).Sprintf("[SSH][E]")
	content := color.New(color.FgRed).Sprintln(v...)
	log.Printf("%s %s", level, content)
}
