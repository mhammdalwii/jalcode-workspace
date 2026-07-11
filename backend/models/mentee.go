package models

import (
	"jalcode-api/config"
	"time"

	"gorm.io/gorm"
)

// Mentee merepresentasikan peserta didik di program Jalcode Mentorship
type Mentee struct {
	ID        uint        `json:"id" gorm:"primaryKey"`
	Name      string      `json:"name" binding:"required"`
	Email     string      `json:"email"`
	Program   string      `json:"program" binding:"required"` 
	Status    string      `json:"status" binding:"required"` 
	MentorID  uint        `json:"mentor_id"`               
	Mentor    *TeamMember `json:"mentor,omitempty" gorm:"foreignKey:MentorID" binding:"-"`
	CreatedAt time.Time   `json:"created_at"`
	UpdatedAt time.Time   `json:"updated_at"`
}

func (i *Mentee) AfterSave(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}


func (i *Mentee) AfterDelete(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}