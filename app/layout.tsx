import './globals.css'
import type {Metadata} from 'next'
import {Session} from "@/app/components/providers/Session"
import QueryProvider from "@/app/components/providers/QueryProvider";
import {Toaster} from "react-hot-toast"

export const metadata: Metadata = {
    title: 'FarmLand',
    description: 'FarmLand'
}

export default function RootLayout({children}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <head>
            <link rel='icon' href='/favicon.png'/>
        </head>
        <body>
        <Session>
            <QueryProvider>
                {children}
                <Toaster/>
            </QueryProvider>
        </Session>
        </body>
        </html>
    )
}
