import {withAuth, NextRequestWithAuth} from "next-auth/middleware"
import {NextResponse} from "next/server"

// @ts-ignore
export default withAuth(
    function middleware(req: NextRequestWithAuth) {
        const {pathname} = req.nextUrl
        if (pathname === "/login" || pathname === "/register") {
            return req.nextauth.token ?
                NextResponse.redirect(new URL('/', req.url)) : NextResponse.next()
        } else if (pathname === "/dashboard") {
            return !req.nextauth.token || req.nextauth.token.role !== "admin" ?
                NextResponse.redirect(new URL('/', req.url)) : NextResponse.next()
        }
    }, {
        callbacks: {
            authorized({req, token}) {
                if (req.url.includes("/login") || req.url.includes("/register")) {
                    return true
                }
            }
        }
    }
)

export const config = {
    matcher: ["/dashboard", "/login", "/register", "/api/getTable/", "/api/getUsers/"]
}
