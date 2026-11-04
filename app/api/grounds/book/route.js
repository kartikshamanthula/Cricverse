import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Ground from '@/models/Ground';

export async function POST(request) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const { groundId, slotId, bookingDate, userDetails } = body;

        if (!groundId || !slotId || !bookingDate) {
            return NextResponse.json(
                { success: false, error: 'Missing required booking fields (groundId, slotId, bookingDate)' },
                { status: 400 }
            );
        }

        const ground = await Ground.findById(groundId);
        if (!ground) {
            return NextResponse.json(
                { success: false, error: 'Venue ground not found' },
                { status: 404 }
            );
        }

        const slot = ground.timeSlots.find(s => s.id === slotId);
        if (!slot) {
            return NextResponse.json(
                { success: false, error: 'Specified time slot not found' },
                { status: 404 }
            );
        }

        if (slot.isBooked) {
            return NextResponse.json(
                { success: false, error: 'This slot has already been booked by another user.' },
                { status: 400 }
            );
        }

        // Mark slot as booked
        slot.isBooked = true;
        await ground.save();

        const bookingConfirmation = {
            bookingId: `CV-GRD-${Date.now()}`,
            groundName: ground.name,
            groundAddress: ground.location.address,
            city: ground.location.city,
            googleMapsUrl: ground.location.googleMapsUrl,
            bookingDate,
            slotTime: `${slot.startTime} - ${slot.endTime} (${slot.label})`,
            pricePaid: slot.price,
            contactPhone: ground.contactPhone,
            createdAt: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            message: 'Ground slot booked successfully!',
            booking: bookingConfirmation
        });

    } catch (error) {
        console.error('Error booking ground slot:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to book slot' },
            { status: 500 }
        );
    }
}
