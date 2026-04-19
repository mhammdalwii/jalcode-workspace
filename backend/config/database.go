package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB adalah variabel global untuk dipanggil dari file lain
var DB *gorm.DB

func ConnectDatabase() {
	// baca file .env, tapi JANGAN gunakan log.Fatal.
	// Di server produksi (Docker/Render), file .env memang tidak ada, 
	// menggunakan Environment Variables bawaan server.
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ Info: File .env tidak ditemukan, menggunakan Environment Variable dari OS.")
	}

	var dsn string

	//  Cek apakah ada DATABASE_URL (Format URL panjang dari Neon.tech / Render)
	databaseUrl := os.Getenv("DATABASE_URL")

	if databaseUrl != "" {
		// Gunakan URL langsung jika berada di server / mode cloud
		dsn = databaseUrl
		log.Println("☁️ Menghubungkan ke Cloud Database (Neon.tech)...")
	} else {
		// Fallback ke localhost jika DATABASE_URL kosong
		dsn = "host=" + os.Getenv("DB_HOST") +
			" user=" + os.Getenv("DB_USER") +
			" password=" + os.Getenv("DB_PASSWORD") +
			" dbname=" + os.Getenv("DB_NAME") +
			" port=" + os.Getenv("DB_PORT") +
			" sslmode=disable"
		log.Println("💻 Menghubungkan ke Local Database...")
	}

	//  koneksi menggunakan GORM
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Gagal koneksi ke database: ", err)
	}

	DB = database
	log.Println("✅ Koneksi PostgreSQL Berhasil!")
}