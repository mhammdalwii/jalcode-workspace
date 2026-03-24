import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Ambil token JWT dari Cookies browser
  const token = request.cookies.get("token")?.value;

  //  halaman apa yang sedang ingin dibuka oleh user
  const isLoginPage = request.nextUrl.pathname === "/login";

  //  User belum login, tapi mencoba masuk ke halaman utama (Dashboard)
  if (!token && !isLoginPage) {
    // Tendang kembali ke halaman Login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // User sudah login, tapi malah iseng buka halaman Login lagi
  if (token && isLoginPage) {
    // Arahkan langsung ke Dashboard
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Jika semua aman, persilakan lanjut
  return NextResponse.next();
}

// Konfigurasi: Tentukan halaman mana saja yang harus dijaga oleh satpam ini
export const config = {
  // Jaga semua rute, KECUALI file statis Next.js, gambar, dan favicon
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
