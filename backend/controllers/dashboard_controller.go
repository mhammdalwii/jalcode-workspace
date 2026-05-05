package controllers

import (
	"jalcode-api/config"
	"jalcode-api/dto"
	"jalcode-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetDashboardInit(c *gin.Context) {
	var teams []models.TeamMember
	var projects []models.Project
	var clients []models.Client
	var mentees []models.Mentee
	var contents []models.ContentPlan
	var invoices []models.Invoice
	var agency models.AgencyProfile

	// 1. Tarik Data Dasar
	config.DB.Find(&teams)
	config.DB.Find(&clients)
	config.DB.Find(&mentees)
	config.DB.Find(&invoices)
	config.DB.Limit(1).Find(&agency)

	// 2. Tarik Data Relasi
	config.DB.Preload("TeamMembers").Find(&projects)
	config.DB.Preload("PICs").Order("created_at desc").Find(&contents)

	// =========================================================
	// 🚀 ZONA PEMBERSIHAN INFINITE LOOP (SANGAT PENTING!)
	// =========================================================

	// A. Bersihkan Tim (Buang Password)
	var cleanTeams []gin.H
	for _, t := range teams {
		cleanTeams = append(cleanTeams, gin.H{
			"id": t.ID, "name": t.Name, "email": t.Email, "role": t.Role,
		})
	}

	// B. Bersihkan Project (Putus relasi balik dari TeamMembers)
	var cleanProjects []gin.H
	for _, p := range projects {
		var teamRes []gin.H
		for _, tm := range p.TeamMembers {
			teamRes = append(teamRes, gin.H{
				"id": tm.ID, "name": tm.Name, "email": tm.Email, "role": tm.Role,
			})
		}
		cleanProjects = append(cleanProjects, gin.H{
			"id":           p.ID,
			"title":        p.Title,
			"category":     p.Category,
			"status":       p.Status,
			"client_id":    p.ClientID,
			"team_members": teamRes, // Hanya masukkan data tim yang sudah bersih
			"created_at":   p.CreatedAt,
			"updated_at":   p.UpdatedAt,
		})
	}

	// C. Bersihkan Content (Sesuai kode Kapten sebelumnya)
	var cleanContents []dto.ContentResponse
	for _, cItem := range contents {
		picsRes := []dto.TeamMemberResponse{}
		for _, pic := range cItem.PICs {
			picsRes = append(picsRes, dto.TeamMemberResponse{
				ID: pic.ID, Name: pic.Name, Role: pic.Role, Email: pic.Email,
			})
		}
		cleanContents = append(cleanContents, dto.ContentResponse{
			ID: cItem.ID, Title: cItem.Title, Platform: cItem.Platform,
			Status: cItem.Status, PublishDate: cItem.PublishDate,
			PICs: picsRes, Notes: cItem.Notes, CreatedAt: cItem.CreatedAt,
		})
	}

	// 3. KIRIM JSON (Tanpa menggunakan struktur DTO mentah)
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"teams":    cleanTeams,
			"projects": cleanProjects,
			"clients":  clients,
			"mentees":  mentees,
			"contents": cleanContents,
			"invoices": invoices,
			"agency":   agency,
		},
	})
}