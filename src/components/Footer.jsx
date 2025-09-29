import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram} from 'lucide-react';
import logo from "/assets/images/logo.svg";

const Footer = () => {
  const socialLinks = [
    { icon: Facebook, href: 'https://web.facebook.com/profile.php?id=61557579815038', name: 'Facebook' },
    { icon: Instagram, href: 'https://www.instagram.com/smile_tcontinentalhotel', name: 'Instagram' },
  ];

  return (
  <footer className="bg-[#7B3F00] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src={logo} alt="Smile-T Continental Hotel logo" className="w-fit h-fit" />
              </div>
              <span className="text-xl font-bold text-[#fff]">Smile-T</span>
            </div>
            <p className="text-white text-sm">
              Experience luxury and comfort at Smile-T Continental. Your perfect stay awaits.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#FFD700]">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-white hover:text-[#FFD700] transition-colors">Home</Link>
              <Link to="/rooms" className="block text-white hover:text-[#FFD700] transition-colors">Rooms</Link>
              <Link to="/gallery" className="block text-white hover:text-[#FFD700] transition-colors">Gallery</Link>
              <Link to="/about" className="block text-white hover:text-[#FFD700] transition-colors">About</Link>
              <Link to="/contact" className="block text-white hover:text-[#FFD700] transition-colors">Contact</Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#FFD700]">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-[#FFD700]" />
                <span className="text-white text-sm">7, Ganiyu Olawale Street, iyana-ejigbo, Lagos.</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#FFD700]" />
                <span className="text-white text-sm">08053233660, 08021125918 & 08034584910</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#FFD700]" />
                <span className="text-white text-sm">
                  {/* <a href="mailto:Smiletcontinentalhotel1@gmail.com" className="hover:underline">Smiletcontinentalhotel1@gmail.com</a><br />
                  <a href="mailto:Smiletcontinentalhotel@gmail.com" className="hover:underline">Smiletcontinentalhotel@gmail.com</a> */}
                  <a href="mailto:info@smile-tcontinental.com" className="hover:underline">info@smile-tcontinental.com</a>
                </span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#FFD700]">Follow Us</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-[#7B3F00] rounded-lg flex items-center justify-center hover:bg-[#FFD700] hover:text-[#7B3F00] transition-colors duration-300"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

  <div className="border-t border-[#FFD700] mt-12 pt-8 text-center">
    <p className="text-[#FFD700] text-sm">
            © 2024 Smile-T Continental Hotel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;