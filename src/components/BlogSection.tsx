import Image from 'next/image'

// src/components/BlogSection.tsx
export default function BlogSection() {
  const blogs = [
    {
      title: 'Top 5 Tips for Smarter Inventory Management',
      excerpt: 'Discover practical ways to reduce stockouts and overstock issues in your warehouse.',
      date: 'June 18, 2025',
      image: '/images/blog.svg',
    },
    {
      title: 'Real-Time Tracking vs Traditional Logging',
      excerpt: 'How real-time inventory visibility saves hours and increases accuracy.',
      date: 'June 30, 2025',
      image: '/images/blog.svg',
    },
    {
      title: 'Is Your Inventory System Scalable?',
      excerpt: 'Signs you need to upgrade from Excel or legacy tools.',
      date: 'July 2, 2025',
      image: '/images/blog.svg',
    },
  ]
  return (
    <section className="bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-pink-600 text-center mb-12 drop-shadow">
          Latest From the Blog
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogs.map((blog, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 overflow-hidden flex flex-col group border border-pink-100"
            >
              <div className="relative w-full h-48">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={idx === 0}
                />
                <div className="absolute top-4 left-4 bg-white/80 text-pink-600 px-3 py-1 rounded-full text-xs font-semibold shadow">
                  {blog.date}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition">
                  {blog.title}
                </h3>
                <p className="text-gray-600 text-base mb-4 flex-1">{blog.excerpt}</p>
                <a
                  href="#"
                  className="inline-block mt-auto text-pink-600 font-semibold hover:underline text-sm"
                >
                  Read More &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
