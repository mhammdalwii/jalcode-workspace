package models

import "time"

// TABEL 1: Rincian Daftar Fitur (Dynamic List)
type RequirementFeature struct {
	ID            uint   `json:"id" gorm:"primaryKey"`
	RequirementID uint   `json:"requirement_id"` // Foreign Key
	Title         string `json:"title"`          // Contoh: "Login OTP"
	Description   string `json:"description"`    // Contoh: "Login via WhatsApp"
}

// TABEL 2: Data Utama Analisis Kebutuhan Klien
type ProjectRequirement struct {
	ID                uint                 `json:"id" gorm:"primaryKey"`
	ProjectID         uint                 `json:"project_id" gorm:"unique"`
	BusinessGoal      string               `json:"business_goal" gorm:"type:text"`
	TargetAudience    string               `json:"target_audience"`
	DesignPreferences string               `json:"design_preferences" gorm:"type:text"`
	TechStack         string               `json:"tech_stack"`
	Notes             string               `json:"notes" gorm:"type:text"`
	Features          []RequirementFeature `json:"features" gorm:"foreignKey:RequirementID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	CreatedAt         time.Time            `json:"created_at"`
	UpdatedAt         time.Time            `json:"updated_at"`
}