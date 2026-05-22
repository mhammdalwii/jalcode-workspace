package controllers

import (
	"fmt"
	"jalcode-api/config"
	"jalcode-api/dto"
	"jalcode-api/models"
	"jalcode-api/utils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Helper untuk parse tanggal
func parseDateStr(dateStr string) *time.Time {
	if dateStr == "" {
		return nil
	}
	parsed, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return nil
	}
	return &parsed
}

// @Summary Ambil semua invoice
// @Description Mengambil daftar tagihan pembayaran
// @Tags Invoices
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/invoices/ [get]
func GetInvoices(c *gin.Context) {
	var invoices []models.Invoice
	// 🚀 PRELOAD ITEMS DITAMBAHKAN
	if err := config.DB.Preload("Items").Preload("Project").Preload("Project.Client").Order("created_at desc").Find(&invoices).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data tagihan"})
		return
	}

	var response []dto.InvoiceResponse
	for _, inv := range invoices {
		clientName := "-"
		if inv.Project.ClientID != nil {
			clientName = inv.Project.Client.Company
		}

		// 🚀 MAPPING ITEMS KE RESPONSE
		var itemsRes []dto.InvoiceItemResponse
		for _, item := range inv.Items {
			itemsRes = append(itemsRes, dto.InvoiceItemResponse{
				ID:          item.ID,
				Description: item.Description,
				Quantity:    item.Quantity,
				Price:       item.Price,
				Total:       item.Total,
			})
		}

		response = append(response, dto.InvoiceResponse{
			ID:            inv.ID,
			InvoiceNumber: inv.InvoiceNumber,
			ProjectID:     inv.ProjectID,
			ProjectTitle:  inv.Project.Title,
			ClientName:    clientName,
			Amount:        inv.Amount,
			Status:        inv.Status,
			IssueDate:     &inv.IssueDate,
			DueDate:       &inv.DueDate,
			ServiceType:   inv.ServiceType,
			Notes:         inv.Notes,
			Items:         itemsRes, 
			CreatedAt:     inv.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": response})
}

// @Summary Buat invoice baru
// @Description Membuat tagihan baru dengan nomor urut otomatis
// @Tags Invoices
// @Accept json
// @Produce json
// @Param body body dto.InvoiceRequest true "Data Invoice"
// @Success 201 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/invoices/ [post]
func CreateInvoice(c *gin.Context) {
	var req dto.InvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var count int64
	today := time.Now().Format("20060102")
	config.DB.Model(&models.Invoice{}).Where("invoice_number LIKE ?", "INV-"+today+"%").Count(&count)
	invoiceNumber := fmt.Sprintf("INV-%s-%03d", today, count+1)

	issueDate := parseDateStr(req.IssueDate)
	if issueDate == nil {
		now := time.Now()
		issueDate = &now
	}
	
	dueDate := parseDateStr(req.DueDate)
	if dueDate == nil {
		defaultDue := time.Now().AddDate(0, 0, 14)
		dueDate = &defaultDue
	}

	// 🚀 KONVERSI DTO KE MODEL ITEMS
	var newItems []models.InvoiceItem
	for _, itemReq := range req.Items {
		newItems = append(newItems, models.InvoiceItem{
			Description: itemReq.Description,
			Quantity:    itemReq.Quantity,
			Price:       itemReq.Price,
			Total:       itemReq.Total,
		})
	}

	invoice := models.Invoice{
		InvoiceNumber: invoiceNumber,
		ProjectID:     req.ProjectID,
		Amount:        req.Amount,
		Status:        req.Status,
		IssueDate:     *issueDate,
		DueDate:       *dueDate,
		ServiceType:   req.ServiceType,
		Notes:         req.Notes,
		Items:         newItems, 
	}

	config.DB.Create(&invoice)

	if userIDObj, exists := c.Get("id"); exists {
		var userID uint
		switch v := userIDObj.(type) {
		case float64: userID = uint(v)
		case uint: userID = v
		}
		utils.LogActivity(userID, "Menerbitkan tagihan baru", invoiceNumber)
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Tagihan berhasil diterbitkan!", "data": invoice})
}

// @Summary Update status pembayaran
// @Description Memperbarui nominal atau status tagihan (misal dari Unpaid jadi Paid)
// @Tags Invoices
// @Accept json
// @Produce json
// @Param id path string true "ID Invoice"
// @Param body body dto.InvoiceRequest true "Data Update"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/invoices/{id} [put]
func UpdateInvoice(c *gin.Context) {
	id := c.Param("id")
	var invoice models.Invoice

	if err := config.DB.First(&invoice, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tagihan tidak ditemukan"})
		return
	}

	oldStatus := invoice.Status
	var req dto.InvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	invoice.Amount = req.Amount
	invoice.Status = req.Status
	invoice.ServiceType = req.ServiceType 
	invoice.Notes = req.Notes

	if iDate := parseDateStr(req.IssueDate); iDate != nil { invoice.IssueDate = *iDate }
	if dDate := parseDateStr(req.DueDate); dDate != nil { invoice.DueDate = *dDate }

	// 🚀 HAPUS ITEMS LAMA & GANTI DENGAN YANG BARU (Agar sinkron jika ada yang dihapus di frontend)
	config.DB.Where("invoice_id = ?", invoice.ID).Delete(&models.InvoiceItem{})

	var updatedItems []models.InvoiceItem
	for _, itemReq := range req.Items {
		updatedItems = append(updatedItems, models.InvoiceItem{
			InvoiceID:   invoice.ID, // Hubungkan manual
			Description: itemReq.Description,
			Quantity:    itemReq.Quantity,
			Price:       itemReq.Price,
			Total:       itemReq.Total,
		})
	}
	invoice.Items = updatedItems

	config.DB.Save(&invoice)

	if userIDObj, exists := c.Get("id"); exists {
		var userID uint
		switch v := userIDObj.(type) {
		case float64: userID = uint(v)
		case uint: userID = v
		}
		if oldStatus != invoice.Status {
			utils.LogActivity(userID, "Mengubah status pembayaran", invoice.InvoiceNumber+" menjadi "+invoice.Status)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tagihan diperbarui!"})
}

// @Summary Hapus tagihan
// @Description Menghapus data invoice yang salah
// @Tags Invoices
// @Produce json
// @Param id path string true "ID Invoice"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/invoices/{id} [delete]
func DeleteInvoice(c *gin.Context) {
	id := c.Param("id")
	var invoice models.Invoice

	if err := config.DB.First(&invoice, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tagihan tidak ditemukan"})
		return
	}

	// GORM otomatis menghapus items karena ada constraint OnDelete:CASCADE
	config.DB.Delete(&invoice)
	c.JSON(http.StatusOK, gin.H{"message": "Tagihan berhasil dihapus"})
}