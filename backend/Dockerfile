# Pembangunan (Builder)
FROM golang:1.26-alpine AS builder

# direktori kerja di dalam kontainer
WORKDIR /app

#  file modul terlebih dahulu agar Docker bisa melakukan cache (lebih cepat)
COPY go.mod go.sum ./
RUN go mod download

# kode sumber Golang
COPY . .

# Kompilasi aplikasi menjadi satu file mesin (binary) bernama 'main'
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Produksi (Runner)
FROM alpine:latest

WORKDIR /app

# file 'main' yang sudah jadi dari Stage 1
COPY --from=builder /app/main .

# (Opsional) Salin file .env jika kamu menggunakan file fisik untuk environment
# COPY .env .

# port 8080 agar bisa diakses internet
EXPOSE 8080
CMD ["./main"]