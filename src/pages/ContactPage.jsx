import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="p-4 sm:p-8">
      <h2 className="text-3xl font-bold mb-4 text-[#7B3F00]">Contact Us</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4 flex items-start gap-3">
          <MapPin className="mt-1 text-[#FFD700]" size={20} aria-hidden="true" />
          <div>
            <span className="font-semibold text-[#7B3F00]">Location:</span><br />
            <span className="text-[#7B3F00]">7, Ganiyu Olawale Street, Iyana-Ejigbo, Lagos</span>
          </div>
        </div>

        <div className="mb-4 flex items-start gap-3">
          <Phone className="mt-1 text-[#FFD700]" size={20} aria-hidden="true" />
          <div>
            <span className="font-semibold text-[#7B3F00]">Phone numbers:</span><br />
            <a href="tel:+2348053233660" className="text-[#7B3F00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#7B3F00]" aria-label="Call 08053233660">08053233660</a>,
            <a href="tel:+2348021125918" className="ml-2 text-[#7B3F00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#7B3F00]" aria-label="Call 08021125918">08021125918</a> &
            <a href="tel:+2348034584910" className="ml-2 text-[#7B3F00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#7B3F00]" aria-label="Call 08034584910">08034584910</a>
          </div>
        </div>

        <div className="mb-4 flex items-start gap-3">
          <Mail className="mt-1 text-[#FFD700]" size={20} aria-hidden="true" />
          <div>
            <span className="font-semibold text-[#7B3F00]">Email:</span><br />
            <a href="mailto:Smiletcontinentalhotel1@gmail.com" className="text-[#7B3F00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#7B3F00]" aria-label="Email Smiletcontinentalhotel1@gmail.com">Smiletcontinentalhotel1@gmail.com</a><br />
            <a href="mailto:Smiletcontinentalhotel@gmail.com" className="text-[#7B3F00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#7B3F00]" aria-label="Email Smiletcontinentalhotel@gmail.com">Smiletcontinentalhotel@gmail.com</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
