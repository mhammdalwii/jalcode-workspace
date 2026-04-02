package main

import (
	"jalcode-api/config"
	"jalcode-api/models"
	"jalcode-api/routes"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "jalcode-api/docs"
)

// @title Jalcode API Documentation
// @version 1.0
// @description REST API terpusat untuk sistem manajemen Tim dan Proyek Klien Jalcode.
// @host localhost:8080
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	// // Inisialisasi router Gin
	// r := gin.Default()

	// // Buat satu endpoint GET sederhana
	// r.GET("/api/ping", func(c *gin.Context) {
	// 	c.JSON(http.StatusOK, gin.H{
	// 		"message": "Halo! Server Go-mu sudah berjalan dengan lancar 🚀",
	// 	})
	// })

	config.ConnectDatabase()
	// config.DB.Migrator().DropTable(&models.Project{}, &models.TeamMember{})
	config.DB.AutoMigrate(&models.TeamMember{}, &models.Project{}, &models.Client{}, &models.Mentee{})
	

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		//  frontend Next.js/React yang biasanya jalan di port 3000
		// Jika nanti sudah deploy, ganti dengan domain aslimu (misal: "https://jalcode.com")
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour, 
	}))

	r.GET("/api/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Server Go berjalan lancar 🚀"})
	})

	// route tim di sini
	routes.SetupTeamRoutes(r)
	routes.SetupProjectRoutes(r)
	routes.SetupAuthRoutes(r)
	routes.SetupClientRoutes(r)
	routes.SetupMenteeRoutes(r)
	// r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	r.GET("/api/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	r.GET("/api/docs", func(c *gin.Context) {
		c.Redirect(http.StatusMovedPermanently, "/api/docs/index.html")
	})

	//  server di port 8080
	r.Run(":8080")
}