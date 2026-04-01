package models

import "time"

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