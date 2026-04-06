package models

import "time"

// Task merepresentasikan daftar pekerjaan (To-Do) di dalam sebuah proyek
type Task struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	ProjectID uint      `json:"project_id"` 
	Title     string    `json:"title"`     
	IsDone    bool      `json:"is_done" gorm:"default:false"` // Status centang (Selesai/Belum)
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}