import dbConnect from "@/lib/dbConnect";
import UserModel, { User } from "@/model/User.model";
import { sendVerificationMail } from "@/helpers/sendVerificationMail";
import { encryptPassword } from "@/helpers/encryptPassword";

// Responses Start

const userNameAlreadyExistsResponse = Response.json(
  { success: false, message: "Username already exists" },
  { status: 400 }
);

const exisitngUserAlreadyVerifiedByEmail = Response.json(
  { success: false, message: "User already exists with this Email" },
  { status: 400 }
);

const emailResponseFailed = Response.json(
  { success: false, message: "Error: Failed to send Email" },
  { status: 500 }
);

const emailResponseSuccess = Response.json(
  {
    success: true,
    message: "User Registered Successfully. Please Verify Email",
  },
  { status: 201 }
);

const emailResponseError = Response.json(
  { success: false, message: "Error registering user" },
  { status: 500 }
);
//Responses End

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { userName, email, password } = await request.json();

    //Refactored
    if (await checkUserNameAlreadyExists(userName)) {
      return userNameAlreadyExistsResponse;
    }

    const existingUserByEmail = await findExistingUser(email);

    if (existingUserByEmail && existingUserByEmail.isVerified) {
      return exisitngUserAlreadyVerifiedByEmail;
    }

    const verificationCode = generateVerificationCode();

    if (existingUserByEmail) {
      updateExistingUser(existingUserByEmail, password, verificationCode);
    } else {
      createNewUser(userName, password, email, verificationCode);
    }

    //send verification mail

    const emailResponse = await sendVerificationMail(
      email,
      userName,
      verificationCode
    );

    if (!emailResponse.success) {
      return emailResponseFailed;
    }
    return emailResponseSuccess;
  } catch (error) {
    console.error("Error registering user", error);
    return emailResponseError;
  }
}

//Functions Start

async function findExistingUser(email: string): Promise<User | null> {
  return await UserModel.findOne({
    email,
  });
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function checkUserNameAlreadyExists(userName: string): Promise<boolean> {
  const existingUserVerifiedByUsername = await UserModel.findOne({
    userName,
    isVerified: true,
  });
  return (
    existingUserVerifiedByUsername != null &&
    existingUserVerifiedByUsername != undefined
  );
}

async function updateExistingUser(
  existingUserByEmail: User,
  password: string,
  verificationCode: string
) {
  const hashedPassword = encryptPassword(password);
  existingUserByEmail.password = await hashedPassword;
  existingUserByEmail.verifyCode = verificationCode;
  existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600);
  await existingUserByEmail.save();
}

async function createNewUser(
  userName: string,
  password: string,
  email: string,
  verificationCode: string
) {
  const hashedPassword = await encryptPassword(password);
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 1);

  const newUser = new UserModel({
    userName,
    email,
    password: hashedPassword,
    verifyCode: verificationCode,
    verifyCodeExpiry: expiryDate,
    isVerified: false,
    isAcceptingMessage: true,
    messages: [],
  });

  await newUser.save();
}

//Functions End
