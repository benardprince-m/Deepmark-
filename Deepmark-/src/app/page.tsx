import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/logo/icon.svg" alt="DeepMark" className="h-8 w-8" />
            <span className="text-lg font-extrabold tracking-tight text-[#191919]">DeepMark</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-sm text-[#858585] hover:text-[#191919] transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-[#858585] hover:text-[#191919] transition-colors">Pricing</a>
            <Link href="/auth/login" className="text-sm text-[#858585] hover:text-[#191919] transition-colors">Sign in</Link>
            <Link href="/auth/signup" className="h-9 px-4 bg-[#191919] hover:bg-[#525252] text-white text-sm font-medium rounded-[10px] flex items-center transition-all">
              Start free
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-[#191919] mb-6">
            The AI Marketing OS<br />for Founders.
          </h1>
          <p className="text-xl text-[#858585] max-w-2xl mx-auto mb-10">
            Plan, create, automate, and optimize your marketing from one intelligent platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup" className="h-12 px-6 bg-[#191919] hover:bg-[#525252] text-white font-medium rounded-[10px] flex items-center transition-all">
              Start free trial
            </Link>
            <button className="h-12 px-6 border border-[#E8E8E8] hover:bg-[#EEEEEE] text-[#191919] font-medium rounded-[10px] flex items-center transition-all">
              Watch demo
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#191919] text-center mb-16">
            Everything you need to market smarter
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {[
              { title: 'Daily Execution Plan', desc: 'AI-powered daily marketing tasks delivered to you' },
              { title: 'AI Content Studio', desc: 'Generate platform-ready content in seconds' },
              { title: 'Smart Planner', desc: 'Schedule and automate your content calendar' },
              { title: 'Learning Analytics', desc: 'Track what works and improve over time' },
              { title: 'Auto Posting', desc: 'Connect channels and post automatically' },
              { title: 'Multi-Platform', desc: 'LinkedIn, Twitter, Instagram, and more' },
            ].map((feature, i) => (
              <div key={i} className="bg-white border border-[#E8E8E8] rounded-[10px] p-6">
                <h3 className="text-lg font-semibold text-[#191919] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#858585]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#191919] text-center mb-16">
            Simple, transparent pricing
          </h2>
          <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Starter */}
            <div className="bg-white border border-[#E8E8E8] rounded-[10px] p-6">
              <p className="text-sm font-medium text-[#858585] mb-2">Starter</p>
              <p className="text-4xl font-extrabold text-[#191919] mb-1">$29</p>
              <p className="text-sm text-[#858585] mb-6">per month</p>
              <ul className="space-y-3 mb-6">
                <li className="text-sm text-[#191919]">5 campaigns</li>
                <li className="text-sm text-[#191919]">100 AI generations</li>
                <li className="text-sm text-[#191919]">3 channels</li>
              </ul>
              <button className="w-full h-10 border border-[#E8E8E8] hover:bg-[#EEEEEE] text-[#191919] font-medium rounded-[10px] transition-all">
                Get started
              </button>
            </div>

            {/* Pro - Featured */}
            <div className="bg-[#191919] text-white rounded-[10px] p-6 relative">
              <p className="text-sm font-medium text-[#858585] mb-2">Pro</p>
              <p className="text-4xl font-extrabold mb-1">$79</p>
              <p className="text-sm text-[#858585] mb-6">per month</p>
              <ul className="space-y-3 mb-6">
                <li className="text-sm">Unlimited campaigns</li>
                <li className="text-sm">1000 AI generations</li>
                <li className="text-sm">All channels</li>
                <li className="text-sm">Priority support</li>
              </ul>
              <button className="w-full h-10 bg-white text-[#191919] hover:bg-[#EEEEEE] font-medium rounded-[10px] transition-all">
                Get started
              </button>
            </div>

            {/* Scale */}
            <div className="bg-white border border-[#E8E8E8] rounded-[10px] p-6">
              <p className="text-sm font-medium text-[#858585] mb-2">Scale</p>
              <p className="text-4xl font-extrabold text-[#191919] mb-1">$149</p>
              <p className="text-sm text-[#858585] mb-6">per month</p>
              <ul className="space-y-3 mb-6">
                <li className="text-sm text-[#191919]">Everything in Pro</li>
                <li className="text-sm text-[#191919]">Unlimited AI</li>
                <li className="text-sm text-[#191919]">Custom integrations</li>
                <li className="text-sm text-[#191919]">Dedicated support</li>
              </ul>
              <button className="w-full h-10 border border-[#E8E8E8] hover:bg-[#EEEEEE] text-[#191919] font-medium rounded-[10px] transition-all">
                Contact sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F6F6F6] border-t border-[#E8E8E8] py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <p className="text-sm text-[#858585]">
            © 2026 DeepMark. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-[#858585] hover:text-[#191919]">Privacy</a>
            <a href="#" className="text-sm text-[#858585] hover:text-[#191919]">Terms</a>
            <a href="#" className="text-sm text-[#858585] hover:text-[#191919]">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
