package models

import "time"

// TABEL 1: Daftar Tugas (Action Items) dari hasil rapat
type MeetingActionItem struct {
	ID        uint        `json:"id" gorm:"primaryKey"`
	MeetingID uint        `json:"meeting_id"`
	Task      string      `json:"task"`
	PICID     uint        `json:"pic_id"` 
	PIC       *TeamMember `json:"pic,omitempty" gorm:"foreignKey:PICID"`
	IsDone    bool        `json:"is_done" gorm:"default:false"` 
}

// TABEL 2: Catatan Utama Rapat
type MeetingNote struct {
	ID          uint                `json:"id" gorm:"primaryKey"`
	ProjectID   *uint               `json:"project_id" gorm:"index"`
	Title       string              `json:"title"`                 
	Date        time.Time           `json:"date"`
	Notes       string              `json:"notes" gorm:"type:text"` 
	ActionItems []MeetingActionItem `json:"action_items" gorm:"foreignKey:MeetingID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
}