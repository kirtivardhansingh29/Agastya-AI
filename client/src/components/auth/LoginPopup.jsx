import React, { useState } from 'react';
import { User, Lock, RefreshCw } from 'lucide-react';

/**
 * Demo login popup in the style of Indian government portals.
 *
 * DEMONSTRATION ONLY — the credential check below happens entirely in the
 * browser against a hard-coded demo list. This is NOT real authentication
 * and must never be treated as a security boundary.
 */
const DEMO_USERS = [
  { username: 'admin', password: 'admin123', role: 'Administrator' },
  { username: 'inspector', password: 'inspector123', role: 'Mine Inspector' },
  { username: 'viewer', password: 'viewer123', role: 'Viewer' }
];

function newCaptcha() {
  return {
    a: 2 + Math.floor(Math.random() * 8),
    b: 2 + Math.floor(Math.random() * 8)
  };
}

export default function LoginPopup({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState(newCaptcha);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [error, setError] = useState('');

  const refreshCaptcha = () => {
    setCaptcha(newCaptcha());
    setCaptchaAnswer('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (parseInt(captchaAnswer, 10) !== captcha.a + captcha.b) {
      setError('Incorrect captcha answer. / गलत कैप्चा उत्तर — कृपया पुनः प्रयास करें।');
      refreshCaptcha();
      return;
    }

    const user = DEMO_USERS.find(
      (u) => u.username === username.trim().toLowerCase() && u.password === password
    );
    if (!user) {
      setError('Invalid username or password. / अमान्य उपयोगकर्ता नाम या पासवर्ड।');
      refreshCaptcha();
      return;
    }

    setError('');
    if (onLogin) onLogin({ username: user.username, role: user.role });
  };

  return (
    <div className="login-overlay" role="dialog" aria-modal="true" aria-label="Agastya AI demo login">
      <div className="login-card">
        {/* Tricolour strip — government portal style */}
        <div className="login-tricolour" aria-hidden="true">
          <span className="tri-saffron"></span>
          <span className="tri-white"></span>
          <span className="tri-green"></span>
        </div>

        <div className="login-header">
          <div className="login-govt-line">भारत सरकार | Government of India</div>
          <h1 className="login-title">
            Agastya AI <span className="login-title-hindi">अगस्त्या AI</span>
          </h1>
          <div className="login-subtitle">राष्ट्रीय खनन अनुपालन पोर्टल</div>
          <div className="login-subtitle-en">
            National Mine Compliance Portal — Intelligent Mine Compliance &amp; Evidence Tracking Platform
          </div>
          <span className="login-demo-badge">DEMO LOGIN · डेमो लॉगिन</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error" role="alert">{error}</div>
          )}

          <label className="login-label" htmlFor="login-username">
            Username <span className="login-label-hindi">/ उपयोगकर्ता नाम</span>
          </label>
          <div className="login-input-wrap">
            <User size={15} />
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              autoFocus
            />
          </div>

          <label className="login-label" htmlFor="login-password">
            Password <span className="login-label-hindi">/ पासवर्ड</span>
          </label>
          <div className="login-input-wrap">
            <Lock size={15} />
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <label className="login-label" htmlFor="login-captcha">
            Captcha <span className="login-label-hindi">/ कैप्चा</span>
          </label>
          <div className="login-captcha-row">
            <span className="login-captcha-q">
              {captcha.a} + {captcha.b} = ?
            </span>
            <button
              type="button"
              className="login-captcha-refresh"
              onClick={refreshCaptcha}
              title="New captcha / नया कैप्चा"
            >
              <RefreshCw size={13} />
            </button>
            <input
              id="login-captcha"
              type="text"
              inputMode="numeric"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              placeholder="Answer"
              className="login-captcha-input"
              autoComplete="off"
            />
          </div>

          <button type="submit" className="login-submit">
            Sign In · साइन इन
          </button>
        </form>

        <div className="login-demo-creds">
          <div className="login-demo-creds-title">Demo credentials · डेमो विवरण</div>
          <ul className="login-demo-creds-list">
            {DEMO_USERS.map((u) => (
              <li key={u.username}>
                <code>{u.username}</code> / <code>{u.password}</code>
                <span className="login-demo-creds-role"> — {u.role}</span>
              </li>
            ))}
          </ul>
          <div className="login-demo-note">
            This is a demonstration login for evaluation only — not real
            authentication. Please do not enter any real password.
          </div>
        </div>

        <div className="login-footer">
          © Agastya AI · Mine Safety &amp; Compliance Monitoring · Demo build
        </div>
      </div>
    </div>
  );
}
