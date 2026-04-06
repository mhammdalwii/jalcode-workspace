package models

import "time"

// ini akan menjadi tabel 'projects'
type Project struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	Title        string     `gorm:"type:varchar(150);not null" json:"title" binding:"required"`
	Category     string     `gorm:"type:varchar(100)" json:"category" binding:"required"`
	Status       string     `gorm:"type:varchar(50)" json:"status" binding:"required"`
	TeamMemberID uint       `json:"team_member_id" binding:"required"` 
	TeamMember   TeamMember `gorm:"foreignKey:TeamMemberID" json:"team_member" binding:"-"`
	ClientID  *uint   `json:"client_id"` 
	Client    *Client `json:"client,omitempty" gorm:"foreignKey:ClientID" binding:"-"`
	Tasks []Task `json:"tasks" gorm:"foreignKey:ProjectID"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}