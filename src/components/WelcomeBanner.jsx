import { Hand } from 'lucide-react';

const WelcomeBanner = () => {
  return (
    <div className="relative bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] rounded-2xl shadow-2xl p-8 sm:p-12 lg:p-16 m-5 mx-5  lg:mx-30 overflow-hidden">
      {/* Animated Aurora Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-20 -top-20 h-60 w-60 animate-aurora-1 rounded-full bg-purple-500/30 blur-3xl filter"></div>
        <div className="absolute -right-20 -bottom-20 h-60 w-60 animate-aurora-2 rounded-full bg-blue-500/30 blur-3xl filter"></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
        {/* Content Section */}
        <div>
          <h2 className="flex items-center justify-center lg:justify-start gap-3 text-3xl md:text-4xl font-bold text-white font-roboto mb-2">
            Namaste! Let’s Build Something Global.
            <Hand className="w-7 h-7 text-yellow-400 inline-block transform -rotate-12" />
          </h2>
          <p className="text-purple-200/90 text-base md:text-lg font-poppins max-w-xl">
            We will be happy to have you on board.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0 w-full sm:w-auto">
          <button className="w-full sm:w-auto bg-white text-[#460F58] font-bold px-8 py-3 rounded-lg shadow-lg hover:scale-105 hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300/50 text-base">
            SIGN UP FOR FREE
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
       