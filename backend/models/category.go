package models

import (
	"jalcode-api/config"

	"gorm.io/gorm"
)

type Category struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"unique;not null"`
}

func (p *Category) AfterSave(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}

func (p *Category) AfterDelete(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}