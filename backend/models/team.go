package models

import "time"

type TeamMember struct {
ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"type:varchar(100);not null" json:"name" binding:"required"`
	Role      string    `gorm:"type:varchar(50);not null" json:"role" binding:"required"` 
	Email     string    `gorm:"type:varchar(100);unique" json:"email" binding:"required,email"`
	Password  string    `gorm:"type:varchar(255);not null" json:"-"`
	Projects  []Project `gorm:"many2many:project_team_members;" json:"projects,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}