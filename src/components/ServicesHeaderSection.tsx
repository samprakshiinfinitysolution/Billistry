export default function FeaturesHeader() {
  return (
    <section className="bg-[#F7FBFB] py-16 px-6 font-poppins">
  <div className="max-w-6xl mx-auto text-center">
    {/* Title */}
    <h2 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] bg-clip-text text-transparent mb-6 font-roboto">
      Powerful Features
    </h2>

    {/* Description */}
    <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
      Performing equally effectively, separately and simultaneously –{" "}
      <br className="hidden md:block" />
      Utilize all, activate or deactivate to match your business needs.
    </p>
  </div>
</section>

  );
}

