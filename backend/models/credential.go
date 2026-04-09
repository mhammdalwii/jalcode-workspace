package models

import "time"

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