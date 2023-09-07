"use client"

import Button from "@/app/components/Button"
import TextBox from "@/app/components/TextBox"
import {signIn} from "next-auth/react"
import React, {ChangeEvent, useState} from "react"
import {useRouter} from "next/navigation"
// import {z} from "zod"
// import {FormDataSchema} from "@/constants/formDataSchema"
//
// type Inputs = z.infer<typeof FormDataSchema>

const LoginPage = () => {
    const router = useRouter()
    const [formValues, setFormValues] = useState({
        email: "",
        password: "",
    })
    const [error, setError] = useState("")

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
                setError("Невірна елетронна пошта або пароль")
            }
        } catch (error: any) {
            setError(error)
        }
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormValues({ ...formValues, [name]: value });
    };

    return (
        <form onSubmit={onSubmit}>
            <div
                className={
                    "flex flex-col justify-center items-center  h-screen bg-gradient-to-br gap-1 from-cyan-300 to-sky-600"
                }
            >
                {error && (
                    <p className="text-center bg-red-300 py-4 px-5 mb-6 rounded">{error}</p>
                )}
                <div className="px-7 py-4 shadow bg-white rounded-md flex flex-col gap-2">
                    <TextBox
                        required
                        labelText="Електронна пошта"
                        type="email"
                        name="email"
                        value={formValues.email}
                        onChange={handleChange}
                    />
                    <TextBox

                        labelText="Пароль"
                        type="password"
                        name="password"
                        value={formValues.password}
                        onChange={handleChange}
                    />
                    <Button type="submit">Увійти</Button>
                </div>
            </div>
        </form>
    );
};

export default LoginPage;
