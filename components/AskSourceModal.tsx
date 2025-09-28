'use client';

import { useEffect, useState } from 'react';

export default function AskSourceModal() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const asked = typeof window !== 'undefined' && localStorage.getItem('tn-asked');
    if (asked) setLocked(true);
  }, []);

  function onAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    const response =
      'Breathe. Feel your feet. The next step is the honest one you’re avoiding. Make it now.';
    setAnswer(response);
    setLocked(true);
    try { localStorage.setItem('tn-asked', '1'); } catch {}
  }

  return (
    <>
      {!open && (
        <button className="tn-fab" onClick={() => setOpen(true)} aria-label="Ask Source">
          Ask Source
        </button>
      )}
      {open && (
        <div className="tn-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="tn-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tn-modal-head">
              <h3>Ask Source</h3>
              <button className="tn-x" onClick={() => setOpen(false)} aria-label="Close">×</button>
            </div>
            {!answer && !locked && (
              <form onSubmit={onAsk} className="tn-form">
                <p className="tn-muted">One question. One answer. Then we talk.</p>
                <input
                  className="tn-input"
                  type="text"
                  placeholder="Type your question…"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  maxLength={180}
                />
                <button className="btn" type="submit">Get answer</button>
              </form>
            )}
            {(answer || locked) && (
              <div className="tn-answer">
                {answer && <p className="tn-quote">“{answer}”</p>}
                {!answer && <p className="tn-muted">You’ve already used your question.</p>}
                <a className="btn ghost" href="/contact">Book a consult</a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
