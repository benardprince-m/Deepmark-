'use client';

import { useState } from 'react';
import DeepMarkMascot from '@/components/motion/DeepMarkMascot';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [started, setStarted] = useState(false);

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 py-10 text-white md:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col">
        <header className="flex items-center justify-between border-b border-[#262626] pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#22C55E]">DeepMark Chat</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">DeepMark Chat preview</h1>
          </div>
          <div className="rounded-full border border-[#262626] px-3 py-1 text-xs text-[#858585]">Memory-aware</div>
        </header>
        <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <div className="dm-chat-welcome">
            <DeepMarkMascot state={started ? 'listening' : 'welcome'} size={190} interactive showOrb={!started} />
          </div>
          <p className="mt-8 text-lg font-medium">{started ? 'I’m listening.' : 'Let’s make your next move clearer.'}</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#858585]">Tell DeepMark what you are building, what feels stuck, or what you want your audience to understand.</p>
          <div className="mt-8 w-full max-w-2xl rounded-2xl border border-[#262626] bg-[#121212] p-3">
            <textarea
              value={message}
              onChange={(event) => { setMessage(event.target.value); setStarted(Boolean(event.target.value)); }}
              onFocus={() => setStarted(true)}
              rows={3}
              placeholder="What are you working on?"
              className="min-h-[72px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-[#525252]"
            />
            <p className="px-2 pb-1 text-left text-xs text-[#858585]">Conversation submission is not connected yet. This preview only demonstrates the welcome and listening states.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
