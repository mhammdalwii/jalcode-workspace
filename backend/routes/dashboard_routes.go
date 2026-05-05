package routes

import (
	"jalcode-api/controllers"
	"jalcode-api/middleware"

	"github.com/gin-gonic/gin"
)

func DashboardRoutes(r *gin.Engine) {
	r.GET("/api/dashboard-utama", middleware.RequireAuth, controllers.GetDashboardInit)
}