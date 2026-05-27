package routes

import (
	"jalcode-api/controllers"
	"jalcode-api/middleware"

	"github.com/gin-gonic/gin"
)

func SetupPricelistRoutes(r *gin.Engine) {
	// Wajib login untuk akses route ini
	pricelistGroup := r.Group("/api/pricelists", middleware.RequireAuth)
	{
		// Hanya Admin/Founder yang bisa tambah, edit, dan hapus katalog harga
		pricelistGroup.POST("/", middleware.RequireRoles("Founder", "Admin"), controllers.CreatePricelist)
		pricelistGroup.PUT("/:id", middleware.RequireRoles("Founder", "Admin"), controllers.UpdatePricelist)
		pricelistGroup.DELETE("/:id", middleware.RequireRoles("Founder", "Admin"), controllers.DeletePricelist)
	}
}