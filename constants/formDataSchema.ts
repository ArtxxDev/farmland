import {z} from "zod"

export const FormDataSchema = z.object({
    email: z
        .string()
        .email({message: "Invalid email address."})
        .min(5, {message: "Email should be at least 5 characters."}),
    password: z
        .string()
        .min(6, {message: "Password should be at least 6 characters."})
})
