import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { UserPlus, Store, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage({ setPage }) {
  const { register } = useAuth();
  const [step, setStep]       = useState(1); // 1 = type, 2 = form
  const [role, setRole]       = useState('buyer');
  const [form, setForm]       = useState({ name:'', email:'', password:'', phone:'', city:'Conakry', store_name:'', store_description:'' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Mot de passe trop court (minimum 6 caractères).'); return; }
    setError(''); setLoading(true);
    const res = await register({ ...form, role });
    setLoading(false);
    if (res.success) setPage(role === 'seller' ? 'seller-dashboard' : 'home');
    else setError(res.message);
  };

  if (step === 1) return (
    <div className="auth-page fade-in">
      <div className="auth-card">
        <div className="auth-logo"><span className="logo-green">Shop</span><span className="logo-yellow">Guinée</span></div>
        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-sub">Choisissez votre type de compte :</p>
        <div className="role-cards">
          <button className={`role-card ${role==='buyer'?'selected':''}`} onClick={() => setRole('buyer')}>
            <span className="role-icon">🛒</span>
            <strong>Acheteur</strong>
            <p>Parcourir les produits, passer des commandes et suivre vos livraisons.</p>
          </button>
          <button className={`role-card ${role==='seller'?'selected':''}`} onClick={() => setRole('seller')}>
            <span className="role-icon">🏪</span>
            <strong>Vendeur</strong>
            <p>Créer votre boutique, ajouter vos produits et recevoir des commandes.</p>
          </button>
        </div>
        <button className="btn btn-primary full-width" style={{marginTop:'24px'}} onClick={() => setStep(2)}>
          Continuer en tant que {role === 'buyer' ? 'Acheteur' : 'Vendeur'} →
        </button>
        <div className="auth-footer">
          <span>Déjà un compte ?</span>
          <button className="link-btn" onClick={() => setPage('login')}>Se connecter</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-page fade-in">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <button className="back-btn" onClick={() => setStep(1)}>← Retour</button>
        <div className="auth-logo"><span className="logo-green">Shop</span><span className="logo-yellow">Guinée</span></div>
        <h1 className="auth-title">{role === 'seller' ? '🏪 Créer ma boutique' : '🛒 Créer mon compte'}</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handle} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nom complet *</label>
              <input className="form-input" placeholder="Alpha Mamadou Diallo" required
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone</label>
              <input className="form-input" placeholder="+224 620 00 00 00"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" placeholder="vous@exemple.com" required
              value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe *</label>
            <div className="pw-wrap">
              <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Min. 6 caractères" required
                value={form.password} onChange={e => set('password', e.target.value)} />
              <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Ville</label>
            <select className="form-input" value={form.city} onChange={e => set('city', e.target.value)}>
              {['Conakry','Kindia','Labé','Kankan','N\'Zérékoré','Mamou','Faranah','Boké','Coyah','Dubréka','Forécariah','Fria'].map(c =>
                <option key={c}>{c}</option>
              )}
            </select>
          </div>

          {role === 'seller' && (
            <>
              <div className="form-group">
                <label className="form-label">Nom de la boutique *</label>
                <input className="form-input" placeholder="Ex: Alpha Tech & Mode" required
                  value={form.store_name} onChange={e => set('store_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Description de la boutique</label>
                <textarea className="form-input" rows="3"
                  placeholder="Décrivez votre boutique, vos spécialités…"
                  value={form.store_description} onChange={e => set('store_description', e.target.value)} />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary full-width" disabled={loading}>
            {loading ? 'Création en cours…' : <><UserPlus size={18}/> Créer mon compte</>}
          </button>
        </form>

        <div className="auth-footer">
          <span>Déjà un compte ?</span>
          <button className="link-btn" onClick={() => setPage('login')}>Se connecter</button>
        </div>
      </div>
    </div>
  );
}
