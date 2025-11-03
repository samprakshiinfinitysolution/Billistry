import Image from 'next/image';

const AppPromoSection = () => {
  return (
    <section
      className="relative bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] py-20 px-6 font-poppins overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center z-10">
        {/* Left Column: Text and Buttons */}
        <div className="text-center md:text-left">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight font-roboto text-white">
              Run Your Business, <br />
            <span className="text-[#A78BFA]">From Anywhere.</span>
          </h2>

          <p className="text-lg text-gray-300 mb-10 max-w-lg mx-auto md:mx-0">
           Simplify your daily operations with Billistry — manage inventory, track performance, and grow smarter, anywhere you go.
          </p>

          {/* Download Links */}
          <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-6">
            <a href="#" aria-label="Download on the App Store" className="inline-block transition-transform hover:scale-105">
              <Image 
                src="/images/appstore.svg" 
                alt="Download on the App Store" 
                width={160} 
                height={53} 
              />
            </a>
            <a href="#" aria-label="Get it on Google Play" className="inline-block transition-transform hover:scale-105">
              <Image 
                src="/images/playstore-badge.svg" 
                alt="Get it on Google Play" 
                width={160} 
                height={53} 
              />
            </a>
          </div>
        </div>

        {/* Right Column: Image Mockups */}
        <div className="relative flex justify-center animate-float">
          <div className="relative w-full max-w-lg">
            <Image
              src="/images/mobile-app-so-2x.png"
              alt="Screenshots of the mobile application showing sales activity and a package delivery status timeline."
              width={700}
              height={650}
              className="drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppPromoSection;