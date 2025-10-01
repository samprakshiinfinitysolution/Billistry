// "use client";

// import Link from "next/link";

// export default function PrivacyPolicy() {
//   return (
//     <div className="py-16 px-4 md:px-20 font-poppins bg-[#F7FBFB] text-[#390F59]">
//       <div className="max-w-5xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <Link href="/" className="text-sm text-[#7B53A6] hover:underline">
//             Home
//           </Link>
//           <h1 className="text-4xl md:text-5xl font-extrabold mt-4" style={{ color: "#460F58" }}>
//             Privacy Policy
//           </h1>
//           <p className="mt-2 text-gray-600">
//             Your privacy is important to us. This Privacy Policy explains how Billistry, the company behind the app, collects, uses, and protects your information.
//           </p>
//         </div>

//         {/* Introduction */}
//         <section className="mb-8">
//           <h2 className="text-2xl font-bold mb-2">General</h2>
//           <p className="text-gray-600">
//             Review these Terms of Service "Agreement" thoroughly. This Agreement is a legal agreement between the User and Billistry. By accepting electronically (for example, clicking “I Agree”), installing, accessing, or using the Services, the User agrees to these terms. If the User does not agree to this Agreement, they may not use the Services. This License Agreement shall be governed by and construed in accordance with the laws of India.
//           </p>
//         </section>

//         <section className="mb-8">
//           <h2 className="text-2xl font-bold mb-2">Modification of Terms & Conditions</h2>
//           <p className="text-gray-600">
//             These terms may be updated from time to time. The User should review our Terms and Conditions regularly by visiting this page. Continued access to or use of the service will mean that the User agrees to the changes.
//           </p>
//         </section>

//         <section className="mb-8">
//           <h2 className="text-2xl font-bold mb-2">When This Privacy Statement Applies</h2>
//           <p className="text-gray-600">
//             This Privacy Policy applies to users who have downloaded the Billistry application and clicked the “I Agree/Login” button for Terms and Conditions.
//           </p>
//         </section>

//         <section className="mb-8">
//           <h2 className="text-2xl font-bold mb-2">Terms and Description of Services</h2>
//           <p className="text-gray-600">
//             Billistry provides services including Inventory Management, Invoicing, Reporting tools, Estimate/Order Form creator, and more to serve as a complete business management platform ("Service" or "Services"). Users may use the Services for personal or business purposes. The app can be downloaded from the Official Website or Google Play Store and can be used offline, but an internet connection is required for certain features. Users remain responsible for compliance with GST and other applicable laws. Billistry is not responsible for any legal violations caused by the use of the software.
//           </p>
//         </section>

//         <section className="mb-8">
//           <h2 className="text-2xl font-bold mb-2">Business Data and Privacy</h2>
//           <p className="text-gray-600">
//             Users are responsible for maintaining the confidentiality of their username, password, and other sensitive information. Users are responsible for all activities in their accounts and must immediately report unauthorized access via email to help@billistry.com. Billistry is not responsible for any data loss, discrepancy, or unauthorized access.
//           </p>
//         </section>

//         <section className="mb-8">
//           <h2 className="text-2xl font-bold mb-2">Data Ownership</h2>
//           <p className="text-gray-600">
//             Users own the content they create or store in Billistry. Billistry may use this content internally to improve the service but is not responsible for data leaks.
//           </p>
//         </section>

//         <section className="mb-8">
//           <h2 className="text-2xl font-bold mb-2">Permissions</h2>
//           <p className="text-gray-600">
//             Billistry may request access to your Camera, Contacts, Storage, Location, SMS, Device Info, Accounts, Installed Apps, Call Logs, Calendar, and Images to provide full functionality. Permissions are used for purposes such as invoice scanning, contact sync, financial analysis, and KYC document uploads. Billistry does not access personal or OTP messages.
//           </p>
//         </section>

//         <section className="mb-8">
//           <h2 className="text-2xl font-bold mb-2">Data Security</h2>
//           <p className="text-gray-600">
//             Billistry employs industry-standard physical, technical, and administrative measures to protect your data, including encryption, firewalls, and secure storage. Users are responsible for keeping their login credentials confidential. Standard email communication may not be encrypted.
//           </p>
//         </section>

//         <section className="mb-8">
//           <h2 className="text-2xl font-bold mb-2">Data Retention & Deletion Policy</h2>
//           <p className="text-gray-600">
//             Personal information is retained only as long as necessary. Transactional logs are maintained for six months, account details indefinitely unless deletion is requested, and usage logs for three months. Users can request deletion at any time by contacting help@billistry.com.
//           </p>
//         </section>

//         <section className="mb-8">
//           <h2 className="text-2xl font-bold mb-2">Third-Party Services</h2>
//           <p className="text-gray-600">
//             Billistry may use third-party SDKs to perform credit risk assessments and other services. These providers follow strict security protocols, including encryption and access controls.
//           </p>
//         </section>

//         <section className="mb-8">
//           <h2 className="text-2xl font-bold mb-2">Promotional Communications</h2>
//           <p className="text-gray-600">
//             Users agree to receive promotional, transactional, and commercial communications via email, SMS, calls, or push notifications. Billistry is not liable for any messages sent under these conditions.
//           </p>
//         </section>

