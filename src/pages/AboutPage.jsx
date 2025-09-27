import logo from "/assets/images/logo.svg";

const AboutPage = () => {
  return (
    <main className="max-w-6xl mx-auto p-6 sm:p-12 animate-fade-in">
      <section aria-labelledby="about-heading" className="bg-white shadow-lg rounded-lg overflow-hidden animate-scale-in animate-delay-200">
        <div className="md:flex">
          <div className="md:w-1/2 p-6 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
            <img src={logo} alt="Smile Continental logo" className="w-44 h-fit object-cover shadow-md" />
          </div>
          <div className="md:w-1/2 p-6">
            <h1 id="about-heading" className="text-3xl font-extrabold text-gray-900 mb-4">About Smile-T Continental Hotel</h1>
            <p className="text-gray-700 mb-4">Welcome to Smile-T Continental Hotel — where comfort meets elegance. We focus on thoughtful hospitality, modern amenities, and a warm atmosphere so every stay feels memorable.</p>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li><strong>Premium rooms & suites</strong> crafted for rest and productivity.</li>
              <li><strong>24/7 guest support</strong> to help with anything you need.</li>
              <li><strong>Central, convenient location</strong> close to transit and attractions.</li>
              <li><strong>Modern amenities</strong> including high-speed Wi‑Fi and on-site dining.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
