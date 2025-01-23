import bcrypt from "bcryptjs"

export async function encryptPassword(password:string):Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 12);
    return hashedPassword
}