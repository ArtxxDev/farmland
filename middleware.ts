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
        } else if (pathname === "/api/users") {
            return !req.nextauth.token || req.nextauth.token.role !== "admin" ?
                new NextResponse("Недостатньо прав.", {status: 403}) : NextResponse.next()
        } else if (pathname === "/api/table") {
            if (req.nextauth.token?.role !== "user" && req.nextauth.token?.role !== "admin") {
                return new NextResponse("Недостатньо прав.", {status: 403})
            }

            if (req.method === "PUT") {
                if (req.nextauth.token?.role !== "admin") {
                    return new NextResponse("Недостатньо прав.", {status: 403})
                }
            } else if (req.method === "DELETE") {
                if (req.nextauth.token?.role !== "admin") {
                    return new NextResponse("Недостатньо прав.", {status: 403})
                }
            }

            return NextResponse.next()
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
    matcher: ["/dashboard", "/login", "/register", "/api/table/", "/api/users/"]
}
