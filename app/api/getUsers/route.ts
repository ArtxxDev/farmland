import prisma from "@/prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    try {
        const data = await prisma.user.findMany()
        return NextResponse.json(data, {
            status: 200,
        })
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to get users!" },
            {
                status: 500,
            }
        )
    }
}
