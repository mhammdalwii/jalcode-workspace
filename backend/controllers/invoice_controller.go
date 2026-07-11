package controllers

import (
	"fmt"
	"jalcode-api/config"
	"jalcode-api/dto"
	"jalcode-api/models"
	"jalcode-api/utils"
	"net/http"
	"strconv"
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
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
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
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
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
	if config.RDB != nil {
		config.RDB.Del(config.Ctx, "dashboard_utama_data")
	}
	c.JSON(http.StatusOK, gin.H{"message": "Tagihan berhasil dihapus"})
}

// @Summary Simpan Profit Sharing
// @Description Menyimpan riwayat pembagian komisi ke tim
// @Tags Invoices
// @Accept json
// @Produce json
// @Router /api/invoices/{id}/profit [post]
func SaveProfitSharing(c *gin.Context) {
	invoiceIDStr := c.Param("id")
	
	// Gunakan library bawaan "strconv" yang lebih aman
	importStrconv, errConv := strconv.ParseUint(invoiceIDStr, 10, 32)
	if errConv != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tagihan tidak valid"})
		return
	}
	invoiceID := uint(importStrconv)

	var req struct {
		Distributions []struct {
			MemberID uint    `json:"member_id"`
			Amount   float64 `json:"amount"`
		} `json:"distributions"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hapus catatan lama jika pernah dihitung ulang sebelumnya
	config.DB.Where("invoice_id = ?", invoiceID).Delete(&models.ProfitSharing{})

	// Cegah error GORM jika distribusi kosong
	if len(req.Distributions) == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "Tidak ada data untuk disimpan"})
		return
	}

	// Simpan data baru
	var profits []models.ProfitSharing
	for _, dist := range req.Distributions {
		profits = append(profits, models.ProfitSharing{
			InvoiceID: invoiceID,
			MemberID:  dist.MemberID,
			Amount:    dist.Amount,
			CreatedAt: time.Now(),
		})
	}

	// Cetak error ke terminal VPS jika gagal, agar kita tahu penyebab pastinya
	if err := config.DB.Create(&profits).Error; err != nil {
		fmt.Println("💥 ERROR DB CREATE PROFIT:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan profit sharing ke database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pembagian komisi berhasil dikunci!"})
}

func GetProfitSharing(c *gin.Context) {
	invoiceID := c.Param("id")
	var profits []models.ProfitSharing

	// Cari semua data pembagian komisi berdasarkan ID Invoice
	if err := config.DB.Where("invoice_id = ?", invoiceID).Find(&profits).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data komisi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": profits})
}