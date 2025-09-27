import React from 'react';
import { ArrowRight, Star, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import GoldButton from '../components/GoldButton';

const LandingPage = () => {
  const featuredGallery = [
    {
      id: '1',
      image: '/assets/images/executive_suite_room.jpg',
      title: 'Luxury Suite',
      category: 'rooms',
    },
    {
      id: '2',
      image: '/assets/images/restaurant.jpg',
      title: 'Restaurant',
      category: 'restaurant',
    },
    {
      id: '3',
      image: '/assets/images/pool_area1.jpg',
      title: 'Pool Area',
      category: 'facilities',
    },
      {
      id: '4',
      image: '/assets/images/exterior.jpg',
      title: 'Hotel Exterior',
      category: 'exterior',
    },
  ];


  const testimonials = [
    {
      id: "1",
      name: "Ekomobong Finbarr",
      rating: 5,
      comment:
        "Wonderful Stay with Exceptional Service. The complementary breakfast was a delightful surprise, offering a diverse and delicious spread to start the day on a positive note. The effortless Check-In and Check-Out, swimming pool, and lounge made my stay wonderful. Looking forward to returning in the future!",
      avatar: "/assets/images/testimony_pic1.png",
    },
    {
      id: "2",
      name: "Alade Olayinka",
      rating: 5,
      comment:
        "Absolutely phenomenal experience at smile T continental hotel. From the moment we walked in, the warm and welcoming staff made us feel at home. The attention to detail in the room was exquisite, creating a cozy and homely atmosphere. The amenities were top-notch. The dining experience was a culinary delight, with a diverse menu that catered to all tastes. What truly sets this hotel apart is the exceptional customer service - every staff member went above and beyond to make our stay memorable. Thank you, smile T continental, for an unforgettable and delightful stay. We can't wait to return!",
      avatar: "/assets/images/testimony_pic2.png",
    },
    {
      id: "3",
      name: "Ademoye Ronke Edem",
      rating: 5,
      comment: "Nice guest house",
      avatar: "/assets/images/testimony_pic3.png",
    },
  ];

  const [currentTestimonial, setCurrentTestimonial] = React.useState(0);
  const [expandedText, setExpandedText] = React.useState(false);

  // Auto-slide testimonials every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handlePrevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setExpandedText(false); // Reset expanded text when changing testimonials
  };
  
  const handleNextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    setExpandedText(false); // Reset expanded text when changing testimonials
  };

  const truncateText = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const toggleTextExpansion = () => {
    setExpandedText(!expandedText);
  };

  const amenities = [
    {
      name: 'Gym',
      image: '/assets/images/gym1.jpg',
      description: 'State-of-the-art fitness center for all guests.',
    },
    {
      name: 'Swimming',
      image: '/assets/images/pool.jpg',
      description: 'Relax and refresh in our beautiful swimming pool.',
    },
    {
      name: 'Laundry',
      image: '/assets/images/laundry.jpg',
      description: 'Professional laundry services for your convenience.',
    },
    {
      name: 'Lounge',
      image: '/assets/images/lounge.jpg',
      description:
        'Spacious lounge (50 people capacity) for mini gatherings, birthdays, club meetings, anniversaries, etc.',
    },
  ];



  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden animate-slide-in-up">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(/assets/images/hero_image.svg)",
          }}
        />
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl animate-fade-in animate-delay-300">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-[#fff]">
            Welcome to<br />
            <span className="text-[#fff]">Smile-T Continental Hotel</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-[#FFF]">
            Experience luxury, comfort, and exceptional service in the heart of the city
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/rooms">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#7B3F00] text-[#FFD700] flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold hover:bg-[#FFD700] hover:text-[#7B3F00] transition-colors duration-300 shadow-lg"
              >
                <span>Book Now</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/gallery">
              <GoldButton
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-[#FFD700] text-[#7B3F00] flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold hover:bg-[#7B3F00] hover:text-[#FFD700] transition-colors duration-300 border-none shadow-lg"
              >
                <span>View Gallery</span>
                <Camera className="w-5 h-5" />
              </GoldButton>
            </Link>
          </div>
        </div>
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FFD700]/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#7B3F00] mb-4">Amenities We Offer</h2>
            <p className="text-xl text-[#7B3F00]/80 max-w-2xl mx-auto">
              Enjoy a wide range of amenities designed for your comfort and convenience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {amenities.map((amenity) => (
              <div
                key={amenity.name}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full overflow-hidden border-2 border-[#FFD700]/40 hover:border-[#FFD700]"
              >
                <div className="w-full h-44 md:h-48 lg:h-56 overflow-hidden">
                  <img
                    src={amenity.image}
                    alt={amenity.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold mb-2 text-[#7B3F00]">{amenity.name}</h3>
                  <p className="text-[#7B3F00]/80 flex-1">{amenity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#7B3F00]/5 animate-slide-in-up animate-delay-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in animate-delay-300">
            <h2 className="text-4xl font-bold text-[#7B3F00] mb-4">Our Gallery</h2>
            <p className="text-xl text-[#7B3F00]/80 max-w-2xl mx-auto">
              Take a glimpse into the luxury and beauty that awaits you at Smile-T Continental
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredGallery.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-w-4 aspect-h-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm opacity-90">{item.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/gallery">
              <Button
                size="lg"
                className="inline-flex items-center justify-center gap-2 bg-[#7B3F00] text-[#FFD700] px-6 py-3 rounded-md font-semibold hover:bg-[#FFD700] hover:text-[#7B3F00] transition-colors duration-300 border-none"
              >
                <span>View Full Gallery</span>
                <Camera className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FFD700]/10 animate-slide-in-left animate-delay-400">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#7B3F00] mb-4">What Our Guests Say</h2>
            <p className="text-xl text-[#7B3F00]/80 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied guests
            </p>
          </div>
          <div className="flex justify-center items-center gap-4">
            <button
              aria-label="Previous testimonial"
              onClick={handlePrevTestimonial}
              className="p-2 rounded-full bg-[#FFD700]/20 hover:bg-[#FFD700]/40 text-[#7B3F00] transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className={`bg-white p-6 rounded-xl shadow-md border-2 border-[#FFD700]/40 w-full max-w-md text-center flex flex-col transition-all duration-300 ${expandedText ? 'h-auto' : 'h-64'}`}>
              <div className="flex items-center justify-center mb-4 flex-shrink-0">
                <img
                  src={testimonials[currentTestimonial].avatar}
                  alt={testimonials[currentTestimonial].name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div className="text-left">
                  <h3 className="font-semibold text-[#7B3F00]">
                    {testimonials[currentTestimonial].name}
                  </h3>
                  <div className="flex items-center">
                    {[...Array(testimonials[currentTestimonial].rating)].map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400"
                          strokeWidth={0}
                          fill="currentColor"
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-[#7B3F00]/80 italic mb-2">
                  "{expandedText 
                    ? testimonials[currentTestimonial].comment 
                    : truncateText(testimonials[currentTestimonial].comment)
                  }"
                </p>
                
                {testimonials[currentTestimonial].comment.length > 120 && (
                  <button
                    onClick={toggleTextExpansion}
                    className="text-[#FFD700] hover:text-[#FFD700]/80 text-sm font-medium transition-colors mt-2 flex-shrink-0"
                  >
                    {expandedText ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            </div>
            <button
              aria-label="Next testimonial"
              onClick={handleNextTestimonial}
              className="p-2 rounded-full bg-[#FFD700]/20 hover:bg-[#FFD700]/40 text-[#7B3F00] transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>


    </div>
  );
};
export default LandingPage;