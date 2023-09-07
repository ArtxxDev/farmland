import {useSession} from "next-auth/react"
import {getServerSession} from "next-auth"
import authOptions from "@/app/api/auth/[...nextauth]/options"

export default async function Dashboard() {
    return <>Dashboard</>
}