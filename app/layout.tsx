import './globals.css'
import type {Metadata} from 'next'
import {Providers} from "@/app/providers"

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
        <Providers>{children}</Providers>
        </body>
        </html>
    )
}
