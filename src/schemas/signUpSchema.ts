import { z } from "zod"

export const userNameValidation = z.string().
    min(3, "Username can not be less than 3 characters").
    max(18, "Username can not be more than 18 characters").
    regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters");


export const signUpSchema = z.object({
    userName: userNameValidation,
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be atleast 8 characters" })
})