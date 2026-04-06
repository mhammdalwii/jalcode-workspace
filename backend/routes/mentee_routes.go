package routes

import (
	"jalcode-api/controllers"
	"jalcode-api/middleware"

	"github.com/gin-gonic/gin"
)

func SetupMenteeRoutes(r *gin.Engine) {
	menteeGroup := r.Group("/api/mentees", middleware.RequireAuth)
	{
		// Semua anggota tim bisa melihat daftar mentee
		menteeGroup.GET("/", controllers.GetMentees) 
		
		// Hanya Admin/Founder yang bisa kelola data mentee
		menteeGroup.POST("/", middleware.RequireAdmin, controllers.CreateMentee)
		menteeGroup.PUT("/:id", middleware.RequireAdmin, controllers.UpdateMentee)
		menteeGroup.DELETE("/:id", middleware.RequireAdmin, controllers.DeleteMentee)
	}
}