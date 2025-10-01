// src/components/TestimonialSection.tsx

// import Image from 'next/image';

// export default function TestimonialSection() {
//   const testimonials = [
//     {
//       name: 'Rohit Sharma',
//       role: 'Inventory Manager, AutoParts Inc.',
//       text: 'Used Our Mind has completely transformed how we track and manage stock. Real-time updates and smart alerts keep us ahead.',
//       image: '/images/user.png',
//     },
//     {
//       name: 'Sneha Verma',
//       role: 'Co-founder, StyleKart',
//       text: 'This system is intuitive and powerful. It helps us manage thousands of SKUs effortlessly. Highly recommended!',
//       image: '/images/user.png',
//     },
//     {
//       name: 'Aditya Mehra',
//       role: 'Ops Lead, QuickMart',
//       text: 'We saved hours every week thanks to automated reports and low stock notifications. Game changer!',
//       image: '/images/user.png',
//     },
//   ]

//   return (
//     <section className="bg-white py-20 px-6">
//       <div className="max-w-6xl mx-auto text-center">
//         <h2 className="text-3xl font-bold text-gray-800 mb-12">What Our Customers Say</h2>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//           {testimonials.map((t, idx) => (
//             <div
//               key={idx}
//               className="bg-gray-50 p-6 rounded-2xl shadow hover:shadow-lg transition"
//             >
//               <div className="flex items-center gap-4 mb-4">
//                 <img
//                   src={t.image}
//                   alt={t.name}
//                   className="w-14 h-14 rounded-full object-cover border-2 border-pink-500"
//                 />
//                 <div className="text-left">
//                   <h4 className="text-lg font-semibold text-gray-800">{t.name}</h4>
//                   <p className="text-sm text-gray-500">{t.role}</p>
//                 </div>
//               </div>
//               <p className="text-gray-600 text-left">“{t.text}”</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }



//  import { AiFillStar } from "react-icons/ai";

// export default function TestimonialSection() {
//   const testimonials = [
//     {
//       name: 'Rohit Sharma',
//       role: 'Inventory Manager, AutoParts Inc.',
//       text: 'Used Our Mind has completely transformed how we track and manage stock. Real-time updates and smart alerts keep us ahead.',
//       image: '/images/user.png',
//       rating: 4.5,
//     },
//     {
//       name: 'Sneha Verma',
//       role: 'Co-founder, StyleKart',
//       text: 'This system is intuitive and powerful. It helps us manage thousands of SKUs effortlessly. Highly recommended!',
//       image: '/images/user.png',
//       rating: 3.5,
//     },
//     {
//       name: 'Aditya Mehra',
//       role: 'Ops Lead, QuickMart',
//       text: 'We saved hours every week thanks to automated reports and low stock notifications. Game changer!',
//       image: '/images/user.png',
//       rating: 5,
//     },
    
//   ];

//   return (
//     <section className="bg-[#f8fafc] py-20 px-6 font-['Poppins']">
//       <div className="max-w-7xl mx-auto text-center">
//         <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#3B3D72] mb-4">
//           What Our Customers Say
//         </h2>
//         <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
//           Hear from our clients who transformed their business with <span className="font-semibold text-indigo-500">Used Our Mind</span>.
//         </p>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//           {testimonials.map((t, idx) => (
//             <div
//               key={idx}
//               className="bg-white rounded-2xl shadow-md border border-transparent
//                          hover:border-indigo-400 hover:shadow-2xl hover:-translate-y-2
//                          transition-all duration-300 p-6 flex flex-col "
//             >
//               <div className="flex items-center gap-4 mb-2">
//                 <img
//                   src={t.image}
//                   alt={t.name}
//                   className="w-14 h-14 rounded-full object-cover border-2 border-indigo-400"
//                 />
//                 <div className="text-left">
//                   <h4 className="text-lg font-semibold text-[#1E1E2F]">{t.name}</h4>
//                   <p className="text-sm text-gray-500">{t.role}</p>
//                 </div>
//               </div>

