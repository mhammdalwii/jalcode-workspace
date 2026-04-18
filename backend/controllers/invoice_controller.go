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
	// Kita tarik juga data Project dan Client di dalamnya
	if err := config.DB.Preload("Project").Preload("Project.Client").Order("created_at desc").Find(&invoices).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data tagihan"})
		return
	}

	var response []dto.InvoiceResponse
	for _, inv := range invoices {
		clientName := "-"
		if inv.Project.ClientID != nil {
			clientName = inv.Project.Client.Company
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

	// Buat Auto-Generated Invoice Number (Format: INV-YYYYMMDD-ID)
	// Kita hitung jumlah invoice hari ini untuk nomor urut
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
		defaultDue := time.Now().AddDate(0, 0, 14) // Default 14 hari
		dueDate = &defaultDue
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
	}

	config.DB.Create(&invoice)

	// Catat di Audit Trail
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

	config.DB.Delete(&invoice)
	c.JSON(http.StatusOK, gin.H{"message": "Tagihan berhasil dihapus"})
}