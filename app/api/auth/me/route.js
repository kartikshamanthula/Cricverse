import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("cv_token")?.value
        if (!token) return NextResponse.json(null)

        const { payload } = await jwtVerify(token, secret)
        return NextResponse.json({ id: payload.id, username: payload.username, name: payload.name, role: payload.role })
    } catch {
        return NextResponse.json(null)
    }
}
