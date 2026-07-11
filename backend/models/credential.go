package models

import (
	"jalcode-api/config"
	"time"

	"gorm.io/gorm"
)


type Credential struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	ClientID   uint      `json:"client_id"` // Relasi ke Klien
	Type       string    `json:"type"`      // Contoh: "cPanel", "WordPress", "FTP"
	URL        string    `json:"url"`       // Link login (opsional)
	Username   string    `json:"username"`
	Password   string    `json:"password"`    // Akan disimpan dalam bentuk terenkripsi
	ExpiryDate time.Time `json:"expiry_date"` // Tanggal kedaluwarsa hosting/domain
	Notes      string    `json:"notes"`       // Catatan tambahan
	CreatedAt  time.Time `json:"created_at"`
}

func (p *Credential) AfterSave(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}

func (p *Credential) AfterDelete(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}