//         <section className="mb-8">
//           <h2 className="text-2xl font-bold mb-2">Refund, Cancellation, and Renewal Policies</h2>
//           <ul className="list-disc list-inside text-gray-600 space-y-1">
//             <li>Full refund requests submitted within 7 days of purchase are eligible for a 100% refund.</li>
//             <li>Refund requests must be submitted via email or website form.</li>
//             <li>Refund policy applies to purchases of one year or longer.</li>
//             <li>Convenience fees are non-refundable.</li>
//             <li>License renewal is manual; auto-renewal is not supported.</li>
//           </ul>
//         </section>

//         <p className="text-gray-500 text-sm mt-12">
//           Last updated: September 29, 2025
//         </p>
//       </div>
//     </div>
//   );
// }


"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="py-20 font-poppins bg-[#F7FBFB] px-6 md:px-20">
      {/* Header */}
      <header className="text-center max-w-4xl mx-auto mb-20 space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold font-roboto bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
          Billistry is committed to protecting your privacy. <br />
          This Privacy Policy explains how we collect, use, and share your personal information.
        </p>
      </header>

       {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-[#460F58] font-medium hover:underline"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline"> Home</span>
        </Link>
      </div>

      {/* Sections */}
      <div className="max-w-5xl mx-auto space-y-16">
        <Section
          title="Introduction"
          content={`Billistry Apps Private Limited is committed to protecting your privacy. This Privacy Policy explains the types of information we collect, how we use it, and your rights regarding your data when using our Billing App GST Invoice Maker ("Billistry").`}
        />

         <Section
        title="Information We Collect"
        content={`- Personal Information: Name, email, phone number, business details, billing info.  
- Business Data: Invoices, GST details, customers, and transaction records.  
- Device Info: Device type, OS, IP, and usage data.  
- Permissions: Camera, storage, contacts, and location (for features & compliance).`}
      />

       <Section
        title="How We Use Your Information"
        content={`We use your data to:  
- Provide and improve billing and invoicing services.  
- Generate GST-compliant invoices and reports.  
- Offer personalized features and customer support.  
- Secure your account and prevent fraud.  
- Communicate service updates and offers.`}
      />

        <Section
          title="Terms of Service"
          content={`By accepting electronically (clicking “I Agree”), installing, accessing, or using Billistry services, you agree to these Terms of Service. If you do not agree, you may not use the services. This Agreement is governed by the laws of India.`}
        />

        <Section
          title="Modifications of Terms & Conditions"
          content={`Billistry may update these terms periodically. Continued use of the services indicates your acceptance of any changes. We recommend reviewing this page regularly to stay informed.`}
        />

        <Section
          title="Business Data & Privacy"
          content={`Users are responsible for maintaining the confidentiality of their login credentials and all activities within their account. Billistry is not responsible for any loss or unauthorized access. All content created or stored belongs to the user, but Billistry may use it internally for operational purposes. Users are advised to perform regular backups to avoid data loss.`}
        />

        <Section
          title="Permissions"
          content={`Billistry requests permissions such as Camera, Contacts, Storage, Location, SMS, Device Info, Accounts, Installed Apps, Call Logs, Calendar, and Images.\n\n- Camera: Capture bills and documents.\n- Contacts: Sync contacts for invoicing and business connections.\n- Storage: Save invoices, KYC documents, and app data.\n- Location: Verify serviceable areas and prevent fraud.\n- SMS: Analyze transactional data for business insights.\n- Device info: Ensure security and prevent unauthorized usage.\n- Installed apps: Help assess compatibility and improve user experience.\n\nSensitive data is treated securely, and personal/OTP messages are not read.`}
        />

        <Section
          title="Cookies & Tracking"
          content={`Billistry uses cookies and similar technologies to enhance user experience.\n- Identify returning users for seamless login.\n- Track usage patterns to improve services.\n- Cookies can be disabled in your browser, but some features may not function.`}
        />

        <Section
          title="Data Security"
          content={`Billistry employs industry-standard measures to protect your data:\n\n- Encryption: Data is encrypted in transit and at rest.\n- Firewalls & Monitoring: Continuous monitoring to prevent unauthorized access.\n- User Responsibility: Keep login credentials confidential.\n- Communication: Sensitive information should not be shared via unencrypted email.`}
        />

        <Section
          title="Third-Party Services"
          content={`Billistry may use registered third-party services for analytics, credit assessment, or operational tasks.\n\n- Providers follow strict security protocols and role-based access.\n- Data is encrypted and securely stored.\n- Third parties do not share data externally and use it only for intended purposes.`}
        />

      

        <Section
          title="User Rights"
          content={`Users have the following rights:\n- Access: Request access to your personal data.\n- Correction: Correct inaccurate or incomplete data.\n- Deletion: Request deletion of your data.\n- Portability: Receive a copy of your data in machine-readable format.\n- Objection: Object to processing for marketing or other purposes.`}
        />

        <Section
          title="Children’s Privacy"
          content={`Billistry does not knowingly collect personal information from children under 13. If you believe we have inadvertently collected data from a child, please contact us for deletion.`}
        />

        <Section
          title="Refund & Renewal Policies"
          content={`- Full refund within 7 days of purchase via email or website request.\n- Convenience fees are non-refundable.\n- Subscriptions must be manually renewed; no auto-renewal.\n- License validity: Typically 1 year from purchase.`}
        />

        <Section
          title="Contact Us"
          content={`For any questions or concerns regarding this Privacy Policy, you may contact us at:\n\nEmail: help@billistry.in\nWebsite: https://billistry.in\nPhone: +91-8435204953`}
        />
      </div>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl sm:text-3xl font-bold font-roboto text-[#390F59] border-l-4 border-[#7B53A6] pl-4">
        {title}
      </h2>
      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
        {content}
      </p>
    </section>
  );
}

