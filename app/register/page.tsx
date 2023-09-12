"use client"

import Button from "@/app/components/Button"
import React, {ChangeEvent, useState} from "react"
import {signIn} from "next-auth/react"
import Input from "@/app/components/Input";

type FormValues = {
    email: string
    password: string
}

export default function Register() {
    const [formValues, setFormValues] = useState<FormValues>({
        email: "",
        password: "",
    })
    const [error, setError] = useState("")

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const result = await fetch("/api/register", {
                body: JSON.stringify(formValues),
                method: "POST"
            })

            if (result.ok) {
                await signIn("credentials", {
                    email: formValues.email,
                    password: formValues.password,
                    redirect: true,
                    callbackUrl: "/",
                })
            } else {
                const err = (await result.json()).message;
                err ? setError(err) : setError("Виникла непередбачена помилка.")
            }
        } catch (error: any) {
            setError(error)
        }
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setFormValues({...formValues, [name]: value});
    }

    return (
        <div className="relative overflow-hidden bg-cover bg-no-repeat p-12 h-screen w-screen"
             style={{backgroundImage: 'url("/bg.jpg")'}}
        >
            <div
                className="absolute bottom-0 left-0 right-0 top-0 h-full w-full overflow-hidden bg-fixed flex items-center justify-center"
                style={{backgroundColor: "rgba(0, 0, 0, 0.65"}}
            >
                {error && (
                    <p className="text-center bg-red-300 py-4 px-5 mb-6 rounded">{error}</p>
                )}
                <div
                    className="authForm border-t-8 rounded-sm border-indigo-600 bg-white pb-10 pt-6 px-12 shadow-3xl w-96">
                    <h2 className="font-bold text-center block text-2xl">Реєстрація</h2>
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
                        <Button value="submit">Зареєструватися</Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
