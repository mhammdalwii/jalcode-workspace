package models

import (
	"jalcode-api/config"
	"time"

	"gorm.io/gorm"
)

// ini akan menjadi tabel 'projects'
type Project struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	Title        string     `gorm:"type:varchar(150);not null" json:"title" binding:"required"`
	Category     string     `gorm:"type:varchar(100)" json:"category" binding:"required"`
	Status       string     `gorm:"type:varchar(50)" json:"status" binding:"required"`
	TeamMembers []TeamMember `gorm:"many2many:project_team_members;" json:"team_members"`
	ClientID  *uint   `json:"client_id"` 
	Client    *Client `json:"client,omitempty" gorm:"foreignKey:ClientID" binding:"-"`
	Tasks []Task `json:"tasks" gorm:"foreignKey:ProjectID"`
	Attachments []Attachment `json:"attachments" gorm:"foreignKey:ProjectID"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

func (i *Project) AfterSave(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}


func (i *Project) AfterDelete(tx *gorm.DB) (err error) {
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	return
}