import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const data = await prisma.table.findMany();
        return NextResponse.json(data, {
            status: 200,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to get table!" },
            {
                status: 500,
            }
        );
    }
}
