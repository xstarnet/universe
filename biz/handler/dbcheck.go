package handler

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/common/utils"
	"github.com/cloudwego/hertz/pkg/protocol/consts"

	"universe/gdb"
)

// DbCheck checks the database connections (PostgreSQL)
func DbCheck(ctx context.Context, c *app.RequestContext) {
	// Check if connection pool is nil first
	pgPool := gdb.Postgres()
	if pgPool == nil {
		c.JSON(consts.StatusInternalServerError, utils.H{
			"status":  "error",
			"message": "PostgreSQL pool is not initialized",
		})
		return
	}

	// Test PostgreSQL connection with ping using context.Background()
	err := pgPool.Ping(context.Background())
	if err != nil {
		c.JSON(consts.StatusInternalServerError, utils.H{
			"status":  "error",
			"message": "PostgreSQL connection failed",
			"error":   err.Error(),
			"detail":  "This error was from context.Background()",
		})
		return
	}

	// Try a simple query to ensure connection is working
	var version string
	err = pgPool.QueryRow(context.Background(), "SELECT version()").Scan(&version)
	if err != nil {
		c.JSON(consts.StatusInternalServerError, utils.H{
			"status":  "error",
			"message": "PostgreSQL query failed",
			"error":   err.Error(),
			"detail":  "This error was from context.Background()",
		})
		return
	}

	// All checks passed
	c.JSON(consts.StatusOK, utils.H{
		"status":           "ok",
		"message":          "Database connections are working correctly",
		"postgres_version": version,
	})
}
