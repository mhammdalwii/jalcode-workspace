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
		menteeGroup.POST("/", middleware.RequireRoles("Founder", "Admin"), controllers.CreateMentee)
		menteeGroup.PUT("/:id", middleware.RequireRoles("Founder", "Admin"), controllers.UpdateMentee)
		menteeGroup.DELETE("/:id", middleware.RequireRoles("Founder", "Admin"), controllers.DeleteMentee)
	}
}