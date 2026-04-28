package main

import (
	"jalcode-api/config"
	"jalcode-api/models"
	"jalcode-api/routes"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"golang.org/x/crypto/bcrypt"

	_ "jalcode-api/docs"
)

// @title Jalcode API Documentation
// @version 1.0
// @description REST API terpusat untuk sistem manajemen Tim dan Proyek Klien Jalcode.
// @host api.jalcode.id
// @BasePath /
// @schemes https http
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	config.ConnectDatabase()
	// config.DB.Migrator().DropTable(&models.Project{}, &models.TeamMember{}, "project_team_members")
	config.DB.AutoMigrate(&models.TeamMember{}, &models.Project{}, &models.Client{}, &models.Mentee{}, &models.Task{}, &models.Attachment{}, &models.Credential{}, &models.ActivityLog{}, &models.ContentPlan{}, &models.Invoice{}, &models.AgencyProfile{})
	
	var count int64
	config.DB.Model(&models.TeamMember{}).Count(&count)
	if count == 0 {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("jalcode123"), bcrypt.DefaultCost)
		
		admin := models.TeamMember{
			Name:     "Muhammad Alwi",
			Email:    "admin@jalcode.com",
			Password: string(hashedPassword),
			Role:     "Founder",
		}
		
		if err := config.DB.Create(&admin).Error; err != nil {
			log.Println("⚠️ Gagal membuat akun default:", err)
		} else {
			log.Println("✅ Akun Founder default berhasil disuntikkan ke Database Neon!")
		}
	}

	r := gin.Default()
	r.Static("/uploads", "./uploads")

	r.Use(cors.New(cors.Config{
		//  frontend Next.js/React yang biasanya jalan di port 3000
		// Jika nanti sudah deploy, ganti dengan domain aslimu (misal: "https://jalcode.com")
		AllowOrigins:     []string{"http://localhost:3000", "https://jalcode-workspace.vercel.app", "https://workspace.jalcode.id"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour, 
	}))

	r.GET("/api/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Server Go berjalan lancar! Robot CI/CD Versi 2 Aktif 🔥"})
	})

	// route tim 
	routes.SetupTeamRoutes(r)
	routes.SetupProjectRoutes(r)
	routes.SetupAuthRoutes(r)
	routes.SetupClientRoutes(r)
	routes.SetupMenteeRoutes(r)
	routes.SetupTaskRoutes(r)
	routes.ContentRoutes(r)
	routes.InvoiceRoutes(r)
	routes.AgencyRoutes(r)
	
	// r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	r.GET("/api/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	r.GET("/api/docs", func(c *gin.Context) {
		c.Redirect(http.StatusMovedPermanently, "/api/docs/index.html")
	})

	//  server di port 8080
	r.Run(":8080")
}