package routes

import (
	"jalcode-api/controllers"
	"jalcode-api/middleware"

	"github.com/gin-gonic/gin"
	// "jalcode-api/controllers"
	// "jalcode-api/middleware"
)

func SetupMenteeRoutes(r *gin.Engine) {
	menteeGroup := r.Group("/api/mentees", middleware.RequireAuth)
	{
		menteeGroup.GET("/", controllers.GetMentees)
		menteeGroup.POST("/", controllers.CreateMentee)
		menteeGroup.PUT("/:id", controllers.UpdateMentee)
		menteeGroup.DELETE("/:id", controllers.DeleteMentee)
	}
}