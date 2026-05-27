import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, LogIn, UserPlus, Store } from 'lucide-react';

export default function LoginPage({ setPage }) {
  const { login } = useAuth();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await login(form.email, form.password);
    setLoading(false);
    if (res.success) {
      // Rediriger selon le rôle de l'utilisateur
      if (res.user?.role === 'admin') {
        setPage('admin');
      } else {
        setPage('dashboard');
      }
    } else {
      setError(res.message);
    }
  };

  const quickFill = (email) => setForm({ email, password: 'password123' });

  return (
    <div className="auth-page fade-in">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-green">Shop</span><span className="logo-yellow">Guinée</span>
        </div>
        <h1 className="auth-title">Connexion</h1>
        <p className="auth-sub">Bienvenue ! Connectez-vous à votre compte.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handle} className="auth-form">
          <div className="form-group">
            <label className="form-label">Adresse email</label>
            <input className="form-input" type="email" placeholder="vous@exemple.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div className="pw-wrap">
              <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary full-width" disabled={loading}>
            {loading ? 'Connexion en cours…' : <><LogIn size={18}/> Se connecter</>}
          </button>
        </form>

        <div className="demo-section">
          <p className="demo-label">— Connexion rapide (démo) —</p>
          <div className="demo-btns">
            <button className="demo-btn" onClick={() => quickFill('acheteur@shopguinee.gn')}>👤 Acheteur</button>
            <button className="demo-btn" onClick={() => quickFill('vendeur@shopguinee.gn')}><Store size={13}/> Vendeur</button>
            <button className="demo-btn" onClick={() => quickFill('admin@shopguinee.gn')}>🛡️ Admin</button>
          </div>
          <p style={{ textAlign:'center', fontSize:'.8rem', color:'var(--text-muted)', marginTop:'6px' }}>
            Mot de passe démo : <strong>password123</strong>
          </p>
        </div>

        <div className="auth-footer">
          <span>Pas encore de compte ?</span>
          <button className="link-btn" onClick={() => setPage('register')}><UserPlus size={15}/> Créer un compte</button>
        </div>
      </div>
    </div>
  );
}
