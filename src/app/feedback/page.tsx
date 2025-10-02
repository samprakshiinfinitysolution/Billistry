// "use client";
// import { useState } from "react";
// import { Star } from "lucide-react";

// export default function FeedbackPage() {
//   const [rating, setRating] = useState<number>(0);
//   const [hover, setHover] = useState<number | null>(null);
//   const [feedback, setFeedback] = useState("");
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [clickCount, setClickCount] = useState<{ [key: number]: number }>({});

//   const handleStarClick = (starIndex: number) => {
//     if (starIndex <= 3) {
//       setRating(starIndex);
//     } else {
//       setClickCount((prev) => {
//         const current = prev[starIndex] || 0;
//         const newClick = current + 1;
//         const newCounts = { ...prev, [starIndex]: newClick };

//         if (newClick % 2 === 1) {
//           setRating(starIndex - 0.5);
//         } else {
//           setRating(starIndex);
//         }
//         return newCounts;
//       });
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     alert("Thank you for your feedback! 🙌");
//     setName("");
//     setEmail("");
//     setFeedback("");
//     setRating(0);
//     setClickCount({});
//   };

//   return (
//     <section className="bg-gradient-to-br from-[#F7FBFB] via-white to-[#F3F0FA] py-16 px-6 font-poppins">
//       <div className="max-w-3xl mx-auto text-center">
//         <h2 className="text-4xl sm:text-5xl font-extrabold font-roboto mb-4 bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] bg-clip-text text-transparent">
//           We Value Your Feedback 💬
//         </h2>
//         <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
//           Help us improve <span className="font-semibold text-[#460F58]">Billistry</span> by sharing your thoughts and rating your experience.
//         </p>

//         <form
//           onSubmit={handleSubmit}
//           className="bg-white shadow-xl rounded-2xl text-gray-600 p-8 space-y-6 border border-gray-200 text-left"
//         >

//             {/* Rating Stars */}
//           <div>
//             <label className="block text-lg font-semibold text-[#460F58] mb-2">
//               Rate Your Experience
//             </label>
//             <div className="flex space-x-2">
//               {[1, 2, 3, 4, 5].map((starIndex) => {
//                 const isHalf =
//                   rating === starIndex - 0.5 && (starIndex === 4 || starIndex === 5);
//                 const isFull = (hover ?? rating) >= starIndex || rating === starIndex;

//                 return (
//                   <button
//                     type="button"
//                     key={starIndex}
//                     onClick={() => handleStarClick(starIndex)}
//                     onMouseEnter={() => setHover(starIndex)}
//                     onMouseLeave={() => setHover(null)}
//                     className="focus:outline-none relative"
//                   >
//                     {/* Base star (gray) */}
//                     <Star size={30} className="text-gray-300" />

//                     {/* Full star overlay */}
//                     {isFull && !isHalf && (
//                       <Star
//                         size={30}
//                         className="text-[#FACC15] fill-[#FACC15] absolute top-0 left-0"
//                       />
//                     )}

//                     {/* Half star overlay */}
//                     {isHalf && (
//                       <Star
//                         size={30}
//                         className="absolute top-0 left-0 text-gray-300"
//                         style={{ fill: "url(#halfGradient)" }}
//                       />
//                     )}

//                     {/* Gradient mask */}
//                     <svg width="0" height="0">
//                       <defs>
//                         <linearGradient id="halfGradient">
//                           <stop offset="50%" stopColor="#FACC15" />
//                           <stop offset="50%" stopColor="transparent" />
//                         </linearGradient>
//                       </defs>
//                     </svg>
//                   </button>
//                 );
//               })}
//             </div>
//             <p className="mt-2 text-sm text-gray-500">
//               <span className="font-bold text-[#460F58]">{rating || "0"}</span> / 5
//             </p>
//           </div>



//           {/* Name + Email */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-lg font-semibold text-[#460F58] mb-2">Name</label>
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="Your Name"
//                 className="w-full p-3 border border-gray-300 rounded-xl  focus:ring-2 focus:ring-[#460F58] focus:outline-none"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-lg font-semibold text-[#460F58] mb-2">Email</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="your Email"
//                 className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#460F58] focus:outline-none"
//                 required
//               />
//             </div>
//           </div>

          

