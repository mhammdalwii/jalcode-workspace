package dto

import "time"

// AttachmentResponse mengatur data lampiran yang dikirim ke Frontend
type AttachmentResponse struct {
	ID        uint      `json:"id"`
	ProjectID uint      `json:"project_id"`
	FileName  string    `json:"file_name"`
	FileURL   string    `json:"file_url"`
	FileType  string    `json:"file_type"`
	CreatedAt time.Time `json:"created_at"`
}