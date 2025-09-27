import React from "react";

import {
  Instagram,
  Facebook,
  ExternalLink,
  Heart,
  MessageCircle,
  Share,
} from "lucide-react";

const SocialPage = () => {
  const socialPlatforms = [
    {
      platform: "Instagram",
      icon: Instagram,
      handle: "smile_tcontinentalhotel",
      followers: "",
      url: "https://instagram.com/smile_tcontinentalhotel",
      color: "from-pink-500 to-purple-600",
      description: "Follow us for updates, photos, and more!",
    },
    {
      platform: "Facebook",
      icon: Facebook,
      handle: "Smile-T Continental Hotel",
      followers: "",
      url: "https://facebook.com/SmileTContinentalHotel",
      color: "from-blue-600 to-blue-800",
      description: "Connect with us for news and offers.",
    },
  ];

  {
    /*const recentPosts = [
      {
        id: '1',
        platform: 'Facebook',
        image: 'https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg',
        caption: 'Join us for an exquisite dining experience at our rooftop restaurant. Book your table now! 🍽️',
        likes: 156,
        comments: 23,
        timeAgo: '5 hours ago'
      },
    {
      id: '2',
      platform: 'Instagram',
      image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
      caption: 'Luxury meets comfort in our premium suites ✨ #LuxuryStay #HotelGrandeur',
      likes: 324,
      comments: 18,
      timeAgo: '2 hours ago'
    },
    {
      id: '3',
      platform: 'Instagram',
      image: 'https://images.pexels.com/photos/271694/pexels-photo-271694.jpeg',
      caption: 'Take a dip in our infinity pool while enjoying the city skyline 🏊‍♀️ #PoolViews',
      likes: 542,
      comments: 31,
      timeAgo: '1 day ago'
    },

  ];*/
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Follow Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay connected with Smile-T Continental across all social media
            platforms. Get the latest updates, behind-the-scenes content, and
            exclusive offers.
          </p>
        </div>

        {/* Social Media Platforms */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Connect With Us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {socialPlatforms.map((social) => {
              const Icon = social.icon;
              return (
                <div
                  key={social.platform}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div
                    className={`bg-gradient-to-br ${social.color} p-6 text-white`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="w-8 h-8" />
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                    <h3 className="text-xl font-bold mb-1">
                      {social.platform}
                    </h3>
                    <p className="text-sm opacity-90">{social.handle}</p>
                    <p className="text-lg font-semibold mt-2">
                      {social.followers} followers
                    </p>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600">{social.description}</p>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center mt-4 px-4 py-2 bg-gradient-to-r ${social.color} text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200`}
                    >
                      Follow Us
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Posts Feed */}
        {/*<section>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Recent Posts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={post.image}
                    alt="Social media post"
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {post.platform}
                    </span>
                    <span className="text-sm text-gray-500">
                      {post.timeAgo}
                    </span>
                  </div>
                  <p className="text-gray-800 mb-4 leading-relaxed">
                    {post.caption}
                  </p>
                  <div className="flex items-center space-x-6 text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {post.comments}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 ml-auto">
                      <Share className="w-5 h-5 hover:text-blue-600 cursor-pointer transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>*/}

        {/* Call to Action */}
        <section className="text-center mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl mb-8 opacity-90">
            Be part of the Smile-T Continental family and stay updated with our
            latest news, special offers, and exclusive content.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {socialPlatforms.slice(0, 3).map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
                >
                  <Icon className="w-6 h-6" />
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SocialPage;
