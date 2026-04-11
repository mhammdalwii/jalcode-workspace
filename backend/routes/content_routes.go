package routes

import (
	"jalcode-api/controllers"
	"jalcode-api/middleware"

	"github.com/gin-gonic/gin"
)

// ContentRoutes mengatur semua endpoint terkait kalender konten internal
func ContentRoutes(r *gin.Engine) {
	//  grup rute khusus /api/contents yang diamankan dengan JWT
	contentGroup := r.Group("/api/contents")
	contentGroup.Use(middleware.RequireAuth)
	{
		contentGroup.GET("/", controllers.GetContents)
		contentGroup.POST("/", controllers.CreateContent)
		contentGroup.PUT("/:id", controllers.UpdateContent)
		contentGroup.DELETE("/:id", controllers.DeleteContent)
	}
}