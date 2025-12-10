import { signIn } from "@/auth";
import { fetchUserByRole } from "@/hooks/user";
import { verifyPassword } from "@/lib/bcryptjs";
import { userType } from "@/types/common";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { role, email, password } = await request.json();

    if (!email || !password) {
      return new NextResponse("Missing fields", { status: 400 });
    }
    const roleUpperCase = userType[role].toUpperCase() || "ADMIN";
    console.log(roleUpperCase);

    const checkUserExist = await fetchUserByRole(roleUpperCase as Role, email);
    if (!checkUserExist) {
      return new NextResponse("User doesn't exist on the system", {
        status: 404,
      });
    }

    const verifyPass = await verifyPassword(password, checkUserExist.password);
    if (!verifyPass) {
      return new NextResponse("Invalid password", {
        status: 401,
      });
    }

    await signIn("credentials", {
      redirect: false,
      email,
      password,
      role: roleUpperCase,
    });

    return new NextResponse("Login Success", { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
