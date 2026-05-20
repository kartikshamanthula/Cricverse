import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"
import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function POST(request) {
    try {
        await connectToDatabase()
        const { username, name, password } = await request.json()

        if (!username || !name || !password)
            return NextResponse.json({ error: "All fields are required." }, { status: 400 })

        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
            return NextResponse.json({ error: "Username must be 3-20 alphanumeric characters." }, { status: 400 })

        if (password.length < 6)
            return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 })

        const exists = await User.findOne({ username })
        if (exists)
            return NextResponse.json({ error: "Username already taken." }, { status: 409 })

        const hashed = await bcrypt.hash(password, 10)
        const user = await User.create({ username, name, password: hashed, role: "user" })

        const token = await new SignJWT({ id: user._id.toString(), username: user.username, name: user.name, role: user.role })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(secret)

        const response = NextResponse.json({ message: "Registered successfully.", role: user.role })
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
