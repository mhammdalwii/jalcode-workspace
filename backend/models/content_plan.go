package models

import "time"

type ContentPlan struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	Title        string     `json:"title"`            // Contoh: "Cara Kerja Atomic Design di Next.js"
	Platform     string     `json:"platform"`         // Contoh: "Instagram", "Blog SEO", "LinkedIn"
	Status       string     `json:"status"`           // Contoh: "Ide", "Drafting", "Review", "Terjadwal", "Publish"
	PublishDate  *time.Time `json:"publish_date"`     // Tanggal tayang
	TeamMemberID uint       `json:"team_member_id"`   // Siapa yang bertugas buat konten ini?
	PIC          TeamMember `json:"pic" gorm:"foreignKey:TeamMemberID"`
	Notes        string     `json:"notes"`
	CreatedAt    time.Time  `json:"created_at"`
}