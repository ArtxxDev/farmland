import prisma from "@/prisma/client"
import {NextRequest, NextResponse} from "next/server"
import {User} from "@prisma/client"

export async function GET(req: NextRequest) {
    try {
        const data: User[] = await prisma.user.findMany()
        return NextResponse.json(
            data.map(({id, email, role}: User) => {
                return {id, email, role}
            }), {status: 200})
    } catch (error) {
        return NextResponse.json(
            {error: "Failed to get users!"},
            {
                status: 500,
            }
        )
    }
}
