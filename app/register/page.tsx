"use client"

import Button from "@/app/components/Button"
import TextBox from "@/app/components/TextBox"
import React, {useState} from "react"
import {signIn} from "next-auth/react"
// import {z} from "zod"
// import {FormDataSchema} from "@/constants/formDataSchema"
//
// type Inputs = z.infer<typeof FormDataSchema>

const RegisterPage = (e: React.FormEvent) => {
    const [formValues, setFormValues] = useState({
        email: "",
        password: "",
    })
    const [error, setError] = useState("")

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const result = await fetch("/api/register", {
                headers: {
                    "Content-Type": "application/json",
                },
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
    return (
        <form onSubmit={onSubmit}>
            <div className={
                    "flex flex-col justify-center items-center  h-screen bg-gradient-to-br gap-1 from-cyan-300 to-sky-600"
                }
            >
                {error && (
                    <p className="text-center bg-red-300 py-4 px-5 mb-6 rounded">{error}</p>
                )}
                <div className="px-7 py-4 shadow bg-white rounded-md flex flex-col gap-2">
                    <TextBox
                        labelText="Електронна пошта"
                        type="email"
                        name="email"
                        onChange={(e) => (formValues.email = e.target.value)}
                    />
                    <TextBox
                        labelText="Пароль"
                        type="password"
                        name="password"
                        onChange={(e) => (formValues.password = e.target.value)}
                    />
                    <Button type="submit">Зареєструватися</Button>
                </div>
            </div>
        </form>
    );
};

export default RegisterPage
