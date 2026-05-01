package dto

import "time"

// ContentRequest memvalidasi data yang dikirim dari Frontend
type ContentRequest struct {
	Title       string `json:"title" binding:"required"`
	Platform    string `json:"platform" binding:"required"`
	Status      string `json:"status" binding:"required"`
	PublishDate string `json:"publish_date"` // Format: YYYY-MM-DD
	PicIDs      []uint `json:"pic_ids" binding:"required"` 
	Notes       string `json:"notes"`
}

// ContentResponse adalah format data bersih yang dikirim ke Frontend
type ContentResponse struct {
	ID          uint                 `json:"id"`
	Title       string               `json:"title"`
	Platform    string               `json:"platform"`
	Status      string               `json:"status"`
	PublishDate *time.Time           `json:"publish_date"`
	PICs        []TeamMemberResponse `json:"pics"` 
	Notes       string               `json:"notes"`
	CreatedAt   time.Time            `json:"created_at"`
}