"use client"

import Button from "@/app/components/Button"
import {signIn} from "next-auth/react"
import React, {ChangeEvent, useState} from "react"
import {useRouter} from "next/navigation"
import Input from "@/app/components/Input"
import {notifyError} from "@/app/utils/notifications"

type FormValues = {
    email: string
    password: string
}

export default function Login() {
    const router = useRouter()
    const [formValues, setFormValues] = useState<FormValues>({
        email: "",
        password: "",
    })

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            setFormValues({email: "", password: ""})

            const result = await signIn("credentials", {
                email: formValues.email,
                password: formValues.password,
                redirect: false,
                callbackUrl: "/",
            })

            if (!result?.error) {
                router.push("/")
                router.refresh()
            } else {
                notifyError("Невірна елетронна пошта або пароль.")
            }
        } catch (error: any) {
            notifyError(JSON.stringify(error))
        }
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setFormValues({ ...formValues, [name]: value })
    }

    return (
        <div className="relative overflow-hidden bg-cover bg-no-repeat p-12 h-screen w-screen"
             style={{backgroundImage: 'url("/bg.jpg")'}}
        >
            <div
                className="absolute bottom-0 left-0 right-0 top-0 h-full w-full overflow-hidden bg-fixed flex items-center justify-center"
                style={{backgroundColor: "rgba(0, 0, 0, 0.65"}}
            >
                <div
                    className="authForm border-t-8 rounded-sm border-indigo-600 bg-white pb-10 pt-6 px-12 shadow-3xl w-96">
                    <h2 className="font-bold text-center block text-2xl">Вхід</h2>
                    <form onSubmit={onSubmit}>
                        <Input
                            required
                            type="email"
                            id="email"
                            name="email"
                            label="Електронна пошта"
                            placeholder="email@example.com"
                            autofocus={true}
                            value={formValues.email}
                            onChange={handleChange}
                        />
                        <Input
                            required
                            type="password"
                            id="password"
                            name="password"
                            label="Пароль"
                            placeholder="••••••••••"
                            value={formValues.password}
                            onChange={handleChange}
                        />
                        <Button value="submit">Увійти</Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
