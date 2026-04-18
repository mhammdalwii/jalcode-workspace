package routes

import (
	"jalcode-api/controllers"
	"jalcode-api/middleware"

	"github.com/gin-gonic/gin"
)

func InvoiceRoutes(r *gin.Engine) {
	invoiceGroup := r.Group("/api/invoices")
	invoiceGroup.Use(middleware.RequireAuth)
	{
		invoiceGroup.GET("/", controllers.GetInvoices)
		invoiceGroup.POST("/", controllers.CreateInvoice)
		invoiceGroup.PUT("/:id", controllers.UpdateInvoice)
		invoiceGroup.DELETE("/:id", controllers.DeleteInvoice)
	}
}