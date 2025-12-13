import { hashPassword } from "@/lib/bcryptjs";
import prisma from "@/lib/db";
import { userType } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      email,
      password,
      phoneNumber,
      role,
      city,
      latitude,
      longitude,
    } = await request.json();

    if (
      !name ||
      !email ||
      !password ||
      !phoneNumber ||
      !role ||
      (role === userType.SERVICE_CENTER && !longitude && !latitude) ||
      (Number(role) === userType.SERVICE_CENTER && !city)
    ) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    if (Number(role) === userType.CUSTOMER) {
      const checkIfUserExist = await prisma.user.findUnique({
        where: {
          email,
          password,
        },
        select: {
          email: true,
        },
      });

      if (checkIfUserExist) {
        return new NextResponse("User Already Exist", { status: 409 });
      }

      await prisma.user.create({
        data: {
          name,
          email,
          phoneNumber,
          password: await hashPassword(password),
        },
      });
    } else {
      const checkIfUserExist = await prisma.serviceCenter.findUnique({
        where: {
          email,
          password,
        },
        select: {
          email: true,
        },
      });

      if (checkIfUserExist) {
        return new NextResponse("User Already Exist", { status: 409 });
      }

      await prisma.serviceCenter.create({
        data: {
          name,
          email,
          phoneNumber,
          city,
          latitude: latitude,
          longitude: longitude,
          password: await hashPassword(password),
        },
      });
      return new NextResponse("User created successfully", {
        status: 201,
      });
    }
    return new NextResponse("User created successfully", {
      status: 201,
    });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
