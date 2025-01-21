import { resend } from "@/lib/resend";
import VerificationEmail from "../../emailTemplates/VerificationMail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationMail(
    email: string,
    userName: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: `Askari <${process.env.SENDER_MAIL}>`,
            to: email,
            subject: 'Verification Email',
            react: VerificationEmail({ userName, verifyCode }),
          });

        return { success: true, message: `Verification mail sent successfully` }
    } catch (mailError) {
        console.error(`Error sending verification mail: ${mailError}`)
        return { success: false, message: `Could not send verification mail` }
    }
}