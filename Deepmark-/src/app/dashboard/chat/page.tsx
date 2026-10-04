'use client';
import { useState } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';
import DeepMarkMascot from '@/components/motion/DeepMarkMascot';
export default function ChatPage() {
  const [message, setMessage] = useState(''); const [started, setStarted] = useState(false);
  return <div className="dm-route-page dm-chat-page"><div className="dm-page-title-row"><div><span className="dm-eyebrow">DeepMark Chat</span><h1>Think out loud.</h1><p>Bring the messy context. DeepMark helps find the useful shape.</p></div><div className="dm-live-pill"><span /> Memory-aware conversation</div></div><section className="dm-chat-surface"><div className="dm-chat-welcome"><DeepMarkMascot state={started ? 'listening' : 'welcome'} size={190} interactive showOrb={!started} /><h2>{started ? 'I’m listening.' : 'Let’s make your next move clearer.'}</h2><p>Tell DeepMark what you are building, what feels stuck, or what you want your audience to understand.</p></div><div className="dm-chat-composer"><textarea value={message} onChange={(event) => { setMessage(event.target.value); setStarted(Boolean(event.target.value)); }} onFocus={() => setStarted(true)} rows={3} placeholder="What are you working on?" /><div className="dm-chat-composer-footer"><span><MessageCircle size={14} /> Conversation preview — submission connection is next.</span><button aria-label="Send message" disabled={!message.trim()}><ArrowUp size={17} /></button></div></div></section></div>;
}
