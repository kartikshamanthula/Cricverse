import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"

export async function GET() {
    try {
        await connectToDatabase()
        const exists = await User.findOne({ username: "admin" })
        if (exists) return NextResponse.json({ message: "Admin already exists." })

        const hashed = await bcrypt.hash("Admin@1458", 10)
        await User.create({ username: "admin", name: "Administrator", password: hashed, role: "admin" })
        return NextResponse.json({ message: "Admin account created." })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
