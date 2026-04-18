package routes

import (
	"jalcode-api/controllers"
	"jalcode-api/middleware"

	"github.com/gin-gonic/gin"
)

// AgencyRoutes mengatur endpoint untuk profil perusahaan
func AgencyRoutes(r *gin.Engine) {
	agencyGroup := r.Group("/api/agency")
	agencyGroup.Use(middleware.RequireAuth) 
	{
		agencyGroup.GET("/", controllers.GetAgencyProfile)
		agencyGroup.PUT("/", controllers.UpdateAgencyProfile)
	}
}