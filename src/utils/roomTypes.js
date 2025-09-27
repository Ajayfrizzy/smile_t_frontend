// Predefined room types with all their details
export const ROOM_TYPES = [
  {
    id: 'classic-single',
    room_type: "Classic Single",
    price_per_night: 24900,
    max_occupancy: 2,
    amenities: "Complimentary breakfast, free Wi-Fi, gym and pool (1 guest)",
    description: "Just a bed, smart TV and active intercom.",
    image: "/assets/images/classic_single_room.jpg",
  },
  {
    id: 'deluxe',
    room_type: "Deluxe",
    price_per_night: 30500,
    max_occupancy: 2,
    amenities: "Complimentary breakfast, free Wi-Fi, gym and pool (1 guest)",
    description: "Just a bed, smart TV and active intercom.",
    image: "/assets/images/deluxe_room.jpg",
  },
  {
    id: 'deluxe-large',
    room_type: "Deluxe Large",
    price_per_night: 35900,
    max_occupancy: 2,
    amenities: "Complimentary breakfast, free Wi-Fi, gym and pool (1 guest)",
    description: "Just a bed, smart TV and active intercom.",
    image: "/assets/images/deluxe_large_room.jpg",
  },
  {
    id: 'business-suite',
    room_type: "Business Suite",
    price_per_night: 49900,
    max_occupancy: 4,
    amenities: "Complimentary breakfast, free Wi-Fi, gym and pool (2 guests)",
    description: "Sitting room and bedroom with quality sofa, intercom and smart TV in each room.",
    image: "/assets/images/business_suite_room.jpg",
  },
  {
    id: 'executive-suite',
    room_type: "Executive Suite",
    price_per_night: 54900,
    max_occupancy: 4,
    amenities: "Complimentary breakfast, free Wi-Fi, gym and pool (2 guests)",
    description: "Sitting room and bedroom with quality sofa, intercom and smart TV in each room.",
    image: "/assets/images/executive_suite_room.jpg",
  },
];

// Get room type by ID
export const getRoomTypeById = (id) => {
  return ROOM_TYPES.find(roomType => roomType.id === id);
};

// Get room type by name
export const getRoomTypeByName = (name) => {
  return ROOM_TYPES.find(roomType => roomType.room_type === name);
};