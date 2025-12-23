import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest){
    const serviceCenterId = request.nextUrl.searchParams.get("serviceCenterId")
    try {
        if(!serviceCenterId){
            return new NextResponse("Service Center Id is required", {status: 400})
        }
        const mechanic = await prisma.mechanic.findMany({
            where: {
                serviceCenterId
            }, select: {
                id:true,
                name:true,
                email:true,
                phoneNumber:true,
                speciality: true,
                status: true
            }
        })
        
        return NextResponse.json({
            mechanic_data: mechanic,
            message: "Success"
        })
    } catch  {
        return new NextResponse("Internal Server Error", {status: 500})
    }
}