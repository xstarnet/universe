package utils

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/lestrrat-go/file-rotatelogs"
	"github.com/sirupsen/logrus"
	prefixed "github.com/x-cray/logrus-prefixed-formatter"
)

// Logger is the global logger instance
var Logger *logrus.Logger

// InitLogger initializes the logger with file rotation
func InitLogger(logLevel string) {
	// Create logs directory if it doesn't exist
	logDir := "/logs"
	if err := os.MkdirAll(logDir, 0755); err != nil {
		logDir = "./logs"
		_ = os.MkdirAll(logDir, 0755)
	}

	// Configure log file rotation
	logPath := filepath.Join(logDir, "universe.log")
	rotatelogsConfig := rotatelogs.WithMaxAge(30 * 24 * time.Hour) // Keep logs for 30 days

	var writer io.Writer
	rl, err := rotatelogs.New(
		logPath+".%Y%m%d",
		rotatelogsConfig,
	)
	if err != nil {
		writer = os.Stdout
	} else {
		writer = rl
	}

	// Create new logger instance
	Logger = logrus.New()

	// Set log level
	level, err := logrus.ParseLevel(logLevel)
	if err != nil {
		fmt.Printf("Invalid log level: %s, using INFO instead\n", logLevel)
		level = logrus.InfoLevel
	}
	Logger.SetLevel(level)

	// Configure formatter
	Logger.SetFormatter(&prefixed.TextFormatter{
		TimestampFormat: "2006-01-02 15:04:05",
		FullTimestamp:   true,
		ForceColors:     false, // Disable colors for file output
	})

	mw := io.MultiWriter(os.Stdout, writer)
	Logger.SetOutput(mw)

	// Log the initialization
	Logger.Infof("Logger initialized with level: %s", logLevel)
	Logger.Infof("Log files will be stored at: %s", logPath)
	Logger.Infof("Logs will be rotated daily and kept for 30 days")
}

// GetLogger returns the initialized logger instance
func GetLogger() *logrus.Logger {
	if Logger == nil {
		// Initialize with default level if not already initialized
		InitLogger("info")
	}
	return Logger
}
