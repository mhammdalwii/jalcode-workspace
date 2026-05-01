package models

import "time"

type ContentPlan struct {
	ID          uint         `json:"id" gorm:"primaryKey"`
	Title       string       `json:"title"`           // Contoh: "Cara Kerja Atomic Design di Next.js"
	Platform    string       `json:"platform"`        // Contoh: "Instagram", "Blog SEO", "LinkedIn"
	Status      string       `json:"status"`          // Contoh: "Ide", "Drafting", "Review", "Terjadwal", "Publish"
	PublishDate *time.Time   `json:"publish_date"`    // Tanggal tayang
	PICs        []TeamMember `json:"pics" gorm:"many2many:content_plan_pics;"` 
	Notes       string       `json:"notes"`
	CreatedAt   time.Time    `json:"created_at"`
}