import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";
import { sendVerificationMail } from "@/helpers/sendVerificationMail";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { userName, email, password } = await request.json();

        const existingUserVerifiedByUsername = await UserModel.findOne({
            userName,
            isVerified: true,
        });

        if (existingUserVerifiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username already exists",
                },
                {
                    status: 400,
                }
            );
        }

        const existingUserByEmail = await UserModel.findOne({
            email,
        });

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: 'User already exists with this Email'
                }, {
                    status: 400
                })
            }
            else {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600)
                await existingUserByEmail.save()
            }
        } else {
            // if user is not found then we create new user
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                userName,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save()

        }

        //send verification mail

        const emailResponse = await sendVerificationMail(email, userName, verifyCode)
        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {
                status: 500
            })
        }
        return Response.json({
            success: true,
            message: 'User Registered Successfully. Please Verify Email'
        }, {
            status: 201
        })
    } catch (error) {
        console.error("Error registering user", error);
        return Response.json(
            {
                success: false,
                message: "Error registering user",
            },
            {
                status: 500,
            }
        );
    }
}
