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
		clientGroup.POST("/:client_id/credentials", middleware.RequireAuth, controllers.CreateCredential)
		r.DELETE("/api/credentials/:id", middleware.RequireAuth, controllers.DeleteCredential)
		clientGroup.GET("/:client_id/credentials", middleware.RequireAuth, controllers.GetCredentials)
	}
}