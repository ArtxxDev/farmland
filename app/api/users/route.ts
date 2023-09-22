import prisma from "@/prisma/client"
import {NextRequest, NextResponse} from "next/server"
import {User} from "@prisma/client"

export async function GET(req: NextRequest) {
    try {
        const users: User[] = await prisma.user.findMany({
            orderBy: {
                id: 'asc'
            }
        })

        return NextResponse.json(
            users.map(({id, email, role}: User) => {
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

export async function PUT(req: NextRequest) {
    try {
        const user = await req.json()

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                email: user.email,
                role: user.role
            }
        })

        return new NextResponse(null, {status: 204});
    } catch (error) {
        return NextResponse.json(
            {error: "Failed to update user!"},
            {
                status: 500,
            }
        )
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const {id} = await req.json()

        await prisma.user.delete({
            where: {
                id
            },
        })

        return new NextResponse(null, {status: 204});
    } catch (error) {
        return NextResponse.json(
            {error: "Failed to delete user!"},
            {
                status: 500,
            }
        )
    }
}
