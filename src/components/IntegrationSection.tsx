// src/components/IntegrationSection.tsx
export default function IntegrationSection() {
  const tools = ['Shopify', 'Google Sheets', 'Slack', 'WhatsApp', 'Zapier', 'QuickBooks']
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Works With Your Favorite Tools</h2>
        <p className="text-gray-600 mb-12">Seamlessly connect your existing stack</p>
        <div className="flex flex-wrap justify-center gap-6">
          {tools.map((tool, idx) => (
            <span key={idx} className="bg-gray-100 text-gray-800 px-6 py-3 rounded-full shadow text-sm font-medium">
              {tool}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
