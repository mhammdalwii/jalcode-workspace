package models

import (
	"jalcode-api/config"
	"time"

	"gorm.io/gorm"
)

// Task merepresentasikan daftar pekerjaan (To-Do) di dalam sebuah proyek
type Task struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	ProjectID uint      `json:"project_id"` 
	Title     string    `json:"title"`     
	IsDone    bool      `json:"is_done" gorm:"default:false"` // Status centang (Selesai/Belum)
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (i *Task) AfterSave(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}


func (i *Task) AfterDelete(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}