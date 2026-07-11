package models

import (
	"jalcode-api/config"
	"time"

	"gorm.io/gorm"
)

// ActivityLog mencatat setiap aktivitas penting di dalam sistem
type ActivityLog struct {
	ID        uint       `json:"id" gorm:"primaryKey"`
	UserID    uint       `json:"user_id"`
	User      TeamMember `json:"user" gorm:"foreignKey:UserID"` // Relasi untuk tahu nama pelakunya
	Action    string     `json:"action"`                        // Contoh: "Memindahkan status proyek"
	Target    string     `json:"target"`                        // Contoh: "Aplikasi E-Commerce ke Selesai"
	CreatedAt time.Time  `json:"created_at"`
}

func (i *ActivityLog) AfterSave(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}

func (i *ActivityLog) AfterDelete(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}