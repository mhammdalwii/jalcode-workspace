package routes

import (
	"jalcode-api/controllers"
	"jalcode-api/middleware"

	"github.com/gin-gonic/gin"
)

func SetupCategoryRoutes(r *gin.Engine) {
	group := r.Group("/api/categories", middleware.RequireAuth)
	{
		group.POST("/", middleware.RequireRoles("Founder", "Admin"), controllers.CreateCategory)
		group.DELETE("/:id", middleware.RequireRoles("Founder", "Admin"), controllers.DeleteCategory)
	}
}