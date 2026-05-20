import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"
import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function POST(request) {
    try {
        await connectToDatabase()
        const { username, password } = await request.json()

        if (!username || !password)
            return NextResponse.json({ error: "Username and password are required." }, { status: 400 })

        const user = await User.findOne({ username })
        if (!user)
            return NextResponse.json({ error: "Invalid username or password." }, { status: 401 })

        if (user.isActive === false) {
            return NextResponse.json({ error: "Your account is deactivated by admin." }, { status: 403 })
        }

        const valid = await bcrypt.compare(password, user.password)
        if (!valid)
            return NextResponse.json({ error: "Invalid username or password." }, { status: 401 })

        const token = await new SignJWT({ id: user._id.toString(), username: user.username, name: user.name, role: user.role })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(secret)

        const response = NextResponse.json({ message: "Logged in.", role: user.role })
        response.cookies.set("cv_token", token, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
            sameSite: "lax",
        })
        return response
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
