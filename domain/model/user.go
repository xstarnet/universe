package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	Id        uuid.UUID `gorm:"column:id;type:uuid;default:gen_random_uuid();primaryKey"`
	Name      *string   `gorm:"column:name;type:varchar(255)"`
	Phone     string    `gorm:"column:phone;type:varchar(32);uniqueIndex:idx_users_phone"`
	Avatar    *string   `gorm:"column:avatar;type:varchar(255)"`
	CreatedAt time.Time `gorm:"column:created_at;type:timestamptz;not null;default:now()"`
	UpdatedAt time.Time `gorm:"column:updated_at;type:timestamptz;not null;default:now()"`
}

func (User) TableName() string { return "users" }

func (u *User) BeforeCreate(tx *gorm.DB) (err error) { return nil }
