import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Order from "@/models/Order"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function PATCH(request, context) {
    try {
        const { id } = await context.params
        await connectToDatabase()
        const body = await request.json()
        const { orderStatus } = body

        // Check if user is admin
        try {
            const cookieStore = await cookies()
            const token = cookieStore.get("cv_token")?.value
            if (!token) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
            }
            const { payload } = await jwtVerify(token, secret)
            if (payload.role !== "admin") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 })
            }
        } catch (authError) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { orderStatus },
            { returnDocument: 'after' }
        )

        if (!updatedOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        return NextResponse.json(updatedOrder)
    } catch (error) {
        console.error("Error updating order:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
