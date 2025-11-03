import Image from 'next/image';

const MadeInIndia = () => {
  return (
    <section className="bg-[#F7FBFB] py-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-col  items-center justify-center text-center gap-4 sm:gap-6">
        <Image
          src="/images/samprakshilogo.png"
          alt="Made in India"
          width={120}
          height={40}
          className="object-contain"
        />
        <h2
          className="text-xl sm:text-2xl font-semibold text-gray-600 font-poppins"
          aria-label="Made in India. Made for the world."
        >
          <strong className="font-bold text-[#460F58]">Built in India.</strong>  Scaling the World.
        </h2>
      </div>
    </section>
  );
};

export default MadeInIndia;