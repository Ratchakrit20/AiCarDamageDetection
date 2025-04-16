import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const sessionToken = req.cookies.get("next-auth.session-token") || req.cookies.get("__Secure-next-auth.session-token");

    // ✅ ให้ /register เข้าได้โดยไม่ต้องล็อกอิน
    const publicPaths = ["/login", "/register"];

    if (!sessionToken && !publicPaths.includes(req.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next(); // ให้โหลดหน้าต่อไปได้
}

// ✅ ใช้ Middleware กับทุกหน้า ยกเว้น API, `_next`, และ `favicon.ico`
export const config = {
    matcher: ["/((?!api|_next|favicon.ico).*)"],
};
