package gdb

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type GDB struct {
	redis    *redis.Client
	postgres *pgxpool.Pool // PostgreSQL connection pool
	gormDB   *gorm.DB      // gorm DB instance
}

var (
	gdb *GDB = &GDB{}
)

func MustInit() {
	gdb.redis = mustRedisClient()
	gdb.postgres = mustPostgresClient()
	gdb.gormDB = mustGormClient()
}

func Dispose(ctx context.Context) {
	if gdb.postgres != nil {
		gdb.postgres.Close()
	}
}

func Redis() *redis.Client {
	return gdb.redis
}

// Postgres returns the PostgreSQL connection pool
func Postgres() *pgxpool.Pool {
	return gdb.postgres
}

// GormDB returns the gorm DB instance
func GormDB() *gorm.DB {
	return gdb.gormDB
}
func mustRedisClient() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	})
}

func mustPostgresClient() *pgxpool.Pool {
	// TODO: Replace with your actual PostgreSQL connection string later
	// Example format: postgresql://user:password@localhost:5432/dbname
	connString := fmt.Sprintf("postgresql://%s:%s@localhost:5432/universe", os.Getenv("pg_user"), os.Getenv("pg_pwd"))

	// Configure connection pool settings
	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		log.Fatalf("Failed to parse PostgreSQL connection string: %v", err)
		panic(err)
	}

	// Adjust pool settings as needed
	// config.MinConns = 10 // Minimum number of connections
	// config.MaxConns = 100 // Maximum number of connections

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Fatalf("Failed to create PostgreSQL connection pool: %v", err)
		panic(err)
	}

	// Test the connection
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("Failed to ping PostgreSQL database: %v", err)
		panic(err)
	}

	return pool
}

func mustGormClient() *gorm.DB {
	// Use the same connection string as PostgreSQL
	connString := fmt.Sprintf("postgresql://%s:%s@localhost:5432/universe", os.Getenv("pg_user"), os.Getenv("pg_pwd"))

	db, err := gorm.Open(postgres.Open(connString), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to create gorm DB instance: %v", err)
		panic(err)
	}

	return db
}
