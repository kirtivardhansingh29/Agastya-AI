import React, { useState, useRef, useEffect } from 'react';
import { chatWithArun } from '../../services/api';

const HISTORY_KEY = 'arun-chat-history-v1';
const HISTORY_LIMIT = 50;

const SUGGESTIONS = [
  'How many critical-risk mines are being monitored right now?',
  'What are the key DGMS safety regulations for coal mines?',
  'Explain methane gas monitoring limits in underground mines',
  'Show me the most recent fatal incidents'
];

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Namaste! I'm **Arun**, your Agastya AI assistant. Ask me anything about coal mining — safety regulations, inspections, gas monitoring — or ask about **live platform data**, like \"how many critical mines are there?\" or \"show recent incidents\"."
};

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY));
    if (Array.isArray(saved) && saved.length > 0) {
      return saved.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').slice(-HISTORY_LIMIT);
    }
  } catch {
    /* ignore corrupted storage */
  }
  return [WELCOME_MESSAGE];
}

/** Minimal safe renderer: escapes HTML, then supports **bold**, bullet lines and line breaks. */
function renderMessage(text) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const lines = withBold.split('\n');
  const html = lines
    .map((line) => {
      const trimmed = line.trim();
      if (/^[-*•]\s+/.test(trimmed)) {
        return `<li>${trimmed.replace(/^[-*•]\s+/, '')}</li>`;
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        return `<li>${trimmed.replace(/^\d+\.\s+/, '')}</li>`;
      }
      return trimmed ? `<p>${line}</p>` : '';
    })
    .join('');
  // Wrap consecutive <li> groups in <ul>
  return html.replace(/((?:<li>.*?<\/li>)+)/g, '<ul>$1</ul>');
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

const SPEECH_SUPPORTED =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function ArunChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadHistory);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, sending]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  // Persist chat history
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-HISTORY_LIMIT)));
    } catch {
      /* storage full or unavailable — chat still works in-memory */
    }
  }, [messages]);

  // Stop speech recognition on unmount
  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop(); } catch { /* noop */ }
    };
  }, []);

  const sendMessage = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;

    const userMsg = { role: 'user', content };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setSending(true);

    try {
      const reply = await chatWithArun(
        history.map(({ role, content: c }) => ({ role, content: c }))
      );
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, I couldn't respond right now. (${err.message}) Please try again in a moment.` }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* noop */ }
  };

  const toggleListening = () => {
    if (!SPEECH_SUPPORTED) return;
    if (listening) {
      try { recognitionRef.current?.stop(); } catch { /* noop */ }
      setListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = 'en-IN';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  return (
    <div className="arun-chat-root">
      {open && (
        <div className="arun-chat-panel" role="dialog" aria-label="Arun chat assistant">
          <div className="arun-chat-header">
            <div className="arun-chat-header-brand">
              <img src="/arun-avatar.png" alt="Arun" className="arun-chat-avatar" />
              <div>
                <div className="arun-chat-title">Arun</div>
                <div className="arun-chat-subtitle">
                  <span className="arun-chat-online-dot" /> Agastya AI Assistant
                </div>
              </div>
            </div>
            <div className="arun-chat-header-actions">
              <button className="arun-chat-icon-btn" onClick={clearChat} aria-label="Clear chat history" title="Clear chat">
                <TrashIcon />
              </button>
              <button className="arun-chat-icon-btn" onClick={() => setOpen(false)} aria-label="Close chat">
                <CloseIcon />
              </button>
            </div>
          </div>

          <div className="arun-chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`arun-chat-msg arun-chat-msg-${msg.role}`}>
                <div
                  className="arun-chat-bubble"
                  dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }}
                />
              </div>
            ))}
            {messages.length <= 1 && (
              <div className="arun-chat-suggestions">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="arun-chat-suggestion" onClick={() => sendMessage(s)} disabled={sending}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {sending && (
              <div className="arun-chat-msg arun-chat-msg-assistant">
                <div className="arun-chat-bubble arun-chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="arun-chat-input-row">
            <input
              ref={inputRef}
              className="arun-chat-input"
              type="text"
              placeholder={listening ? 'Listening... speak now' : 'Ask Arun about coal mining...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              maxLength={2000}
            />
            {SPEECH_SUPPORTED && (
              <button
                className={`arun-chat-mic ${listening ? 'arun-chat-mic-listening' : ''}`}
                onClick={toggleListening}
                disabled={sending}
                aria-label={listening ? 'Stop listening' : 'Voice input'}
                title="Voice input"
              >
                <MicIcon />
              </button>
            )}
            <button
              className="arun-chat-send"
              onClick={() => sendMessage()}
              disabled={sending || !input.trim()}
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      <button
        className={`arun-chat-fab ${open ? 'arun-chat-fab-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close Arun chat' : 'Open Arun chat'}
      >
        {open ? <CloseIcon /> : <img src="/arun-avatar.png" alt="Arun" className="arun-chat-fab-avatar" />}
      </button>
    </div>
  );
}
