import type {NextAuthOptions} from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/prisma/client";
import {compare} from "bcrypt";
import {User} from "@prisma/client";

const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt"
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "text",
                    placeholder: "example@example.com",
                },
                password: {
                    label: "Password",
                    type: "password",
                    placeholder: "Password",
                },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })

                if (!user) {
                    return null
                }

                const isPasswordValid = await compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id + "",
                    email: user.email,
                    role: user.role,
                }

            }
        })
    ],

    callbacks: {
        // @ts-ignore
        async session({token, trigger, session}) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    role: token.role,
                }
            }
        },
        async jwt({token, user, session}) {
            const dbUser = await prisma.user.findFirst({
                where: {
                    // @ts-ignore
                    email: token.email
                }
            })

            if (!dbUser) {
                const u = user as unknown as User
                return {
                    ...token,
                    id: u.id,
                    role: u.role
                }
            }

            return {
                id: dbUser.id,
                email: dbUser.email,
                role: dbUser.role
            }
        },
    },

    pages: {
        signIn: "/login"
    },
    secret: process.env.NEXTAUTH_SECRET,
}

export default authOptions
