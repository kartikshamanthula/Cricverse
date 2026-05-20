import { jwtVerify } from "jose"
import { cookies } from "next/headers"

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function getServerSession() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("cv_token")?.value
        if (!token) return null

        const { payload } = await jwtVerify(token, secret)
        return {
            id: payload.id,
            username: payload.username,
            name: payload.name,
            role: payload.role
        }
    } catch (error) {
        console.error("Error verifying token:", error)
        return null
    }
}
