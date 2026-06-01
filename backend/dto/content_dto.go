package dto

import "time"

type ContentRequest struct {
	Title       string `json:"title" binding:"required"`
	Platform    []string `json:"platform" binding:"required"`
	Status      string `json:"status" binding:"required"`
	Pillar      string `json:"pillar" binding:"required"`  
	Priority    string `json:"priority" binding:"required"` 
	AssetURL    string `json:"asset_url"`       
	StartDate   string   `json:"start_date"`           
	PublishDate string `json:"publish_date"` 
	PicIDs      []uint `json:"pic_ids" binding:"required"` 
	Notes       string `json:"notes"`
}

type ContentResponse struct {
	ID          uint                 `json:"id"`
	Title       string               `json:"title"`
	Platform    []string             `json:"platform"`
	Status      string               `json:"status"`
	Pillar      string               `json:"pillar"`       
	Priority    string               `json:"priority"`     
	AssetURL    string               `json:"asset_url"`    
	StartDate   *time.Time           `json:"start_date"`
	PublishDate *time.Time           `json:"publish_date"`
	PICs        []TeamMemberResponse `json:"pics"` 
	Notes       string               `json:"notes"`
	CreatedAt   time.Time            `json:"created_at"`
}