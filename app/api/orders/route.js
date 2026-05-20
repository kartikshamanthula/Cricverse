import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Order from "@/models/Order"
import Product from "@/models/Product"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function POST(request) {
    try {
        await connectToDatabase()
        const body = await request.json()
        const { customerDetails, items, totalAmount, paymentMethod, orderId } = body

        if (!customerDetails || !items || !totalAmount || !paymentMethod || !orderId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        let userId = null
        try {
            const cookieStore = await cookies()
            const token = cookieStore.get("cv_token")?.value
            if (token) {
                const { payload } = await jwtVerify(token, secret)
                userId = payload.id
            }
        } catch (authError) {
            console.error("Auth error in order creation:", authError)
        }

        const newOrder = await Order.create({
            userId,
            customerDetails,
            items,
            totalAmount,
            paymentMethod,
            orderId,
            paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" : "Completed"
        })

        // Decrement product stock
        try {
            for (const item of items) {
                if (item.productId && item.quantity) {
                    // Decrement stock, ensuring it doesn't go below 0 later if needed, but schema allows min: 0
                    // $inc with a negative value subtracts. If it drops below 0 schema validation min:0 catches it, 
                    // so we can use max along with it to be safe or just direct $inc. To be safe: updates bypassing runValidators could result in negative.
                    // Let's do a simple find and update.
                    const product = await Product.findById(item.productId);
                    if (product && product.stock > 0) {
                        product.stock = Math.max(0, product.stock - item.quantity);
                        await product.save();
                    }
                }
            }
        } catch (stockError) {
            console.error("Error updating stock:", stockError)
            // Non-critical, continue to return successful order
        }

        return NextResponse.json({ message: "Order created successfully", order: newOrder }, { status: 201 })
    } catch (error) {
        console.error("Error creating order:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET(request) {
    try {
        await connectToDatabase()

        const cookieStore = await cookies()
        const token = cookieStore.get("cv_token")?.value

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { payload } = await jwtVerify(token, secret)

        let query = {}
        if (payload.role !== "admin") {
            // For regular users, only show their own orders
            query = { userId: payload.id }
        }

        const orders = await Order.find(query).sort({ createdAt: -1 })
        return NextResponse.json(orders)
    } catch (error) {
        console.error("Error fetching orders:", error)
        return NextResponse.json({ error: "Unauthorized or server error" }, { status: 500 })
    }
}
