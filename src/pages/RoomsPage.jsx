import { Link } from "react-router-dom";

const rooms = [
  {
    type: "Classic Single",
    price: "₦24,900",
    guests: 2,
    services: "Complimentary breakfast, free Wi-Fi, gym and pool (1 guest)",
    description: "Just a bed, smart TV and active intercom.",
    image:
      "/assets/images/classic_single_room.jpg",
  },
  {
    type: "Deluxe",
    price: "₦30,500",
    guests: 2,
    services: "Complimentary breakfast, free Wi-Fi, gym and pool (1 guest)",
    description: "Just a bed, smart TV and active intercom.",
    image:
      "assets/images/deluxe_room.jpg",
  },
  {
    type: "Deluxe Large",
    price: "₦35,900",
    guests: 2,
    services: "Complimentary breakfast, free Wi-Fi, gym and pool (1 guest)",
    description: "Just a bed, smart TV and active intercom.",
    image:
      "/assets/images/deluxe_large_room.jpg",
  },
  {
    type: "Business Suite",
    price: "₦49,900",
    guests: 4,
    services: "Complimentary breakfast, free Wi-Fi, gym and pool (2 guests)",
    description:
      "Sitting room and bedroom with quality sofa, intercom and smart TV in each room.",
    image:
      "assets/images/business_suite_room.jpg",
  },
  {
    type: "Executive Suite",
    price: "₦54,900",
    guests: 4,
    services: "Complimentary breakfast, free Wi-Fi, gym and pool (2 guests)",
    description:
      "Sitting room and bedroom with quality sofa, intercom and smart TV in each room.",
    image:
      "assets/images/executive_suite_room.jpg",
  },
];

export default function RoomsPage() {
  return (
    <section className="container mx-auto py-12">
      <h2 className="text-3xl font-bold mb-8 text-[#7B3F00] px-6 sm:px-0">
        Available Rooms
      </h2>
      {rooms.length === 0 ? (
        <div className="text-center text-[#FFD700] text-lg py-12">No rooms available at the moment. Please check back later.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow p-6 flex flex-col"
            >
              <img
                src={room.image}
                alt={room.type}
                className="rounded mb-4 h-48 object-cover"
              />
              <h3 className="text-xl font-semibold mb-2 text-[#7B3F00]">
                {room.type}
              </h3>
              <div className="mb-2">
                <span className="font-bold text-[#7B3F00]">Price:</span>{" "}
                {room.price}
              </div>
              <div className="mb-2">
                <span className="font-bold text-[#7B3F00]">Max Guests:</span>{" "}
                {room.guests}
              </div>
              <div className="mb-2">
                <span className="font-bold text-[#7B3F00]">Services:</span>{" "}
                {room.services}
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
