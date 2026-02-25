package utils

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ExecuteQuery executes a PostgreSQL query and returns the rows
func ExecuteQuery(ctx context.Context, pool *pgxpool.Pool, query string, args ...any) (pgx.Rows, error) {
	if pool == nil {
		return nil, fmt.Errorf("PostgreSQL pool is nil")
	}

	return pool.Query(ctx, query, args...)
}

// ExecuteQueryRow executes a PostgreSQL query that returns a single row
func ExecuteQueryRow(ctx context.Context, pool *pgxpool.Pool, query string, args ...any) pgx.Row {
	if pool == nil {
		log.Fatal("PostgreSQL pool is nil")
		panic("PostgreSQL pool is nil")
	}

	return pool.QueryRow(ctx, query, args...)
}

// ExecuteCommand executes a PostgreSQL command (INSERT, UPDATE, DELETE)
func ExecuteCommand(ctx context.Context, pool *pgxpool.Pool, query string, args ...any) (int64, error) {
	if pool == nil {
		return 0, fmt.Errorf("PostgreSQL pool is nil")
	}

	tag, err := pool.Exec(ctx, query, args...)
	if err != nil {
		return 0, err
	}

	return tag.RowsAffected(), nil
}