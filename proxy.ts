import { getSessionCookie } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
    const sessionCookie = getSessionCookie(request)
    const { pathname, search } = request.nextUrl
    
    // Protect cashier and manager routes
    const isProtected = pathname.startsWith('/cashier') || pathname.startsWith('/manager')

    if (isProtected && !sessionCookie) {
        const redirectTo = pathname + search
        return NextResponse.redirect(
            new URL(`/auth/sign-in?redirectTo=${redirectTo}`, request.url)
        )
    }

    // Note: To properly enforce PENDING status at the proxy level without making a DB call
    // on every edge request, we will rely on route-level layouts for the explicit PENDING redirect,
    // but we ensure the user is logged in first here.

    return NextResponse.next()
}

export const config = {
    // Protected routes
    matcher: ["/cashier/:path*", "/manager/:path*", "/account/:path*"]
}