//               {/* Rating */}
//               <div className="flex ml-17 mb-3">
//                 {Array.from({ length: 5 }).map((_, i) => {
//                   const ratingDiff = t.rating - i;
//                   if (ratingDiff >= 1) {
//                     return <AiFillStar key={i} className="w-5 h-5 mr-1 text-yellow-400" />;
//                   } else if (ratingDiff > 0) {
//                     return (
//                       <div key={i} className="relative w-5 h-5 mr-1">
//                         <AiFillStar className="w-5 h-5 text-gray-300 absolute top-0 left-0" />
//                         <div
//                           className="overflow-hidden absolute top-0 left-0 h-full"
//                           style={{ width: `${ratingDiff * 100}%` }}
//                         >
//                           <AiFillStar className="w-5 h-5 text-yellow-400" />
//                         </div>
//                       </div>
//                     );
//                   } else {
//                     return <AiFillStar key={i} className="w-5 h-5 mr-1 text-gray-300" />;
//                   }
//                 })}
//               </div>

//               <p className="text-gray-700 text-left italic">“{t.text}”</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }





 import { AiFillStar } from "react-icons/ai";
 import Image from "next/image";

export default function TestimonialSection() {
  const testimonials = [
    {
      name: 'Rohit Sharma',
      role: 'Inventory Manager, AutoParts Inc.',
      text: 'Used Our Mind has completely transformed how we track and manage stock. Real-time updates and smart alerts keep us ahead.',
      image: '/images/user.png',
      rating: 4.5,
    },
    {
      name: 'Sneha Verma',
      role: 'Co-founder, StyleKart',
      text: 'This system is intuitive and powerful. It helps us manage thousands of SKUs effortlessly. Highly recommended!',
      image: '/images/user.png',
      rating: 3.5,
    },
    {
      name: 'Aditya Mehra',
      role: 'Ops Lead, QuickMart',
      text: 'We saved hours every week thanks to automated reports and low stock notifications. Game changer!',
      image: '/images/user.png',
      rating: 5,
    },
  ];

  return (
    <section
      className="relative py-20 px-6 font-['Poppins'] bg-cover bg-center footer-animate-bg bg-fixed"
      style={{ backgroundImage: `url('/images/cta-bg.jpg')` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative max-w-7xl mx-auto text-center text-white">
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg"
          style={{ fontFamily: "Roboto, sans-serif" }}
        >
          What Our Customers Say
        </h2>
        <p className="mb-12 max-w-2xl mx-auto drop-shadow-md">
          Hear from our clients who transformed their business with{" "}
          <span className="font-semibold text-[#7B53A6]">Used Our Mind</span>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="flex flex-col p-6 text-left rounded-xl hover:border-[#7B53A6] border border-gray-600"
            >
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={t.image}
                  alt={t.name}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#7B53A6]"
                />
                <div className="hover:text-[#7B53A6]">
                  <h4
                    className="text-lg font-semibold drop-shadow-md"
                    style={{ fontFamily: "Roboto, sans-serif" }}
                  >
                    {t.name}
                  </h4>
                  <p className="text-sm text-gray-200 drop-shadow-sm">
                    {t.role}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex mb-3">
                {Array.from({ length: 5 }).map((_, i) => {
                  const ratingDiff = t.rating - i;
                  if (ratingDiff >= 1) {
                    return <AiFillStar key={i} className="w-5 h-5 mr-1 text-yellow-400" />;
                  } else if (ratingDiff > 0) {
                    return (
                      <div key={i} className="relative w-5 h-5 mr-1">
                        <AiFillStar className="w-5 h-5 text-gray-400 absolute top-0 left-0" />
                        <div
                          className="overflow-hidden absolute top-0 left-0 h-full"
                          style={{ width: `${ratingDiff * 100}%` }}
                        >
                          <AiFillStar className="w-5 h-5 text-yellow-400" />
                        </div>
                      </div>
                    );
                  } else {
                    return <AiFillStar key={i} className="w-5 h-5 mr-1 text-gray-400" />;
                  }
                })}
              </div>

              <p className="italic drop-shadow-md">
                “{t.text}”
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}




