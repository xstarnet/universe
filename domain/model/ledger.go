package model

import (
	"time"

	"github.com/google/uuid"
)

type LedgerEntry struct {
	Id         uuid.UUID `gorm:"column:id;type:uuid;default:gen_random_uuid();primaryKey"`
	CategoryId uuid.UUID `gorm:"column:category_id;type:uuid;index:idx_ledger_category"`
	Amount     float64   `gorm:"column:amount;type:numeric"`
	UpdatedAt  time.Time `gorm:"column:updated_at;type:timestamptz"`
}

func (LedgerEntry) TableName() string { return "ledger" }

type Category struct {
	Id          uuid.UUID `gorm:"column:id;type:uuid;default:gen_random_uuid();primaryKey"`
	Name        string    `gorm:"column:name;type:varchar(255);index:idx_category_name"`
	Description *string   `gorm:"column:description;type:varchar(1024)"`
}

func (Category) TableName() string { return "ledger_category" }
