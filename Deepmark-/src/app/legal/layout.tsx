import Link from 'next/link';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF]">
      {/* Header */}
      <header className="bg-[#191919] border-b border-[#333333]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[#999999] hover:text-[#FFFFFF] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#333333] mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#666666] text-sm">
              © {new Date().getFullYear()} DeepMark. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/legal/terms" className="text-[#999999] hover:text-[#FFFFFF] text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="text-[#999999] hover:text-[#FFFFFF] text-sm transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
