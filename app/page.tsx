import {getServerSession} from "next-auth"
import authOptions from "@/app/api/auth/[...nextauth]/options"
import Guest from "@/app/components/Guest"
import Link from "next/link"
import dynamic from "next/dynamic"

const Table = dynamic(() => import('@/app/components/Table'), { ssr: false })

export default async function Home() {
    const session = await getServerSession(authOptions)

    return (
        <>
            {session?.user.role === "user" || session?.user.role === "admin" ? (
                <Table/>
            ) : session?.user.role === "guest" ? (
                <Guest/>
            ) : (
                <div className="flex items-center justify-center h-screen">
                    <Link href="/login" className="px-8 py-4 m-4 bg-blue-400 rounded text-white">Вхід</Link>
                    <Link href="/register" className="px-8 py-4 m-4 bg-indigo-600 rounded text-white">Реєстрація</Link>
                </div>
            )}
        </>
    )
}
