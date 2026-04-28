package config

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB adalah variabel global untuk dipanggil dari file lain
var DB *gorm.DB

func ConnectDatabase() {
	// baca file .env
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ Info: File .env tidak ditemukan, menggunakan Environment Variable dari OS.")
	}

	var dsn string
	databaseUrl := os.Getenv("DATABASE_URL")

	if databaseUrl != "" {
		dsn = databaseUrl
		log.Println("☁️ Menghubungkan ke Cloud Database (Neon.tech)...")
	} else {
		dsn = "host=" + os.Getenv("DB_HOST") +
			" user=" + os.Getenv("DB_USER") +
			" password=" + os.Getenv("DB_PASSWORD") +
			" dbname=" + os.Getenv("DB_NAME") +
			" port=" + os.Getenv("DB_PORT") +
			" sslmode=disable"
		log.Println("💻 Menghubungkan ke Local Database...")
	}

	// koneksi menggunakan GORM
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Gagal koneksi ke database: ", err)
	}

	DB = database

	// CONNECTION POOLING (Mencegah Data Kosong/Flickering)
	sqlDB, err := DB.DB()
	if err == nil {
		// Mengatur berapa banyak koneksi yang tetap terbuka (standby)
		sqlDB.SetMaxIdleConns(10)
		
		sqlDB.SetMaxOpenConns(50)
		sqlDB.SetConnMaxLifetime(time.Minute * 30)
		
		log.Println("⚡ Connection Pool Berhasil Diaktifkan!")
	} else {
		log.Println("⚠️ Gagal mengatur Connection Pool:", err)
	}

	log.Println("✅ Koneksi PostgreSQL Berhasil!")
}