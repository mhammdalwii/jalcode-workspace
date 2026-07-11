package models

import (
	"jalcode-api/config"
	"time"

	"gorm.io/gorm"
)


type Pricelist struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	ServiceName string    `json:"service_name"`
	Category    string    `json:"category"` 
	Price       float64   `json:"price"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

func (i *Pricelist) AfterSave(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}


func (i *Pricelist) AfterDelete(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}