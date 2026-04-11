package dto

import "time"

// ContentRequest memvalidasi data yang dikirim dari Frontend
type ContentRequest struct {
	Title        string `json:"title" binding:"required"`
	Platform     string `json:"platform" binding:"required"`
	Status       string `json:"status" binding:"required"`
	PublishDate  string `json:"publish_date"` // Format: YYYY-MM-DD
	TeamMemberID uint   `json:"team_member_id" binding:"required"`
	Notes        string `json:"notes"`
}

// ContentResponse adalah format data bersih yang dikirim ke Frontend
type ContentResponse struct {
	ID          uint               `json:"id"`
	Title       string             `json:"title"`
	Platform    string             `json:"platform"`
	Status      string             `json:"status"`
	PublishDate *time.Time         `json:"publish_date"`
	PIC         TeamMemberResponse `json:"pic"` // Menggunakan relasi dari TeamMemberResponse yang sudah ada
	Notes       string             `json:"notes"`
	CreatedAt   time.Time          `json:"created_at"`
}