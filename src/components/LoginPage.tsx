'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ChefHat, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail, error, clearError } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isSignUp) {
                await signUpWithEmail(email, password, displayName);
            } else {
                await signInWithEmail(email, password);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        clearError();
        setEmail('');
        setPassword('');
        setDisplayName('');
    };

    return (
        <div className="login-page">
            <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          position: relative;
          overflow: hidden;
        }

        .login-page::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 70% 50%, rgba(236, 72, 153, 0.06) 0%, transparent 50%),
                      radial-gradient(circle at 50% 20%, rgba(168, 85, 247, 0.05) 0%, transparent 50%);
          animation: bgPulse 15s ease-in-out infinite;
        }

        @keyframes bgPulse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-2%, 2%) scale(1.02); }
          66% { transform: translate(2%, -1%) scale(0.98); }
        }

        .login-card {
          position: relative;
          width: 100%;
          max-width: 440px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 1.5rem;
          padding: 2.5rem;
          backdrop-filter: blur(24px);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3),
                      0 0 0 1px rgba(255, 255, 255, 0.05) inset;
          animation: cardAppear 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cardAppear {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .logo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }

        .logo-icon {
          width: 80px;
          height: 80px;
          border-radius: 1.25rem;
          background: linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
          animation: logoFloat 3s ease-in-out infinite;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .logo-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f8fafc;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .logo-subtitle {
          font-size: 0.875rem;
          color: #94a3b8;
          text-align: center;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: #64748b;
          pointer-events: none;
          transition: color 0.2s;
        }

        .login-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.75rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 0.875rem;
          color: #f1f5f9;
          font-size: 0.9375rem;
          font-family: inherit;
          transition: all 0.25s ease;
          outline: none;
        }

        .login-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .login-input:focus + .input-icon,
        .login-input:focus ~ .input-icon {
          color: #3b82f6;
        }

        .login-input::placeholder {
          color: #475569;
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #94a3b8;
        }

        .submit-btn {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: white;
          border: none;
          border-radius: 0.875rem;
          font-size: 1rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          margin-top: 1.25rem;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.5s ease;
        }

        .submit-btn:hover::before {
          left: 100%;
        }

        .submit-btn:hover {
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
          transform: translateY(-1px);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
          color: #475569;
          font-size: 0.8125rem;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(148, 163, 184, 0.15);
        }

        .google-btn {
          width: 100%;
          padding: 0.875rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 0.875rem;
          color: #e2e8f0;
          font-size: 0.9375rem;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.25s ease;
        }

        .google-btn:hover {
          background: rgba(30, 41, 59, 0.8);
          border-color: rgba(148, 163, 184, 0.35);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .google-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .google-icon {
          width: 20px;
          height: 20px;
        }

        .toggle-section {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .toggle-link {
          background: none;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: inherit;
          text-decoration: none;
          transition: color 0.2s;
        }

        .toggle-link:hover {
          color: #60a5fa;
          text-decoration: underline;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: #fca5a5;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          animation: shake 0.4s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .loader {
          width: 20px;
          height: 20px;
          border: 2.5px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .floating-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(99, 102, 241, 0.3);
          border-radius: 50%;
          animation: float 8s ease-in-out infinite;
        }

        .particle:nth-child(1) { left: 10%; top: 20%; animation-delay: 0s; animation-duration: 10s; }
        .particle:nth-child(2) { left: 30%; top: 70%; animation-delay: 2s; animation-duration: 12s; }
        .particle:nth-child(3) { left: 60%; top: 15%; animation-delay: 4s; animation-duration: 8s; }
        .particle:nth-child(4) { left: 80%; top: 60%; animation-delay: 1s; animation-duration: 11s; }
        .particle:nth-child(5) { left: 45%; top: 85%; animation-delay: 3s; animation-duration: 9s; }
        .particle:nth-child(6) { left: 90%; top: 35%; animation-delay: 5s; animation-duration: 13s; }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(20px, -30px) scale(1.5); opacity: 0.6; }
          50% { transform: translate(-15px, -60px) scale(1); opacity: 0.3; }
          75% { transform: translate(10px, -30px) scale(1.3); opacity: 0.5; }
        }

        .features-hint {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }

        .feature-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.625rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.15);
          border-radius: 1rem;
          font-size: 0.6875rem;
          color: #93c5fd;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 2rem 1.5rem;
            border-radius: 1.25rem;
          }

          .logo-icon {
            width: 64px;
            height: 64px;
          }

          .logo-title {
            font-size: 1.5rem;
          }
        }
      `}</style>

            <div className="floating-particles">
                <div className="particle" />
                <div className="particle" />
                <div className="particle" />
                <div className="particle" />
                <div className="particle" />
                <div className="particle" />
            </div>

            <div className="login-card">
                <div className="logo-container">
                    <div className="logo-icon">
                        <ChefHat size={40} color="white" />
                    </div>
                    <div className="logo-title">M A C</div>
                    <div className="logo-subtitle">
                        Mon Assistant de Courses
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {isSignUp && (
                        <div className="form-group">
                            <div className="input-wrapper">
                                <input
                                    id="displayName-input"
                                    type="text"
                                    className="login-input"
                                    placeholder="Votre prénom"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    required
                                    autoComplete="name"
                                />
                                <User size={18} className="input-icon" />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <div className="input-wrapper">
                            <input
                                id="email-input"
                                type="email"
                                className="login-input"
                                placeholder="Adresse email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                            <Mail size={18} className="input-icon" />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <input
                                id="password-input"
                                type={showPassword ? 'text' : 'password'}
                                className="login-input"
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                            />
                            <Lock size={18} className="input-icon" />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        id="submit-btn"
                        type="submit"
                        className="submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="loader" />
                        ) : (
                            <>
                                {isSignUp ? 'Créer mon compte' : 'Se connecter'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="divider">ou</div>

                <button
                    id="google-signin-btn"
                    type="button"
                    className="google-btn"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                >
                    <svg className="google-icon" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Continuer avec Google
                </button>

                <div className="toggle-section">
                    {isSignUp ? (
                        <>
                            Déjà un compte ?{' '}
                            <button type="button" className="toggle-link" onClick={toggleMode}>
                                Se connecter
                            </button>
                        </>
                    ) : (
                        <>
                            Pas encore de compte ?{' '}
                            <button type="button" className="toggle-link" onClick={toggleMode}>
                                S&apos;inscrire
                            </button>
                        </>
                    )}
                </div>

                <div className="features-hint">
                    <span className="feature-tag">
                        <Sparkles size={10} />
                        Garde-manger
                    </span>
                    <span className="feature-tag">
                        <Sparkles size={10} />
                        Recettes IA
                    </span>
                    <span className="feature-tag">
                        <Sparkles size={10} />
                        Liste de courses
                    </span>
                </div>
            </div>
        </div>
    );
}
