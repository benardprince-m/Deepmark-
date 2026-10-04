'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import DeepMarkIntro from '@/components/motion/DeepMarkIntro';
import DeepMarkMascot from '@/components/motion/DeepMarkMascot';

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true);
  const finishIntro = useCallback(() => setShowIntro(false), []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#0A0A0A] text-white">
      {showIntro && <DeepMarkIntro onComplete={finishIntro} />}
      <section className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-24 md:px-10">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22C55E]/[0.06] blur-3xl" />
        <div className="relative grid w-full items-center gap-14 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#262626] bg-[#121212] px-3 py-1.5 text-xs text-[#858585]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
              Marketing intelligence for founders
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-[-0.05em] md:text-7xl">
              Your startup&apos;s memory for the <span className="text-[#22C55E]">next move.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#858585] md:text-lg">
              DeepMark learns your company, sharpens your message, and turns signal into founder-grade marketing content.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/auth/signup" className="rounded-full bg-[#22C55E] px-5 py-3 text-sm font-semibold text-[#0A0A0A] transition-transform hover:-translate-y-0.5">Start building</Link>
              <Link href="/dashboard/studio" className="rounded-full border border-[#262626] px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-[#525252]">Try the Studio</Link>
            </div>
          </div>
          <div className="flex min-h-[420px] items-center justify-center rounded-[32px] border border-[#262626] bg-[#0D0D0D] p-10 shadow-2xl shadow-black/30">
            <div className="flex flex-col items-center gap-6 text-center">
              <DeepMarkMascot state="idle" size={260} interactive showOrb />
              <div>
                <p className="text-sm font-medium text-white">A calmer way to think about growth.</p>
                <p className="mt-2 text-xs text-[#858585]">Move your cursor around DeepMark.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
