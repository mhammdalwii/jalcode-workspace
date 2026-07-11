package models

import (
	"jalcode-api/config"
	"time"

	"gorm.io/gorm"
)

// menyimpan data file lampiran untuk sebuah proyek
type Attachment struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	ProjectID uint      `json:"project_id"` // Relasi ke Proyek
	FileName  string    `json:"file_name"`  // Nama asli file (misal: "desain.png")
	FileURL   string    `json:"file_url"`   // Link untuk diakses Frontend
	FileType  string    `json:"file_type"`  // Ekstensi (pdf, png, jpg)
	CreatedAt time.Time `json:"created_at"`
}

func (p *Attachment) AfterSave(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}

func (p *Attachment) AfterDelete(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}