package config

import (
	"context"
	"log"
	"os"

	"github.com/go-redis/redis/v8"
)

// RDB adalah variabel global agar bisa dipanggil dari controller mana saja
var RDB *redis.Client
var Ctx = context.Background()

func ConnectRedis() {
	redisHost := os.Getenv("REDIS_HOST")
	redisPort := os.Getenv("REDIS_PORT")
	redisPassword := os.Getenv("REDIS_PASSWORD")

	// Fallback ke localhost jika environment variable tidak ditemukan (untuk testing lokal)
	if redisHost == "" {
		redisHost = "localhost"
	}
	if redisPort == "" {
		redisPort = "6379"
	}

	RDB = redis.NewClient(&redis.Options{
		Addr:     redisHost + ":" + redisPort,
		Password: redisPassword, 
		DB:       0,             
	})

	// Coba PING ke Redis untuk memastikan koneksi sukses
	_, err := RDB.Ping(Ctx).Result()
	if err != nil {
		log.Fatal(" GAGAL TERHUBUNG KE REDIS:", err)
	} else {
		log.Println(" TERHUBUNG KE REDIS SERVER (Caching Ready!)")
	}
}