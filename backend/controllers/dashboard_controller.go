package controllers

import (
	"encoding/json"
	"jalcode-api/config"
	"jalcode-api/dto"
	"jalcode-api/models"
	"net/http"
	"strings"
	"sync" // 🚀 IMPORT SYNC UNTUK GOROUTINES
	"time"

	"github.com/gin-gonic/gin"
)

func GetDashboardInit(c *gin.Context) {
	// 🚀 CEK BRANKAS REDIS (CACHING)
	cacheKey := "dashboard_utama_data"

	if config.RDB != nil {
		cachedData, err := config.RDB.Get(config.Ctx, cacheKey).Result()
		if err == nil {
			var responseData map[string]interface{}
			json.Unmarshal([]byte(cachedData), &responseData)
			c.JSON(http.StatusOK, gin.H{
				"data":   responseData,
				"source": "redis_cache ⚡",
			})
			return
		}
	}

	// JIKA REDIS KOSONG, KITA TARIK DARI POSTGRESQL SECARA PARALEL! 🚀
	var teams []models.TeamMember
	var projects []models.Project
	var clients []models.Client
	var mentees []models.Mentee
	var contents []models.ContentPlan
	var invoices []models.Invoice
	var agency models.AgencyProfile
	var pricelists []models.Pricelist
	var categories []models.Category

	// 🚀 GUNAKAN WAITGROUP UNTUK MENARIK 9 TABEL SECARA BERSAMAAN!
	var wg sync.WaitGroup
	wg.Add(9)

	go func() { defer wg.Done(); config.DB.Find(&teams) }()
	go func() { defer wg.Done(); config.DB.Find(&clients) }()
	go func() { defer wg.Done(); config.DB.Find(&mentees) }()
	go func() { defer wg.Done(); config.DB.Limit(1).Find(&agency) }()
	go func() { defer wg.Done(); config.DB.Order("category asc").Find(&pricelists) }()
	go func() { defer wg.Done(); config.DB.Order("name asc").Find(&categories) }()
	go func() { defer wg.Done(); config.DB.Preload("TeamMembers").Preload("Client").Preload("Tasks").Preload("Attachments").Find(&projects) }()
	go func() { defer wg.Done(); config.DB.Preload("Items").Preload("Project").Preload("Project.Client").Find(&invoices) }()
	go func() { defer wg.Done(); config.DB.Preload("PICs").Order("created_at desc").Find(&contents) }()

	// Tunggu sampai kesembilan data selesai diambil...
	wg.Wait()

	// Bersihkan Tim
	var cleanTeams []gin.H
	for _, t := range teams {
		cleanTeams = append(cleanTeams, gin.H{
			"id": t.ID, "name": t.Name, "email": t.Email, "role": t.Role,
		})
	}

	// Bersihkan Project
	var cleanProjects []gin.H
	for _, p := range projects {
		var teamRes []gin.H
		for _, tm := range p.TeamMembers {
			teamRes = append(teamRes, gin.H{
				"id": tm.ID, "name": tm.Name, "email": tm.Email, "role": tm.Role,
			})
		}

		var clientData gin.H = nil
		if p.Client != nil {
			clientData = gin.H{
				"id": p.Client.ID, "company": p.Client.Company, "name": p.Client.Name,
				"address": p.Client.Address, "phone": p.Client.Phone,
			}
		}

		cleanProjects = append(cleanProjects, gin.H{
			"id": p.ID, "title": p.Title, "category": p.Category, "status": p.Status,
			"client_id": p.ClientID, "client": clientData, "team_members": teamRes,
			"tasks": p.Tasks, "attachments": p.Attachments,
			"created_at": p.CreatedAt, "updated_at": p.UpdatedAt,
		})
	}

	// Bersihkan Content
	var cleanContents []dto.ContentResponse
	for _, cItem := range contents {
		picsRes := []dto.TeamMemberResponse{}
		for _, pic := range cItem.PICs {
			picsRes = append(picsRes, dto.TeamMemberResponse{
				ID: pic.ID, Name: pic.Name, Role: pic.Role, Email: pic.Email,
			})
		}

		var platforms []string
		if cItem.Platform != "" {
			platforms = strings.Split(cItem.Platform, ", ")
		}

		cleanContents = append(cleanContents, dto.ContentResponse{
			ID: cItem.ID, Title: cItem.Title, Platform: platforms, Status: cItem.Status,
			Pillar: cItem.Pillar, Priority: cItem.Priority, AssetURL: cItem.AssetURL,
			StartDate: cItem.StartDate, PublishDate: cItem.PublishDate,
			PICs: picsRes, Notes: cItem.Notes, CreatedAt: cItem.CreatedAt,
		})
	}

	// Bersihkan Invoice
	var cleanInvoices []gin.H
	for _, inv := range invoices {
		clientName := "Klien Internal"
		if inv.Project.ClientID != nil {
			clientName = inv.Project.Client.Company
		}

		cleanInvoices = append(cleanInvoices, gin.H{
			"id": inv.ID, "invoice_number": inv.InvoiceNumber, "project_id": inv.ProjectID,
			"project_title": inv.Project.Title, "client_name": clientName, "amount": inv.Amount,
			"status": inv.Status, "issue_date": inv.IssueDate, "due_date": inv.DueDate,
			"service_type": inv.ServiceType, "notes": inv.Notes, "items": inv.Items,
			"created_at": inv.CreatedAt,
		})
	}

	finalData := gin.H{
		"teams":      cleanTeams,
		"projects":   cleanProjects,
		"clients":    clients,
		"mentees":    mentees,
		"contents":   cleanContents,
		"invoices":   cleanInvoices,
		"agency":     agency,
		"pricelists": pricelists,
		"categories": categories,
	}

	// Simpan ke Redis (Cache selama 5 menit)
	if config.RDB != nil {
		jsonBytes, errMarshal := json.Marshal(finalData)
		if errMarshal == nil {
			config.RDB.Set(config.Ctx, cacheKey, jsonBytes, 5*time.Minute)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   finalData,
		"source": "postgresql (paralel) 🐘⚡",
	})
}