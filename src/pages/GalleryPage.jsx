import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

const GalleryPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxCategory, setLightboxCategory] = useState('all');
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [imagesLoaded, setImagesLoaded] = useState({});
  
  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, lightboxCategory]);

  // Preload images for better performance
  useEffect(() => {
    galleryItems.forEach(item => {
      const img = new Image();
      img.src = item.image;
      img.onload = () => {
        setImagesLoaded(prev => ({ ...prev, [item.id]: true }));
      };
      img.onerror = () => {
        setImageLoadErrors(prev => ({ ...prev, [item.id]: true }));
      };
    });
  }, []);

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
      title: 'Hotel Exterior Hallway',
      category: 'exterior',
      description: 'Beautiful exterior hallway architecture of Smile-T Continental'
    },
    {
      id: '6',
      image: '/assets/images/restaurant_entrance.jpg',
      title: 'Fine Dining Restaurant Entrance',
      category: 'restaurant',
      description: 'Elegant dining experience with world-class cuisine'
    },
    {
      id: '7',
      image: '/assets/images/restaurant.jpg',
      title: 'Fine Dining Restaurant',
      category: 'restaurant',
      description: 'Elegant dining experience with world-class cuisine'
    },
    {
      id: '8',
      image: '/assets/images/pool_area1.jpg',
      title: 'Pool Area',
      category: 'facilities',
      description: 'Pool area with great atmosphere'
    },
    {
      id: '9',
      image: '/assets/images/pool_area2.jpg',
      title: 'Pool Area View',
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
      title: 'Lounge Area',
      category: 'events',
      description: 'More pictures of the lounge'
    },
    {
      id: '13',
      image: '/assets/images/lounge3.jpg',
      title: 'Lounge Interior',
      category: 'events',
      description: 'More pictures of the lounge'
    },
    {
      id: '14',
      image: '/assets/images/waiting_area.jpg',
      title: 'Waiting Area',
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
      title: 'Reception Desk',
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
      title: 'VIP Bar Area',
      category: 'bar',
      description: 'Elegant VIP Bar area'
    },
    {
      id: '19',
      image: '/assets/images/vip_bar_area1.jpg',
      title: 'VIP Bar Lounge',
      category: 'bar',
      description: 'Elegant VIP Bar area'
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
      title: 'Gym Equipment',
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
      title: 'Corridor',
      category: 'facilities',
      description: 'Beautifully designed hallway'
    },
    {
      id: '26',
      image: '/assets/images/exterior.jpg',
      title: 'Hotel Exterior View',
      category: 'facilities',
      description: 'Beautiful exterior architecture of Smile-T Continental Hotel'
    },
    {
      id: '27',
      image: '/assets/images/exterior1.jpg',
      title: 'Hotel Front',
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
    setLightboxCategory(selectedCategory);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const navigateImage = (direction) => {
    if (!selectedImage) return;
    
    const itemsToNavigate = lightboxCategory === 'all' 
      ? galleryItems 
      : galleryItems.filter(item => item.category === lightboxCategory);
    
    const currentIndex = itemsToNavigate.findIndex(item => item.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : itemsToNavigate.length - 1;
    } else {
      newIndex = currentIndex < itemsToNavigate.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedImage(itemsToNavigate[newIndex]);
  };

  const handleImageError = (e, itemId) => {
    setImageLoadErrors(prev => ({ ...prev, [itemId]: true }));
    console.error('Image failed to load:', e.target.src);
  };

  const handleImageLoad = (itemId) => {
    setImagesLoaded(prev => ({ ...prev, [itemId]: true }));
  };

  // Fallback image component
  const ImageWithFallback = ({ src, alt, className, itemId, onLoad, onError }) => {
    const hasError = imageLoadErrors[itemId];
    const isLoaded = imagesLoaded[itemId];

    return (
      <div className="relative w-full h-full">
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-[#7B3F00] rounded-full animate-spin"></div>
          </div>
        )}
        {hasError ? (
          <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
            <ImageOff className="w-12 h-12 mb-2" />
            <span className="text-sm">Image unavailable</span>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            onLoad={() => onLoad(itemId)}
            onError={(e) => onError(e, itemId)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Our Gallery
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Discover the beauty and elegance of Smile-T Continental Hotel through our curated collection of images
          </p>
        </div>

        {/* Category Filter - Horizontal scroll on mobile */}
        <div className="mb-8 sm:mb-12">
          <div className="flex overflow-x-auto sm:overflow-visible sm:flex-wrap sm:justify-center gap-3 sm:gap-4 pb-2 sm:pb-0 px-2 sm:px-0">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium border-2 transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === category.value
                    ? 'bg-[#7B3F00] text-[#FFD700] border-[#FFD700] shadow-lg'
                    : 'bg-white text-[#7B3F00] border-[#7B3F00]/30 hover:bg-[#FFD700]/20 hover:text-[#7B3F00] hover:border-[#FFD700] shadow-md'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid - Responsive columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-white aspect-[4/3]"
              onClick={() => openLightbox(item)}
            >
              <div className="w-full h-full overflow-hidden">
                <ImageWithFallback
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  itemId={item.id}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-base sm:text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-xs sm:text-sm opacity-90 line-clamp-2">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No images found in this category.</p>
          </div>
        )}
      </div>

      {/* Lightbox - Optimized for mobile and desktop */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 w-10 h-10 sm:w-14 sm:h-14 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all duration-200 border border-white/30 shadow-lg group"
              aria-label="Close gallery"
            >
              <X className="w-5 h-5 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
            </button>

            {/* Navigation Buttons - Smaller on mobile */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('prev');
              }}
              className="absolute left-2 sm:left-4 md:left-8 z-50 w-10 h-10 sm:w-14 sm:h-14 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all duration-200 border border-white/30 shadow-lg group"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('next');
              }}
              className="absolute right-2 sm:right-4 md:right-8 z-50 w-10 h-10 sm:w-14 sm:h-14 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all duration-200 border border-white/30 shadow-lg group"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
            </button>

            {/* Image Container - Responsive padding */}
            <div className="w-full h-full flex items-center justify-center p-12 sm:p-16 md:p-20">
              <div className="relative max-w-full max-h-full flex items-center justify-center">
                {imageLoadErrors[selectedImage.id] ? (
                  <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center text-gray-400">
                    <ImageOff className="w-16 h-16 mb-4" />
                    <span className="text-lg">Image unavailable</span>
                  </div>
                ) : (
                  <img
                    src={selectedImage.image}
                    alt={selectedImage.title}
                    className="max-w-full max-h-[75vh] sm:max-h-[85vh] w-auto h-auto object-contain rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                    onError={(e) => handleImageError(e, selectedImage.id)}
                  />
                )}
              </div>
            </div>

            {/* Image Info - Responsive text and padding */}
            <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-black/80 to-transparent p-4 sm:p-6 md:p-8">
              <div className="max-w-4xl mx-auto text-white">
                <h3 className="text-lg sm:text-xl md:text-3xl font-bold mb-1 sm:mb-2">
                  {selectedImage.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-lg opacity-90">
                  {selectedImage.description}
                </p>
                {/* Image counter */}
                <div className="mt-2 sm:mt-3 text-xs sm:text-sm opacity-70">
                  {(() => {
                    const items = lightboxCategory === 'all' 
                      ? galleryItems 
                      : galleryItems.filter(item => item.category === lightboxCategory);
                    const currentIndex = items.findIndex(item => item.id === selectedImage.id);
                    return `${currentIndex + 1} / ${items.length}`;
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;