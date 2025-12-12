/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { calclateLongitudeLatitudeofStation } from "@/hooks/distance";
import { hashPassword } from "@/lib/bcryptjs";
import prisma from "@/lib/db";
import { userType } from "@/types/common";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phoneNumber, role, city } =
      await request.json();

    if (
      !name ||
      !email ||
      !password ||
      !phoneNumber ||
      !role ||
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
      const calculateLocation = await calclateLongitudeLatitudeofStation(city);
      await prisma.serviceCenter.create({
        data: {
          name,
          email,
          phoneNumber,
          city,
          latitude: parseFloat(calculateLocation?.lat!),
          longitude: parseFloat(calculateLocation?.lon!),
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
