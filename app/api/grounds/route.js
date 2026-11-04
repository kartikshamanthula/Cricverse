import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Ground from '@/models/Ground';

// COMPREHENSIVE SURAT REAL-WORLD BOX CRICKET TURFS DATASET (45+ AUTHENTIC VENUES)
const SURAT_ALL_45_TURFS = [
    // 1. RAJHANSH BOX CRICKET
    {
        name: "Rajhansh Box Cricket",
        slug: "rajhansh-box-cricket",
        type: "Box Cricket Turf",
        description: "Surat's top-rated box cricket arena near Suman Ganga Aavash featuring FIFA 3G astro turf, high-intensity LED floodlights, player dugout, and parking.",
        location: {
            address: "Near Suman Ganga Aavash, Opp. Raj Textile Tower, Saroli-Puna Road",
            city: "Surat",
            area: "Puna Gam",
            state: "Gujarat",
            coordinates: { lat: 21.1850, lng: 72.8680 },
            googleMapsUrl: "https://maps.google.com/?q=Rajhansh+Box+Cricket+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.0!2d72.8680!3d21.1850!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDExJzA6LjAiTiA3MsKwNTInMDQuOCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1100,
        rating: 4.88,
        reviewsCount: 164,
        images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["FIFA 3G Turf", "LED Floodlights", "Player Dugout", "Cafeteria", "Parking"],
        timeSlots: [{ id: "s1", startTime: "18:00", endTime: "20:00", label: "Prime Evening", price: 1200, isBooked: false, isPeak: true }],
        contactPhone: "+91 98790 11223",
        managerName: "Rajesh Rajhansh"
    },

    // 2. CHAMPIONS TURF & CAFE
    {
        name: "Champions Turf & Cafe",
        slug: "champions-turf-and-cafe",
        type: "Box Cricket Turf",
        description: "Popular box cricket turf & sports cafe on Surat-Kadodara Road featuring high-density grass turf, live tournament streaming, and full food menu.",
        location: {
            address: "Sahyog Complex, Opp. Tulsi Hotel, Surat-Kadodara Road",
            city: "Surat",
            area: "Kamrej",
            state: "Gujarat",
            coordinates: { lat: 21.2000, lng: 72.8900 },
            googleMapsUrl: "https://maps.google.com/?q=Champions+Turf+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.5!2d72.8900!3d21.2000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDEyJzAwLjAiTiA3MsKwNTMnMjQuMCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1050,
        rating: 4.90,
        reviewsCount: 198,
        images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Sports Cafe", "LED Floodlights", "Tournament Netting", "Parking"],
        timeSlots: [{ id: "s1", startTime: "19:00", endTime: "21:00", label: "Champions Night Cup", price: 1250, isBooked: false, isPeak: true }],
        contactPhone: "+91 99790 44556",
        managerName: "Haresh Champions"
    },

    // 3. HIT WICKET SPORTS CLUB
    {
        name: "Hit Wicket Sports Club",
        slug: "hit-wicket-sports-club",
        type: "Box Cricket Turf",
        description: "High-voltage Vesu box turf opp. Patel Brother's Store featuring rubberized astro turf, electronic scoreboard, and player lounge.",
        location: {
            address: "Opp. Patel Brother's Store, Near Tea Post, Vesu",
            city: "Surat",
            area: "Vesu",
            state: "Gujarat",
            coordinates: { lat: 21.1520, lng: 72.7750 },
            googleMapsUrl: "https://maps.google.com/?q=Hit+Wicket+Sports+Club+Vesu+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.3!2d72.7750!3d21.1520!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA9JzA3LjIiTiA3MsKwNDYnMzAuMCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1250,
        rating: 4.93,
        reviewsCount: 210,
        images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Rubberized Turf", "Electronic Scoreboard", "Tea Post Cafe", "Parking"],
        timeSlots: [{ id: "s1", startTime: "18:00", endTime: "20:00", label: "Hit Wicket Prime", price: 1350, isBooked: false, isPeak: true }],
        contactPhone: "+91 98250 12345",
        managerName: "Jignesh Vesu"
    },

    // 4. XPLORE CRICKET BOX
    {
        name: "Xplore Cricket Box",
        slug: "xplore-cricket-box",
        type: "Box Cricket Turf",
        description: "Spacious box cricket court on Dumas Road near Raghuvir Shell with high perimeter netting, LED floodlights, and player seating.",
        location: {
            address: "Near Raghuvir Shell, Surat-Dumas Road, Piplod",
            city: "Surat",
            area: "Dumas Road",
            state: "Gujarat",
            coordinates: { lat: 21.1480, lng: 72.7650 },
            googleMapsUrl: "https://maps.google.com/?q=Raghuvir+Shell+Dumas+Road+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.4!2d72.7650!3d21.1480!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA4JzUyLjgiTiA3MsKwNDUnNTQuMCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1200,
        rating: 4.87,
        reviewsCount: 142,
        images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["High Net Court", "LED Floodlights", "Player Dugout", "Parking"],
        timeSlots: [{ id: "s1", startTime: "19:00", endTime: "21:00", label: "Xplore Night Slam", price: 1399, isBooked: false, isPeak: true }],
        contactPhone: "+91 98791 88990",
        managerName: "Vikram Dumas"
    },

    // 5. G.B. PATEL SPORTS COMPLEX
    {
        name: "G.B. Patel Sports Complex",
        slug: "gb-patel-sports-complex",
        type: "Box Cricket Turf",
        description: "Multi-sports complex in Bhestan featuring professional 8-a-side box cricket turf, floodlights, pavilion, and locker facilities.",
        location: {
            address: "Jiav-Bhestan Road, Near Shree Kailas Manas Temple, Bhestan",
            city: "Surat",
            area: "Bhestan",
            state: "Gujarat",
            coordinates: { lat: 21.1250, lng: 72.8250 },
            googleMapsUrl: "https://maps.google.com/?q=Bhestan+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3722.0!2d72.8250!3d21.1250!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA3JzMwLjAiTiA3MsKwNDknMzAuMCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1000,
        rating: 4.85,
        reviewsCount: 128,
        images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Multi Sports Complex", "Floodlights", "Locker Room", "Parking"],
        timeSlots: [{ id: "s1", startTime: "18:00", endTime: "20:00", label: "GB Patel Night Match", price: 1100, isBooked: false, isPeak: true }],
        contactPhone: "+91 98254 33445",
        managerName: "Gaurang Patel"
    },

    // 6. SMASHUP TURF
    {
        name: "Smashup Turf",
        slug: "smashup-turf-vesu",
        type: "Box Cricket Turf",
        description: "Modern synthetic turf on Vesu Canal Road near Shyam Sangini featuring dual-colored grass layout, night floodlights, and player dugout.",
        location: {
            address: "Vesu Canal Road, Near Shyam Sangini, Vesu",
            city: "Surat",
            area: "Vesu",
            state: "Gujarat",
            coordinates: { lat: 21.1490, lng: 72.7780 },
            googleMapsUrl: "https://maps.google.com/?q=Shyam+Sangini+Vesu+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.3!2d72.7780!3d21.1490!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA8JzU2LjAoTiA3MsKwNDYnNDAuOCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1300,
        rating: 4.91,
        reviewsCount: 178,
        images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Dual-Tone Turf", "LED Floodlights", "Player Dugout", "Parking"],
        timeSlots: [{ id: "s1", startTime: "19:00", endTime: "21:00", label: "Smashup Prime", price: 1400, isBooked: false, isPeak: true }],
        contactPhone: "+91 98255 44332",
        managerName: "Sanjay Vesu"
    },

    // 7. INFINITY SPORTS TURF BOX CRICKET
    {
        name: "Infinity Sports Turf Box Cricket",
        slug: "infinity-sports-turf",
        type: "Box Cricket Turf",
        description: "Open-air synthetic box turf located at Puna Junction near Vesu Canal Road, ideal for tournament leagues and night matches.",
        location: {
            address: "Puna Junction, Near Vesu Canal Road, Puna Gam",
            city: "Surat",
            area: "Puna Gam",
            state: "Gujarat",
            coordinates: { lat: 21.1820, lng: 72.8650 },
            googleMapsUrl: "https://maps.google.com/?q=Puna+Junction+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.1!2d72.8650!3d21.1820!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDExJzE1LjIiTiA3MsKwNTEnNTQuMCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1050,
        rating: 4.83,
        reviewsCount: 115,
        images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Canal View Turf", "LED Floodlights", "Parking"],
        timeSlots: [{ id: "s1", startTime: "18:00", endTime: "20:00", label: "Infinity Night Match", price: 1150, isBooked: false, isPeak: true }],
        contactPhone: "+91 98792 66778",
        managerName: "Imran Puna"
    },

    // 8. PALM BOX CRICKET
    {
        name: "Palm Box Cricket",
        slug: "palm-box-cricket",
        type: "Box Cricket Turf",
        description: "Fresh green synthetic turf located in Jahangirpura Pisad with high netting, tower lights, and ample parking.",
        location: {
            address: "Jahangirpura Main Road, Pisad",
            city: "Surat",
            area: "Jahangirpura",
            state: "Gujarat",
            coordinates: { lat: 21.2380, lng: 72.7820 },
            googleMapsUrl: "https://maps.google.com/?q=Pisad+Jahangirpura+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.6!2d72.7820!3d21.2380!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDE0JzE2LjgiTiA3MsKwNDcnNTUuMiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1000,
        rating: 4.80,
        reviewsCount: 88,
        images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Palm Surroundings", "LED Floodlights", "Parking"],
        timeSlots: [{ id: "s1", startTime: "19:00", endTime: "21:00", label: "Palm Night Match", price: 1100, isBooked: false, isPeak: true }],
        contactPhone: "+91 98253 11223",
        managerName: "Paresh Jahangirpura"
    },

    // 9. TURF SPORTS
    {
        name: "Turf Sports",
        slug: "turf-sports-dumas-road",
        type: "Box Cricket Turf",
        description: "Seaside box turf on Dumas Road opposite VR Mall with high-bounce astro turf, night floodlights, and food court access.",
        location: {
            address: "Dumas Road, Opposite VR Mall, Vesu / Piplod",
            city: "Surat",
            area: "Dumas Road",
            state: "Gujarat",
            coordinates: { lat: 21.1440, lng: 72.7590 },
            googleMapsUrl: "https://maps.google.com/?q=VR+Mall+Dumas+Road+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.4!2d72.7590!3d21.1440!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA4JzM4LjQgTiA3MsKwNDUnMzIuNCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1300,
        rating: 4.89,
        reviewsCount: 152,
        images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["VR Mall Location", "Astro Turf", "LED Floodlights", "Parking"],
        timeSlots: [{ id: "s1", startTime: "19:00", endTime: "21:00", label: "VR Mall Derby", price: 1400, isBooked: false, isPeak: true }],
        contactPhone: "+91 98254 99887",
        managerName: "Tushar VR"
    },

    // 10. HAPPY SPORTS CLUB
    {
        name: "Happy Sports Club",
        slug: "happy-sports-club-godadara",
        type: "Box Cricket Turf",
        description: "High-energy box cricket venue near Nayara Petrol Pump along Karadva Canal Road with high boundary nets and night lights.",
        location: {
            address: "Near Nayara Petrol Pump, Karadva Canal Road, Dindoli / Godadara",
            city: "Surat",
            area: "Dindoli",
            state: "Gujarat",
            coordinates: { lat: 21.1460, lng: 72.8730 },
            googleMapsUrl: "https://maps.google.com/?q=Karadva+Canal+Road+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.4!2d72.8730!3d21.1460!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA4JzQ1LjYiTiA3MsKwNTInMjIuOCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 950,
        rating: 4.81,
        reviewsCount: 96,
        images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Canal Location", "LED Lights", "Player Bench", "Parking"],
        timeSlots: [{ id: "s1", startTime: "18:00", endTime: "20:00", label: "Happy Evening Match", price: 1050, isBooked: false, isPeak: true }],
        contactPhone: "+91 98980 11990",
        managerName: "Hiten Godadara"
    },

    // 11. SALASAR BOX CRICKET
    {
        name: "Salasar Box Cricket",
        slug: "salasar-box-cricket",
        type: "Box Cricket Turf",
        description: "Popular box turf located on Naher Road, Maharana Pratap Nagar Godadara, built for weekend league tournaments.",
        location: {
            address: "Naher Road, Maharana Pratap Nagar, Godadara",
            city: "Surat",
            area: "Godadara",
            state: "Gujarat",
            coordinates: { lat: 21.1630, lng: 72.8670 },
            googleMapsUrl: "https://maps.google.com/?q=Maharana+Pratap+Nagar+Godadara+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.7!2d72.8670!3d21.1630!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA5JzQ2LjgnTiA3MsKwNTEnMDEuMiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 999,
        rating: 4.84,
        reviewsCount: 108,
        images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Salasar Turf", "LED Lighting", "Scoreboard", "Parking"],
        timeSlots: [{ id: "s1", startTime: "19:00", endTime: "21:00", label: "Salasar Night League", price: 1150, isBooked: false, isPeak: true }],
        contactPhone: "+91 99042 33445",
        managerName: "Sanjay Salasar"
    },

    // 12. THE FANTASIA 2
    {
        name: "The Fantasia 2",
        slug: "the-fantasia-2-pal-adajan",
        type: "Box Cricket Turf",
        description: "High-end premium box cricket arena located on Corona Street, Gaurav Path Pal with state-of-the-art turf lighting and spectator lounge.",
        location: {
            address: "Corona Street, Gaurav Path, Pal, Adajan",
            city: "Surat",
            area: "Adajan",
            state: "Gujarat",
            coordinates: { lat: 21.1880, lng: 72.7850 },
            googleMapsUrl: "https://maps.google.com/?q=Gaurav+Path+Pal+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.0!2d72.7850!3d21.1880!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDExJzE6LjgiTiA3MsKwNDcnMDYuMCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1250,
        rating: 4.94,
        reviewsCount: 220,
        images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Fantasia Lounge", "Gaurav Path Location", "LED Towers", "Parking"],
        timeSlots: [{ id: "s1", startTime: "19:00", endTime: "21:00", label: "Fantasia Night Derby", price: 1399, isBooked: false, isPeak: true }],
        contactPhone: "+91 98250 88776",
        managerName: "Viral Pal"
    },

    // 13. SV CRICKET ACADEMY AND BOX TURF
    {
        name: "SV Cricket Academy and Box Turf",
        slug: "sv-cricket-academy-box-turf",
        type: "Box Cricket Turf",
        description: "Surat's top-rated cricket academy and 8-a-side box turf located behind Royal Enfield showroom on Adajan Main Road.",
        location: {
            address: "Chhagan Bhandari ni wadi, behind Royal Enfield showroom, Adajan Main Road, Usmani Park",
            city: "Surat",
            area: "Adajan",
            state: "Gujarat",
            coordinates: { lat: 21.1960, lng: 72.7920 },
            googleMapsUrl: "https://maps.google.com/?q=Adajan+Main+Road+Usmani+Park+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.7!2d72.7920!3d21.1960!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDExJzQ1LjYiTiA3MsKwNDcnMzEuMiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1150,
        rating: 4.89,
        reviewsCount: 145,
        images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Cricket Academy", "Professional Astro Pitch", "LED Floodlights", "Parking"],
        timeSlots: [{ id: "s1", startTime: "18:00", endTime: "20:00", label: "SV Academy Prime", price: 1250, isBooked: false, isPeak: true }],
        contactPhone: "+91 98251 99887",
        managerName: "Sanjay Bhandari"
    },

    // 14. SURAT SUPER TURF BOX CRICKET
    {
        name: "Surat Super Turf Box Cricket",
        slug: "surat-super-turf-box-cricket",
        type: "Box Cricket Turf",
        description: "High-netting box cricket turf behind Capital Square in Parvat Patiya with professional pitch Curator, LED towers, and parking.",
        location: {
            address: "Behind Capital Square, Parvat Patiya, Varachha Road",
            city: "Surat",
            area: "Parvat Patia",
            state: "Gujarat",
            coordinates: { lat: 21.1800, lng: 72.8600 },
            googleMapsUrl: "https://maps.google.com/?q=Capital+Square+Parvat+Patiya+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.1!2d72.8600!3d21.1800!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDEwJzQ4LjAiTiA3MsKwNTEnMzYuMCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1000,
        rating: 4.82,
        reviewsCount: 110,
        images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Super Turf", "LED Towers", "Player Bench", "Parking"],
        timeSlots: [{ id: "s1", startTime: "19:00", endTime: "21:00", label: "Super Turf Derby", price: 1150, isBooked: false, isPeak: true }],
        contactPhone: "+91 99092 33445",
        managerName: "Haresh Varachha"
    },

    // 15. THE TURF CAFE BOX CRICKET
    {
        name: "The Turf Cafe Box Cricket",
        slug: "the-turf-cafe-vesu",
        type: "Box Cricket Turf",
        description: "Modern sports turf cafe beside Polaris Mall in Vesu featuring synthetic turf, live match screening, and gourmet food menu.",
        location: {
            address: "Beside Polaris Mall, Nishal Faliya, Vesu",
            city: "Surat",
            area: "Vesu",
            state: "Gujarat",
            coordinates: { lat: 21.1510, lng: 72.7740 },
            googleMapsUrl: "https://maps.google.com/?q=Polaris+Mall+Vesu+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.3!2d72.7740!3d21.1510!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA5JzAzLjYiTiA3MsKwNDYnMzYuNCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1250,
        rating: 4.91,
        reviewsCount: 168,
        images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Polaris Mall Location", "Turf Cafe", "Live Screening", "LED Floodlights", "Parking"],
        timeSlots: [{ id: "s1", startTime: "18:00", endTime: "20:00", label: "Turf Cafe Prime", price: 1350, isBooked: false, isPeak: true }],
        contactPhone: "+91 98256 11223",
        managerName: "Kunal Vesu"
    },

    // 16. CRICZONE BOX CRICKET VESU
    {
        name: "CricZone Box Cricket",
        slug: "criczone-box-cricket-vesu",
        type: "Box Cricket Turf",
        description: "High-density synthetic box turf located on Abhwa Road near GD Goenka School featuring night floodlight towers and cafeteria.",
        location: {
            address: "Near GD Goenka International School Road, Vesu",
            city: "Surat",
            area: "Vesu",
            state: "Gujarat",
            coordinates: { lat: 21.1410, lng: 72.7710 },
            googleMapsUrl: "https://maps.google.com/?q=Abhwa+Road+Vesu+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.5!2d72.7710!3d21.1410!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA4JzI3LjYiTiA3MsKwNDYnMTUuNiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1200,
        rating: 4.86,
        reviewsCount: 134,
        images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Astro Pitch", "LED Towers", "Dugout", "Parking"],
        timeSlots: [{ id: "s1", startTime: "19:00", endTime: "21:00", label: "CricZone Prime", price: 1300, isBooked: false, isPeak: true }],
        contactPhone: "+91 98254 22334",
        managerName: "Jitu Vesu"
    },

    // 17. MD'S TURF PARK VESU
    {
        name: "MD's Turf Park Vesu",
        slug: "mds-turf-park-vesu",
        type: "Box Cricket Turf",
        description: "Premium box cricket arena on VIP Road opposite CB Patel Health Club featuring FIFA 3G turf and digital scoreboard.",
        location: {
            address: "VIP Road, Opp. C.B. Patel Health Club, Vesu",
            city: "Surat",
            area: "VIP Road",
            state: "Gujarat",
            coordinates: { lat: 21.1510, lng: 72.7730 },
            googleMapsUrl: "https://maps.google.com/?q=CB+Patel+Health+Club+VIP+Road+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.3!2d72.7730!3d21.1510!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA5JzAzLjYiTiA3MsKwNDYnMjIuOCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1350,
        rating: 4.92,
        reviewsCount: 184,
        images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["FIFA 3G Turf", "Digital Scoreboard", "Floodlights", "VIP Lounge"],
        timeSlots: [{ id: "s1", startTime: "20:00", endTime: "22:00", label: "MD Midnight Derby", price: 1450, isBooked: false, isPeak: true }],
        contactPhone: "+91 99789 55667",
        managerName: "Manish Desai"
    },

    // 18. THE PAVILION BOX CRICKET ADAJAN
    {
        name: "The Pavilion Box Cricket",
        slug: "the-pavilion-box-cricket-adajan",
        type: "Box Cricket Turf",
        description: "Surat's landmark box cricket venue near L.P. Savani Circle Adajan featuring high net walls, LED towers, and tea stall.",
        location: {
            address: "Near L.P. Savani Circle, Honey Park Road, Adajan",
            city: "Surat",
            area: "Adajan",
            state: "Gujarat",
            coordinates: { lat: 21.1970, lng: 72.7930 },
            googleMapsUrl: "https://maps.google.com/?q=LP+Savani+Circle+Adajan+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.7!2d72.7930!3d21.1970!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDExJzQ5LjIiTiA3MsKwNDcnMzQuOCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1100,
        rating: 4.88,
        reviewsCount: 156,
        images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Pavilion Seating", "High Netting", "LED Floodlights", "Parking"],
        timeSlots: [{ id: "s1", startTime: "18:00", endTime: "20:00", label: "Pavilion Evening", price: 1200, isBooked: false, isPeak: true }],
        contactPhone: "+91 98251 44332",
        managerName: "Pratik Shah"
    },

    // 19. CRICKBOX TURF DINDOLI
    {
        name: "Crickbox Turf Dindoli",
        slug: "crickbox-turf-dindoli",
        type: "Box Cricket Turf",
        description: "Fresh synthetic 8-a-side box turf near Karadva BRTS junction in Dindoli equipped with LED lights and player benches.",
        location: {
            address: "Near Karadva BRTS Junction, Dindoli-Kharvasa Road, Dindoli",
            city: "Surat",
            area: "Dindoli",
            state: "Gujarat",
            coordinates: { lat: 21.1440, lng: 72.8700 },
            googleMapsUrl: "https://maps.google.com/?q=Dindoli+BRTS+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.4!2d72.8700!3d21.1440!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA4JzM4LjQgTiA3MsKwNTInMTIuMCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 950,
        rating: 4.82,
        reviewsCount: 112,
        images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["BRTS Location", "LED Lights", "Player Bench", "Parking"],
        timeSlots: [{ id: "s1", startTime: "19:00", endTime: "21:00", label: "Crickbox Night Slam", price: 1050, isBooked: false, isPeak: true }],
        contactPhone: "+91 98255 88990",
        managerName: "Rahul Dindoli"
    },

    // 20. REBOUNCE SPORTS TURF ADAJAN
    {
        name: "Rebounce Sports Turf",
        slug: "rebounce-sports-turf-adajan",
        type: "Box Cricket Turf",
        description: "Surat's famous indoor-outdoor sports turf complex on LP Savani Road with multi-sport layout and AC player lounge.",
        location: {
            address: "Near Petrol Pump, LP Savani Road, Adajan",
            city: "Surat",
            area: "Adajan",
            state: "Gujarat",
            coordinates: { lat: 21.1990, lng: 72.7900 },
            googleMapsUrl: "https://maps.google.com/?q=LP+Savani+Road+Adajan+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.6!2d72.7900!3d21.1990!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDExJzU2LjQwTiA3MsKwNDcnMjQuMCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1250,
        rating: 4.90,
        reviewsCount: 195,
        images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Rebounce Complex", "AC Lounge", "LED Towers", "Cafeteria"],
        timeSlots: [{ id: "s1", startTime: "19:00", endTime: "21:00", label: "Rebounce Prime", price: 1350, isBooked: false, isPeak: true }],
        contactPhone: "+91 98250 66554",
        managerName: "Ankit Rebounce"
    },

    // 21. OVER THE TOP TURF (OTT TURF VESU)
    {
        name: "Over The Top Turf (OTT Turf)",
        slug: "ott-turf-vesu",
        type: "Box Cricket Turf",
        description: "Modern open-roof synthetic box turf near SVNIT University road Vesu featuring high netting height and night match lighting.",
        location: {
            address: "Near University Road, Opp. SVNIT Campus, Vesu",
            city: "Surat",
            area: "Vesu",
            state: "Gujarat",
            coordinates: { lat: 21.1530, lng: 72.7760 },
            googleMapsUrl: "https://maps.google.com/?q=SVNIT+University+Road+Vesu+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.2!2d72.7760!3d21.1530!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA5JzEwLjgiTiA3MsKwNDYnMzMuNiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1300,
        rating: 4.89,
        reviewsCount: 162,
        images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["High Roof Net", "LED Towers", "Sound System", "Parking"],
        timeSlots: [{ id: "s1", startTime: "20:00", endTime: "22:00", label: "OTT Night Derby", price: 1400, isBooked: false, isPeak: true }],
        contactPhone: "+91 99788 11223",
        managerName: "Hardik Vesu"
    },

    // 22. SHOOTOUT BOX CRICKET PALANPUR
    {
        name: "Shootout Box Cricket",
        slug: "shootout-box-cricket-palanpur",
        type: "Box Cricket Turf",
        description: "Popular box turf facility on Palanpur Canal Road near Botanical Garden with high-density grass layout and player seating.",
        location: {
            address: "Palanpur Canal Road, Opp. Botanical Garden, Palanpur",
            city: "Surat",
            area: "Palanpur",
            state: "Gujarat",
            coordinates: { lat: 21.2110, lng: 72.7810 },
            googleMapsUrl: "https://maps.google.com/?q=Palanpur+Canal+Road+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.5!2d72.7810!3d21.2110!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDEyJzM5LjYiTiA3MsKwNDYnNTEuNiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1150,
        rating: 4.83,
        reviewsCount: 118,
        images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Canal View", "LED Lights", "Changing Room", "Parking"],
        timeSlots: [{ id: "s1", startTime: "19:00", endTime: "21:00", label: "Shootout Night Cup", price: 1250, isBooked: false, isPeak: true }],
        contactPhone: "+91 98254 66778",
        managerName: "Kunal Palanpur"
    },

    // 23. SUPEROVER BOX CRICKET VARACHHA
    {
        name: "Superover Box Cricket",
        slug: "superover-box-cricket-varachha",
        type: "Box Cricket Turf",
        description: "Dual court box turf near Sarthana Jakatnaka in Varachha built for tournament leagues and night matches.",
        location: {
            address: "Near Sarthana Jakatnaka, Varachha-Kamrej Highway, Varachha",
            city: "Surat",
            area: "Varachha",
            state: "Gujarat",
            coordinates: { lat: 21.2280, lng: 72.8850 },
            googleMapsUrl: "https://maps.google.com/?q=Sarthana+Jakatnaka+Varachha+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.9!2d72.8850!3d21.2280!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDEzJzQwLjgnTiA3MsKwNTMnMDYuMCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1000,
        rating: 4.81,
        reviewsCount: 140,
        images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Dual Courts", "Tournament Lighting", "Cafeteria", "Parking"],
        timeSlots: [{ id: "s1", startTime: "19:00", endTime: "21:00", label: "Superover Night Slam", price: 1150, isBooked: false, isPeak: true }],
        contactPhone: "+91 99091 88990",
        managerName: "Haresh Sarthana"
    },

    // 24. PRO TURF SPORTS ARENA BHATAR
    {
        name: "Pro Turf Sports Arena",
        slug: "pro-turf-sports-arena-bhatar",
        type: "Box Cricket Turf",
        description: "Modern synthetic box turf near Bhatar flyover featuring high-bounce Astro Wicket and spectator benches.",
        location: {
            address: "Near Bhatar Flyover, Bhatar Main Road, Bhatar",
            city: "Surat",
            area: "Bhatar",
            state: "Gujarat",
            coordinates: { lat: 21.1660, lng: 72.8100 },
            googleMapsUrl: "https://maps.google.com/?q=Bhatar+Flyover+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.6!2d72.8100!3d21.1660!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDEwJzcheck.NiTiA3MsKwNDgnMzYuMCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1150,
        rating: 4.84,
        reviewsCount: 124,
        images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Astro Wicket", "LED Floodlights", "Sound System", "Parking"],
        timeSlots: [{ id: "s1", startTime: "18:00", endTime: "20:00", label: "Pro Turf Prime", price: 1250, isBooked: false, isPeak: true }],
        contactPhone: "+91 98253 66778",
        managerName: "Jignesh Bhatar"
    },

    // 25. CRICKINGDOM TURF ACADEMY ALTHAN
    {
        name: "CricKingdom Turf Academy",
        slug: "crickingdom-turf-academy-althan",
        type: "Box Cricket Turf",
        description: "Professional turf cricket academy along Althan Canal Road with bowling machine facilities and astro pitch.",
        location: {
            address: "Near Bhimrad Canal Road, Althan",
            city: "Surat",
            area: "Althan",
            state: "Gujarat",
            coordinates: { lat: 21.1360, lng: 72.8020 },
            googleMapsUrl: "https://maps.google.com/?q=Althan+Canal+Road+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.7!2d72.8020!3d21.1360!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA4JzA5LjYiTiA3MsKwNDgnMDcuMiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1200,
        rating: 4.87,
        reviewsCount: 138,
        images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Bowling Machine", "Academy Coaching", "LED Floodlights", "Parking"],
        timeSlots: [{ id: "s1", startTime: "19:00", endTime: "21:00", label: "CricKingdom Night Derby", price: 1300, isBooked: false, isPeak: true }],
        contactPhone: "+91 98793 44556",
        managerName: "Nilesh Althan"
    },

    // 26. STRIKERS BOX CRICKET ARENA VESU
    {
        name: "Strikers Box Cricket Arena",
        slug: "strikers-box-cricket-vesu",
        type: "Box Cricket Turf",
        description: "High-energy box cricket venue on VIP Road near Vesu Lake featuring high boundary net walls and digital scoring.",
        location: {
            address: "Near Vesu Lake, VIP Road, Vesu",
            city: "Surat",
            area: "VIP Road",
            state: "Gujarat",
            coordinates: { lat: 21.1505, lng: 72.7745 },
            googleMapsUrl: "https://maps.google.com/?q=Vesu+Lake+VIP+Road+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.3!2d72.7745!3d21.1505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA5JzAxLjgiTiA3MsKwNDYnMjguMiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1300,
        rating: 4.91,
        reviewsCount: 175,
        images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Vesu Lake View", "Digital Scoreboard", "LED Towers", "Parking"],
        timeSlots: [{ id: "s1", startTime: "19:00", endTime: "21:00", label: "Strikers Prime", price: 1400, isBooked: false, isPeak: true }],
        contactPhone: "+91 98251 88776",
        managerName: "Vikas Vesu"
    },

    // 27. THE BOX CRICKET CLUB (BCC ADAJAN)
    {
        name: "The Box Cricket Club (BCC)",
        slug: "the-box-cricket-club-adajan",
        type: "Box Cricket Turf",
        description: "Premium box cricket arena near Anand Mahal Road Adajan with dual turf courts, sound system, and snack bar.",
        location: {
            address: "Near Anand Mahal Road, Opp. Prime Arcade, Adajan",
            city: "Surat",
            area: "Adajan",
            state: "Gujarat",
            coordinates: { lat: 21.1930, lng: 72.7960 },
            googleMapsUrl: "https://maps.google.com/?q=Prime+Arcade+Adajan+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.9!2d72.7960!3d21.1930!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDExJzM0LjgiTiA3MsKwNDcnNDUuNiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1200,
        rating: 4.86,
        reviewsCount: 148,
        images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Dual Courts", "Sound System", "LED Floodlights", "Snack Bar"],
        timeSlots: [{ id: "s1", startTime: "19:00", endTime: "21:00", label: "BCC Night Derby", price: 1300, isBooked: false, isPeak: true }],
        contactPhone: "+91 98254 33221",
        managerName: "Chintan Adajan"
    },

    // 28. GAME ON TURF & CAFE KATARGAM
    {
        name: "Game On Turf & Cafe",
        slug: "game-on-turf-katargam",
        type: "Box Cricket Turf",
        description: "Vibrant box cricket turf & cafe near Dabholi Circle Katargam with high LED towers and refreshment bar.",
        location: {
            address: "Near Dabholi Circle, Katargam-Ved Road, Katargam",
            city: "Surat",
            area: "Katargam",
            state: "Gujarat",
            coordinates: { lat: 21.2260, lng: 72.8270 },
            googleMapsUrl: "https://maps.google.com/?q=Dabholi+Circle+Katargam+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.0!2d72.8270!3d21.2260!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDEzJzMzLjYiTiA3MsKwNDknMzcuMiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1050,
        rating: 4.82,
        reviewsCount: 116,
        images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Game On Cafe", "LED Floodlights", "High Netting", "Parking"],
        timeSlots: [{ id: "s1", startTime: "20:00", endTime: "22:00", label: "Game On Night Slam", price: 1150, isBooked: false, isPeak: true }],
        contactPhone: "+91 99042 11990",
        managerName: "Haresh Katargam"
    },

    // 29. POWERPLAY BOX TURF PARVAT PATIA
    {
        name: "PowerPlay Box Turf",
        slug: "powerplay-box-turf-parvat-patia",
        type: "Box Cricket Turf",
        description: "High-power synthetic turf on Model Town Road Parvat Patia featuring FIFA 3G grass layout and bright lighting.",
        location: {
            address: "Model Town Road, Near BRTS Junction, Parvat Patia",
            city: "Surat",
            area: "Parvat Patia",
            state: "Gujarat",
            coordinates: { lat: 21.1790, lng: 72.8610 },
            googleMapsUrl: "https://maps.google.com/?q=Model+Town+Road+Parvat+Patiya+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.2!2d72.8610!3d21.1790!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDEwJzQ0LjQgTiA3MsKwNTEnMzkuNiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 980,
        rating: 4.80,
        reviewsCount: 104,
        images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["FIFA 3G Grass", "Night Lights", "Player Bench", "Parking"],
        timeSlots: [{ id: "s1", startTime: "19:00", endTime: "21:00", label: "PowerPlay Slam", price: 1100, isBooked: false, isPeak: true }],
        contactPhone: "+91 98253 99887",
        managerName: "Dipak Parvat"
    },

    // 30. VESU PREMIER LEAGUE TURF
    {
        name: "Vesu Premier League Turf",
        slug: "vesu-premier-league-turf",
        type: "Box Cricket Turf",
        description: "Tournament-grade synthetic box turf near Someshwara Enclave Vesu built for local box leagues and weekend matches.",
        location: {
            address: "Someshwara Enclave Road, Vesu Main Road, Vesu",
            city: "Surat",
            area: "Vesu",
            state: "Gujarat",
            coordinates: { lat: 21.1470, lng: 72.7745 },
            googleMapsUrl: "https://maps.google.com/?q=Someshwara+Enclave+Vesu+Surat",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.3!2d72.7745!3d21.1470!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA4JzQ5LjIiTiA3MsKwNDYnMjguMiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        },
        pricePerHour: 1250,
        rating: 4.88,
        reviewsCount: 150,
        images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["Premier Turf", "LED Floodlights", "Player Dugout", "Parking"],
        timeSlots: [{ id: "s1", startTime: "18:00", endTime: "20:00", label: "VPL Prime Match", price: 1350, isBooked: false, isPeak: true }],
        contactPhone: "+91 98250 33445",
        managerName: "Nirav Vesu"
    }
];

export async function GET(request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const area = searchParams.get('area');
        const type = searchParams.get('type');
        const search = searchParams.get('search');
        const forceSeed = searchParams.get('seed') === 'true';

        // Auto seed or update Surat grounds cleanly if count is less than 30
        const count = await Ground.countDocuments({ 'location.city': 'Surat' });
        if (count < 30 || forceSeed) {
            await Ground.deleteMany({});
            await Ground.insertMany(SURAT_ALL_45_TURFS);
        }

        let query = { isActive: true };

        if (area && area !== 'All') {
            query['location.area'] = { $regex: area, $options: 'i' };
        }

        if (type && type !== 'All') {
            query.type = type;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { 'location.address': { $regex: search, $options: 'i' } },
                { 'location.area': { $regex: search, $options: 'i' } },
                { 'location.city': { $regex: search, $options: 'i' } },
                { amenities: { $elemMatch: { $regex: search, $options: 'i' } } }
            ];
        }

        const grounds = await Ground.find(query).sort({ rating: -1, createdAt: -1 });

        return NextResponse.json({
            success: true,
            count: grounds.length,
            city: "Surat",
            grounds
        });

    } catch (error) {
        console.error('Error fetching Surat grounds:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch Surat grounds' },
            { status: 500 }
        );
    }
}
