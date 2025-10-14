import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import Logo from "/assets/images/logo.svg";

const ContactPage = () => {
  return (
    <div className="p-4 sm:p-8 animate-fade-in">
      <h2 className="text-3xl font-bold mb-4 text-[#7B3F00] animate-slide-in-left">
        Contact Us
      </h2>
      <div className="max-w-6xl animate-slide-in-up animate-delay-200">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Contact Information */}
          <div className="space-y-6 bg-white rounded-lg shadow p-6">
            <div className="flex items-start gap-3">
              <MapPin
                className="mt-1 text-[#FFD700] flex-shrink-0"
                size={20}
                aria-hidden="true"
              />
              <div>
                <span className="font-semibold text-[#7B3F00]">Location:</span>
                <br />
                <span className="text-[#7B3F00]">
                  7, Ganiyu Olawale Street, Iyana-Ejigbo, Lagos
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone
                className="mt-1 text-[#FFD700] flex-shrink-0"
                size={20}
                aria-hidden="true"
              />
              <div>
                <span className="font-semibold text-[#7B3F00]">
                  Phone numbers:
                </span>
                <br />
                <div className="flex flex-wrap gap-1">
                  <a
                    href="tel:+2348053233660"
                    className="text-[#7B3F00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                    aria-label="Call 08053233660"
                  >
                    08053233660
                  </a>
                  ,
                  <a
                    href="tel:+2348021125918"
                    className="text-[#7B3F00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                    aria-label="Call 08021125918"
                  >
                    08021125918
                  </a>{" "}
                  &
                  <a
                    href="tel:+2348034584910"
                    className="text-[#7B3F00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                    aria-label="Call 08034584910"
                  >
                    08034584910
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail
                className="mt-1 text-[#FFD700] flex-shrink-0"
                size={20}
                aria-hidden="true"
              />
              <div>
                <span className="font-semibold text-[#7B3F00]">Email:</span>
                <br />
                <a
                  href="mailto:info@smile-tcontinental.com"
                  className="text-[#7B3F00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#7B3F00] block"
                  aria-label="Email info@smile-tcontinental.com"
                >
                  Info@smile-tcontinental.com
                </a>
                {/*<a
                  href="mailto:Smiletcontinentalhotel1@gmail.com"
                  className="text-[#7B3F00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#7B3F00] block"
                  aria-label="Email Smiletcontinentalhotel1@gmail.com"
                >
                  Smiletcontinentalhotel1@gmail.com
                </a>
                <a
                  href="mailto:Smiletcontinentalhotel@gmail.com"
                  className="text-[#7B3F00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#7B3F00] block"
                  aria-label="Email Smiletcontinentalhotel@gmail.com"
                >
                  Smiletcontinentalhotel@gmail.com
                </a>*/}
              </div>
            </div>
          </div>

          {/* Logo Image - Hidden on mobile, visible on desktop */}
          <div className="hidden md:flex justify-center md:justify-end">
            <div className="md:w-1/2 p-6 flex items-center justify-end bg-gradient-to-br from-gray-50 to-white">
              <img
                src={Logo}
                alt="Smile Continental logo"
                className="w-full h-fit object-cover shadow-md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
