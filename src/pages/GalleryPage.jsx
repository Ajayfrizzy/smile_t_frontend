import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';


const GalleryPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all')
  const galleryItems = [
    {
      id: '1',
      image: '/assets/images/deluxe_large_room.jpg',
      title: 'Deluxe Room',
      category: 'rooms',
      description: 'Comfortable and elegantly designed deluxe room'
    },
    {
      id: '2',
      image: '/assets/images/business_suite_room.jpg',
      title: 'Business Suite',
      category: 'rooms',
      description: 'Our premium luxury suite with panoramic city views'
    },
    {
      id: '3',
      image: '/assets/images/executive_suite_room.jpg',
      title: 'Executive Suite',
      category: 'rooms',
      description: 'Our premium luxury suite with panoramic city views'
    },
    {
      id: '4',
      image: '/assets/images/exterior.jpg',
      title: 'Hotel Exterior',
      category: 'exterior',
      description: 'Beautiful exterior architecture of Smile-T Continental'
    },
    {
      id: '5',
      image: '/assets/images/exterior_hallway1.jpg',
      title: 'Hotel Exterior',
      category: 'exterior',
      description: 'Beautiful exterior hallway architecture of Smile-T Continental'
    },
    {
      id: '6',
      image: 'assets/images/restaurant_entrance.jpg',
      title: 'Fine Dining Restaurant Entrance',
      category: 'restaurant',
      description: 'Elegant dining experience with world-class cuisine'
    },
    {
      id: '7',
      image: 'assets/images/restaurant.jpg',
      title: 'Fine Dining Restaurant',
      category: 'restaurant',
      description: 'Elegant dining experience with world-class cuisine'
    },
    {
      id: '8',
      image: '/assets/images/pool_area1.jpg',
      title: 'Pool area',
      category: 'facilities',
      description: 'Pool area with great atmosphere'
    },
    {
      id: '9',
      image: '/assets/images/pool_area2.jpg',
      title: 'Pool area',
      category: 'facilities',
      description: 'Pool area with great atmosphere'
    },
    {
      id: '10',
      image: '/assets/images/pool.jpg',
      title: 'Swimming Pool',
      category: 'facilities',
      description: 'Infinity pool with stunning views'
    },
    {
      id: '11',
      image: '/assets/images/lounge.jpg',
      title: 'Lounge',
      category: 'events',
      description: 'Perfect venue for special events with 50 sittings capacity'
    },
    {
      id: '12',
      image: '/assets/images/lounge2.jpg',
      title: 'Lounge area',
      category: 'events',
      description: 'More pictures of the lounge'
    },
    {
      id: '13',
      image: '/assets/images/lounge3.jpg',
      title: 'Lounge area',
      category: 'events',
      description: 'More pictures of the lounge'
    },
    {
      id: '14',
      image: '/assets/images/waiting_area.jpg',
      title: 'Waiting area',
      category: 'reception',
      description: 'Elegant waiting area'
    },
    {
      id: '15',
      image: '/assets/images/reception.jpg',
      title: 'Reception',
      category: 'reception',
      description: 'Welcome you all to our reception'
    },
    {
      id: '16',
      image: '/assets/images/reception1.jpg',
      title: 'Reception',
      category: 'reception',
      description: 'More picture for reception'
    },
    {
      id: '17',
      image: '/assets/images/bar_section.jpg',
      title: 'Bar',
      category: 'bar',
      description: 'Elegant Bar'
    },
    {
      id: '18',
      image: '/assets/images/vip_bar_area.jpg',
      title: 'Vip Bar area',
      category: 'bar',
      description: 'Elegant Vip Bar area'
    },
    {
      id: '19',
      image: '/assets/images/vip_bar_area1.jpg',
      title: 'Vip Bar area',
      category: 'bar',
      description: 'Elegant Vip Bar area'
    },
     {
      id: '20',
      image: '/assets/images/minimart.jpg',
      title: 'Minimart',
      category: 'facilities',
      description: 'Looking to get something great to beautify your body, visit our minimart'
    },
     {
      id: '21',
      image: '/assets/images/gym_entrance.jpg',
      title: 'Gym Entrance',
      category: 'facilities',
      description: 'Providing rejuvenating massages and body fitness'
    },
     {
      id: '22',
      image: '/assets/images/gym1.jpg',
      title: 'Gym',
      category: 'facilities',
      description: 'Providing rejuvenating massages and body fitness'
    },
     {
      id: '23',
      image: '/assets/images/gym2.jpg',
      title: 'Gym',
      category: 'facilities',
      description: 'Providing rejuvenating massages and body fitness'
    },
     {
      id: '24',
      image: '/assets/images/hallway1.jpg',
      title: 'Hallway',
      category: 'facilities',
      description: 'Beautifully designed hallway'
    },
     {
      id: '25',
      image: '/assets/images/hallway2.jpg',
      title: 'Hallway',
      category: 'facilities',
      description: 'Beautifully designed hallway'
    },
     {
      id: '26',
      image: '/assets/images/exterior.jpg',
      title: 'Hotel Exterior',
      category: 'facilities',
      description: 'Beautiful exterior architecture of Smile-T Continental Hotel'
    },
     {
      id: '27',
      image: '/assets/images/exterior1.jpg',
      title: 'Hotel Exterior',
      category: 'facilities',
      description: 'Beautiful exterior architecture of Smile-T Continental Hotel'
    },
  ];

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'rooms', label: 'Rooms' },
    { value: 'facilities', label: 'Facilities' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'exterior', label: 'Exterior' },
    { value: 'events', label: 'Events' },
    { value: 'bar', label: 'Bar' },
    { value: 'reception', label: 'Reception' },
  ];

  const filteredItems = selectedCategory === 'all' 
  ? galleryItems 
  : galleryItems.filter(item => item.category === selectedCategory);

  const openLightbox = (item) => {
    setSelectedImage(item);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const navigateImage = (direction) => {
    if (!selectedImage) return;
    
    const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1;
    } else {
      newIndex = currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedImage(filteredItems[newIndex]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  {/* Header */}
  <div className="text-center mb-12 animate-slide-in-up animate-delay-200">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Our Gallery</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the beauty and elegance of Smile-T Continental Hotel through our curated collection of images
          </p>
  </div>

        {/* Category Filter */}
  <div className="flex flex-wrap justify-center gap-4 mb-12 animate-slide-in-left animate-delay-300">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-6 py-3 rounded-full font-medium border-2 transition-all duration-200 ${
                selectedCategory === category.value
                  ? 'bg-[#7B3F00] text-[#FFD700] border-[#FFD700] shadow-lg'
                  : 'bg-white text-[#7B3F00] border-[#7B3F00]/30 hover:bg-[#FFD700]/20 hover:text-[#7B3F00] hover:border-[#FFD700] shadow-md'
              }`}
            >
              {category.label}
            </button>
          ))}
  </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => openLightbox(item)}
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
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm opacity-90">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={selectedImage.image}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('prev');
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('next');
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
              <p className="text-lg opacity-90">{selectedImage.description}</p>
            </div>
          </div>
  </div>
      )}
    </div>
  );
};

export default GalleryPage;