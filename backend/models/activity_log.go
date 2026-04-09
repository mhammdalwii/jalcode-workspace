package models

import "time"

// ActivityLog mencatat setiap aktivitas penting di dalam sistem
type ActivityLog struct {
	ID        uint       `json:"id" gorm:"primaryKey"`
	UserID    uint       `json:"user_id"`
	User      TeamMember `json:"user" gorm:"foreignKey:UserID"` // Relasi untuk tahu nama pelakunya
	Action    string     `json:"action"`                        // Contoh: "Memindahkan status proyek"
	Target    string     `json:"target"`                        // Contoh: "Aplikasi E-Commerce ke Selesai"
	CreatedAt time.Time  `json:"created_at"`
}