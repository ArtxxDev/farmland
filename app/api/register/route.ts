import prisma from "@/prisma/client";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";



export async function POST(req: Request) {
    try {
        const { email, password } = (await req.json()) as {
            email: string;
            password: string;
        }

        const isUserExists = await prisma.user.findUnique({
            where: {email}
        })

        if (isUserExists) {
            return NextResponse.json({
                message: "Електронна пошта вже існує.",
            }, {status: 409})
        }

        const hashedPassword = await hash(password, 12)

        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
            },
        })

        return NextResponse.json({
            user: {
                email: user.email,
            },
        })
    } catch (error: any) {
        return new NextResponse(
            JSON.stringify({
                message: error.message,
            }),
            { status: 500 }
        );
    }
}
