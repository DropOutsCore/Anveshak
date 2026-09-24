import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, MicOff, Sparkles } from 'lucide-react';
import { CaseDetail } from '../../types';
import { API_BASE_URL } from '../../config';

interface ForensicRagCopilotViewProps { caseDetail: CaseDetail; voiceActive: boolean; }
interface Message { sender: 'USER' | 'AI'; text: string; evidence_references?: string[]; }

const QUICK_PROMPTS = (caseId: string) => [
  { label: 'Why is this email suspicious?',       q: `Why is ${caseId} considered business email compromise?` },
  { label: 'Show the infrastructure path.',       q: 'Show me the reconstructed flight path and relay headers.' },
  { label: 'Financial destination clues?',        q: 'What are the extracted financial payout clues and bank details?' },
];

export const ForensicRagCopilotView: React.FC<ForensicRagCopilotViewProps> = ({ caseDetail, voiceActive }) => {
  const [messages, setMessages] = useState<Message[]>([{
    sender: 'AI',
    text: `Ready to investigate **${caseDetail.case_id}**.\n\nAsk anything about headers, sender identity, URL chains, or geo-financial evidence. All answers cite verified evidence.`,
    evidence_references: [],
  }]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const handleSend = async (q?: string) => {
    const text = q || input;
    if (!text.trim()) return;
    setMessages(p => [...p, { sender: 'USER', text }]);
    if (!q) setInput('');
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/v1/cases/${caseDetail.case_id}/rag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      setMessages(p => [...p, { sender: 'AI', text: data.answer, evidence_references: data.evidence_references }]);
      if (voiceActive && 'speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(data.answer.replace(/\[.*?\]/g,'').substring(0,200));
        window.speechSynthesis.speak(u);
      }
    } catch (e) { console.error('RAG query error:', e); }
    finally { setLoading(false); }
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Browser speech recognition unavailable.'); return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r  = new SR(); r.continuous = false; r.interimResults = false;
    if (!listening) {
      setListening(true); r.start();
      r.onresult  = (e: any) => { const t = e.results[0][0].transcript; setInput(t); setListening(false); handleSend(t); };
      r.onerror   = () => setListening(false);
      r.onend     = () => setListening(false);
    } else { setListening(false); }
  };

  return (
    <div className="page space-y-6 anim-fade-up" style={{ height:'calc(100vh - 120px)', display:'flex', flexDirection:'column' }}>

      {/* ── Page header ── */}
      <div className="section-header shrink-0">
        <div className="section-icon" style={{ background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.25)' }}>
          <Bot className="w-4 h-4" style={{ color:'var(--accent)' }} />
        </div>
        <div>
          <h1 className="t-title">AI Forensic Investigator</h1>
          <p className="t-body mt-0.5">Grounded evidence retrieval — [FACT] · [INFERENCE] · [UNCERTAINTY] separation enforced.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 flex-1 min-h-0">

        {/* ── Quick prompts ── */}
        <div className="apple-card p-5 flex flex-col gap-3 h-fit">
          <p className="t-label">Quick Prompts</p>
          <div className="space-y-2">
            {QUICK_PROMPTS(caseDetail.case_id).map(({ label, q }) => (
              <button
                key={label}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="w-full text-left px-4 py-3 rounded-xl transition-all duration-180 group disabled:opacity-50"
                style={{
                  background:'var(--bg-04)',
                  border:'1px solid var(--border-subtle)',
                  fontSize:'0.8125rem',
                  color:'var(--text-secondary)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Chat window ── */}
        <div
          className="lg:col-span-3 apple-card flex flex-col overflow-hidden"
          style={{ minHeight: 0 }}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 anim-fade-up ${m.sender === 'USER' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={m.sender === 'AI'
                    ? { background:'var(--accent-dim)', border:'1px solid var(--accent-border)' }
                    : { background:'var(--glass-02)',   border:'1px solid var(--border-default)' }
                  }
                >
                  {m.sender === 'AI'
                    ? <Sparkles className="w-3.5 h-3.5" style={{ color:'var(--accent)' }} />
                    : <span style={{ fontSize:'0.65rem', fontWeight:700, color:'var(--text-secondary)' }}>YOU</span>
                  }
                </div>

                {/* Bubble */}
                <div
                  className="rounded-2xl px-4 py-3 max-w-[85%]"
                  style={m.sender === 'AI' ? {
                    background:'var(--bg-03)',
                    border:'1px solid var(--border-default)',
                    borderTopLeftRadius: 6,
                  } : {
                    background:'var(--accent-dim)',
                    border:'1px solid var(--accent-border)',
                    borderTopRightRadius: 6,
                  }}
                >
                  {/* Evidence refs */}
                  {m.evidence_references && m.evidence_references.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {m.evidence_references.map(ref => (
                        <span
                          key={ref}
                          className="px-2 py-0.5 rounded-full font-mono"
                          style={{
                            fontSize:'0.65rem', fontWeight:600,
                            background:'var(--accent-dim)',
                            color:'var(--accent)',
                            border:'1px solid var(--accent-border)',
                          }}
                        >
                          [{ref}]
                        </span>
                      ))}
                    </div>
                  )}
                  <p
                    className="leading-relaxed whitespace-pre-wrap"
                    style={{ fontSize:'0.8125rem', color:'var(--text-primary)' }}
                  >
                    {m.text}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:'var(--accent-dim)', border:'1px solid var(--accent-border)' }}
                >
                  <Sparkles className="w-3.5 h-3.5 anim-breathe" style={{ color:'var(--accent)' }} />
                </div>
                <div
                  className="rounded-2xl px-4 py-3"
                  style={{ background:'var(--bg-03)', border:'1px solid var(--border-default)', borderTopLeftRadius:6 }}
                >
                  <div className="flex items-center gap-1.5">
                    {[0,1,2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background:'var(--text-tertiary)',
                          animation:`a-breathe 1.2s ease-in-out ${i*0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div
            className="shrink-0 flex items-center gap-3 p-4"
            style={{ borderTop:'1px solid var(--border-subtle)' }}
          >
            <button
              onClick={toggleVoice}
              className="btn btn-sm p-2.5 shrink-0"
              style={listening
                ? { background:'var(--red-dim)', color:'var(--red)', border:'1px solid var(--red-border)' }
                : { background:'var(--bg-04)', color:'var(--text-tertiary)', border:'1px solid var(--border-default)' }
              }
            >
              {listening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && handleSend()}
              placeholder="Ask about case evidence…"
              className="apple-input flex-1"
              style={{ padding:'9px 14px' }}
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="btn btn-primary btn-sm shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
