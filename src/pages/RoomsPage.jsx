import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../utils/api";

// Fallback room data in case API is not available
const fallbackRooms = [
  {
    room_type: "Classic Single",
    price_per_night: 24900,
    max_occupancy: 2,
    amenities: "Complimentary breakfast, free Wi-Fi, gym and pool (1 guest)",
    description: "Just a bed, smart TV and active intercom.",
    image: "/assets/images/classic_single_room.jpg",
  },
  {
    room_type: "Deluxe",
    price_per_night: 30500,
    max_occupancy: 2,
    amenities: "Complimentary breakfast, free Wi-Fi, gym and pool (1 guest)",
    description: "Just a bed, smart TV and active intercom.",
    image: "assets/images/deluxe_room.jpg",
  },
  {
    room_type: "Deluxe Large",
    price_per_night: 35900,
    max_occupancy: 2,
    amenities: "Complimentary breakfast, free Wi-Fi, gym and pool (1 guest)",
    description: "Just a bed, smart TV and active intercom.",
    image: "/assets/images/deluxe_large_room.jpg",
  },
  {
    room_type: "Business Suite",
    price_per_night: 49900,
    max_occupancy: 4,
    amenities: "Complimentary breakfast, free Wi-Fi, gym and pool (2 guests)",
    description: "Sitting room and bedroom with quality sofa, intercom and smart TV in each room.",
    image: "assets/images/business_suite_room.jpg",
  },
  {
    room_type: "Executive Suite",
    price_per_night: 54900,
    max_occupancy: 4,
    amenities: "Complimentary breakfast, free Wi-Fi, gym and pool (2 guests)",
    description: "Sitting room and bedroom with quality sofa, intercom and smart TV in each room.",
    image: "assets/images/executive_suite_room.jpg",
  },
];

export default function RoomsPage() {
  const [rooms, setRooms] = useState(fallbackRooms); // Start with fallback data immediately
  const [loading, setLoading] = useState(false); // No loading state needed

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // Fetch in background without blocking UI
        const response = await apiRequest('/room-inventory/available');
        if (response && response.ok) {
          const data = await response.json();
          if (data && data.success && data.data && data.data.length > 0) {
            // Update with fresh data when available
            setRooms(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        // Keep using fallback data on error
      }
    };

    fetchRooms();
  }, []);

  // Helper function to get appropriate image for room type
  const getImageForRoomType = (roomType) => {
    const imageMap = {
      'Classic Single': '/assets/images/classic_single_room.jpg',
      'Deluxe': '/assets/images/deluxe_room.jpg',
      'Deluxe Large': '/assets/images/deluxe_large_room.jpg',
      'Business Suite': '/assets/images/business_suite_room.jpg',
      'Executive Suite': '/assets/images/executive_suite_room.jpg'
    };
    return imageMap[roomType] || '/assets/images/classic_single_room.jpg';
  };

  const formatPrice = (price) => {
    return `₦${price?.toLocaleString() || '0'}`;
  };

  return (
    <section className="container mx-auto py-12 animate-fade-in">
      <h2 className="text-3xl font-bold mb-8 text-[#7B3F00] px-6 sm:px-0 animate-slide-in-left">
        Available Rooms
      </h2>
      {rooms.length === 0 ? (
        <div className="text-center text-[#FFD700] text-lg py-12">No rooms available at the moment. Please check back later.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-in-up animate-delay-200">
          {rooms.map((room, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow p-6 flex flex-col"
            >
              <img
                src={room.image}
                alt={room.room_type}
                className="rounded mb-4 h-48 object-cover"
              />
              <h3 className="text-xl font-semibold mb-2 text-[#7B3F00]">
                {room.room_type}
              </h3>
              <div className="mb-2">
                <span className="font-bold text-[#7B3F00]">Price:</span>{" "}
                {formatPrice(room.price_per_night)}/night
              </div>
              <div className="mb-2">
                <span className="font-bold text-[#7B3F00]">Max Guests:</span>{" "}
                {room.max_occupancy}
              </div>
              <div className="mb-2">
                <span className="font-bold text-[#7B3F00]">Amenities:</span>{" "}
                {room.amenities}
              </div>
              <div className="mb-2">
                <span className="font-bold text-[#7B3F00]">Description:</span>{" "}
                {room.description}
              </div>
              <Link
                to="/booking"
                className="mt-auto bg-[#7B3F00] text-[#FFD700] px-4 py-2 rounded hover:bg-[#FFD700] hover:text-[#7B3F00] transition-colors duration-300 text-center"
              >
                Book Now
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
