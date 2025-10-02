// src/components/SuperPowerVideo.tsx
"use client";

export default function VideoPlayer() {
  return (
     <div className="bg-[#0a0f1f] min-h-screen flex items-center justify-center p-0">
  <div className="w-full font-['Poppins']">
    <div className="relative w-full pb-[56.25%] overflow-hidden">
      <video
        src="https://mybillbook.in/static-assets/videos/super-power.mp4"
        autoPlay
        muted
        loop
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
    </div>
  </div>
</div>
  );
}