//           {/* Feedback */}
//           <div>
//             <label className="block text-lg font-semibold text-[#460F58] mb-2">Your Feedback</label>
//             <textarea
//               value={feedback}
//               onChange={(e) => setFeedback(e.target.value)}
//               rows={5}
//               placeholder="Write your experience here..."
//               className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#460F58] focus:outline-none"
//               required
//             ></textarea>
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             className="w-full py-3 bg-[#460F58] text-white rounded-xl font-semibold text-lg shadow-md hover:bg-[#390F59] transition transform hover:scale-105"
//           >
//             Submit Feedback
//           </button>
//         </form>
//       </div>
//     </section>
//   );
// }



"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FeedbackPage() {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [clickCount, setClickCount] = useState<{ [key: number]: number }>({});

  const handleStarClick = (starIndex: number) => {
    if (starIndex <= 3) {
      setRating(starIndex);
    } else {
      setClickCount((prev) => {
        const current = prev[starIndex] || 0;
        const newClick = current + 1;
        const newCounts = { ...prev, [starIndex]: newClick };

        if (newClick % 2 === 1) {
          setRating(starIndex - 0.5);
        } else {
          setRating(starIndex);
        }
        return newCounts;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your feedback! 🙌");
    setName("");
    setEmail("");
    setFeedback("");
    setRating(0);
    setClickCount({});
  };

  return (
    <section className="bg-gradient-to-br from-[#F7FBFB] via-white to-[#F3F0FA] py-16 px-6 font-poppins">
      <div className="max-w-5xl mx-auto text-center sm:px-8 lg:px-10">
        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl font-extrabold font-roboto mb-4 bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] bg-clip-text text-transparent">
          We Value Your Feedback 💬
        </h2>
        <p className="text-gray-600 text-lg mb-12 max-w-2xl mx-auto">
          Help us improve <span className="font-semibold text-[#460F58]">Billistry</span> by sharing your thoughts and rating your experience.
        </p>

        {/* Back Button */}
      <div className="mb-6 text-start">
        <Link
          href="/"
          className="inline-flex items-center text-[#460F58] font-medium hover:underline"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className=" sm:inline"> Home</span>
        </Link>
      </div>

        {/* Content Section (Image + Form) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden ">
          {/* Left Image */}
          <div className="w-full h-full md:block hidden">
            <Image
              src="/images/feedback1.jpg" // replace with your image
              alt="Feedback Illustration"
              className="w-full h-full  center "
              width={400}
              height={400}
             
            />
          </div>

          {/* Right Form */}
          <div className="p-8 text-left">
            <form onSubmit={handleSubmit} className="space-y-6 text-gray-600" >
              {/* Rating Stars */}
              <div>
                <label className="block text-lg font-semibold text-[#460F58] mb-2">
                  Rate Your Experience
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((starIndex) => {
                    const isHalf =
                      rating === starIndex - 0.5 && (starIndex === 4 || starIndex === 5);
                    const isFull =
                      (hover ?? rating) >= starIndex || rating === starIndex;

                    return (
                      <button
                        type="button"
                        key={starIndex}
                        onClick={() => handleStarClick(starIndex)}
                        onMouseEnter={() => setHover(starIndex)}
                        onMouseLeave={() => setHover(null)}
                        className="focus:outline-none relative"
                      >
                        {/* Base star (gray) */}
                        <Star size={30} className="text-gray-300" />

                        {/* Full star overlay */}
                        {isFull && !isHalf && (
                          <Star
                            size={30}
                            className="text-[#FACC15] fill-[#FACC15] absolute top-0 left-0"
                          />
                        )}

                        {/* Half star overlay */}
                        {isHalf && (
                          <Star
                            size={30}
                            className="absolute top-0 left-0 text-gray-300"
                            style={{ fill: "url(#halfGradient)" }}
                          />
                        )}

                        {/* Gradient mask */}
                        <svg width="0" height="0">
                          <defs>
                            <linearGradient id="halfGradient">
                              <stop offset="50%" stopColor="#FACC15" />
                              <stop offset="50%" stopColor="transparent" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  <span className="font-bold text-[#460F58]">{rating || "0"}</span> / 5
                </p>
              </div>

              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-[#460F58] mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#460F58] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-[#460F58] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#460F58] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-lg font-semibold text-[#460F58] mb-2">
                  Your Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  placeholder="Write your experience here..."
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#460F58] focus:outline-none"
                  required
                ></textarea>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-[#460F58]  cursor-pointer text-white rounded-xl font-semibold text-lg shadow-md hover:bg-[#390F59] transition transform hover:scale-105"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
