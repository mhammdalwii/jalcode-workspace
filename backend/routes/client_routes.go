package routes

import (
	"jalcode-api/controllers"
	"jalcode-api/middleware"

	"github.com/gin-gonic/gin"
)

func SetupClientRoutes(r *gin.Engine) {
	clientGroup := r.Group("/api/clients", middleware.RequireAuth)
	{
		clientGroup.GET("/", controllers.GetClients)
		clientGroup.POST("/", middleware.RequireAdmin, controllers.CreateClient)
		clientGroup.PUT("/:id", middleware.RequireAdmin, controllers.UpdateClient)
		clientGroup.DELETE("/:id", middleware.RequireAdmin, controllers.DeleteClient)
	}
}