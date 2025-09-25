import { ShieldCheck, Lock, UserCheck } from 'lucide-react'

export default function SecuritySection() {
  return (
    <section className="relative bg-gradient-to-br from-white via-pink-50 to-fuchsia-50 py-20 px-6 overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute -top-16 -left-16 w-60 h-60 opacity-20 blur-2xl pointer-events-none select-none z-0">
        <svg viewBox="0 0 240 240" fill="none">
          <circle cx="120" cy="120" r="120" fill="#f9a8d4" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-48 h-48 opacity-10 blur-2xl pointer-events-none select-none z-0">
        <svg viewBox="0 0 192 192" fill="none">
          <circle cx="96" cy="96" r="96" fill="#a21caf" />
        </svg>
      </div>
      <div className="relative max-w-4xl mx-auto text-center z-10">
        <ShieldCheck className="mx-auto w-14 h-14 text-pink-500 mb-4" />
        <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-600 mb-4 drop-shadow">
          Your Data, Fully Secured
        </h2>
        <p className="text-gray-600 mb-10 text-lg">
          We use bank-level encryption, role-based access controls, and regular audits to ensure your data is always protected.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-5 py-2 rounded-full text-base font-semibold shadow">
            <Lock className="w-5 h-5" /> SSL 256-bit Encryption
          </span>
          <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-5 py-2 rounded-full text-base font-semibold shadow">
            <UserCheck className="w-5 h-5" /> OAuth 2.0 Auth
          </span>
          <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-5 py-2 rounded-full text-base font-semibold shadow">
            GDPR Compliant
          </span>
        </div>
        <div className="text-gray-500 text-sm">
          Regular security audits &bull; Data encrypted at rest and in transit &bull; 24/7 monitoring
        </div>
      </div>
    </section>
  )
}
