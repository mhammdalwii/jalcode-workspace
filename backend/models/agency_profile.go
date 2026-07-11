package models

import (
	"jalcode-api/config"
	"time"

	"gorm.io/gorm"
)

type AgencyProfile struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name"`
	Company   string    `json:"company"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Logo      string    `json:"logo" gorm:"type:text"` 
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (p *AgencyProfile) AfterSave(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}

func (p *AgencyProfile) AfterDelete(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}