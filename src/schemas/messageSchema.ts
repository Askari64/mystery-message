import { z } from "zod"

export const messageSchema = z.object({
    message: z.string().min(12, "Message should be atleast 12 characters").max(200, "Message can not be more than 200 characters")
})