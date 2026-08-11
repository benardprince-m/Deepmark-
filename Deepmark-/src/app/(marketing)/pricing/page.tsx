'use client';

import { SUBSCRIPTION_PLANS, type SubscriptionTier } from '@/lib/subscription';
import { useState } from 'react';

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    if (!priceId) return;
    
    setLoading(priceId);
    
    // In production, this would call Stripe checkout
    // For now, simulate upgrade
    setTimeout(() => {
      alert(`In production, this would redirect to Stripe checkout for ${priceId}`);
      setLoading(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-slate-300 mb-8">
            Choose the plan that fits your startup's marketing needs
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
            <span className="text-sm">All plans include</span>
            <span className="font-medium">AI-powered content generation</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative border-2 rounded-2xl p-6 ${
                plan.recommended
                  ? 'border-black shadow-xl'
                  : 'border-slate-200'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-medium px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">
                    ${plan.price}
                  </span>
                  <span className="text-slate-500">/month</span>
                </div>
                {plan.price === 0 && (
                  <p className="text-sm text-slate-500 mt-1">Forever free</p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={loading !== null || plan.price === 0}
                className={`w-full py-3 rounded-xl font-medium transition-colors ${
                  plan.recommended
                    ? 'bg-black text-white hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.priceId ? 'Processing...' : 
                 plan.price === 0 ? 'Current Plan' : `Get Started`}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Can I change plans later?</h3>
              <p className="text-slate-600 text-sm">Yes! You can upgrade or downgrade at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">What counts as a "generation"?</h3>
              <p className="text-slate-600 text-sm">Each time AI creates content (post, thread, script, etc.) counts as one generation.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Is there a free trial?</h3>
              <p className="text-slate-600 text-sm">Yes! Start free and upgrade when you need more. No credit card required to start.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">What about AI API costs?</h3>
              <p className="text-slate-600 text-sm">Included in all plans. We cover the OpenRouter API costs.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center p-8 bg-slate-50 rounded-2xl">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Need a custom plan?</h3>
          <p className="text-slate-600 mb-4">For teams with special requirements, contact us for Enterprise pricing.</p>
          <button className="px-6 py-2 border-2 border-slate-300 rounded-xl font-medium text-slate-700 hover:border-slate-400 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}
