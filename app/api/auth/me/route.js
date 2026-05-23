import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("cv_token")?.value
        if (!token) return NextResponse.json(null)

        const { payload } = await jwtVerify(token, secret)
        
        await connectDB()
        const user = await User.findById(payload.id).select("-password")
        if (!user) return NextResponse.json(null)

        return NextResponse.json(user)
    } catch {
        return NextResponse.json(null)
    }
}
