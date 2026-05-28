import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function PATCH(request, { params }) {
    try {
        const { id } = await params
        const body = await request.json()
        await connectDB()

        const user = await User.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true }).select("-password")
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params
        await connectDB()

        const user = await User.findByIdAndDelete(id)
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "User deleted successfully" })
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }
}
