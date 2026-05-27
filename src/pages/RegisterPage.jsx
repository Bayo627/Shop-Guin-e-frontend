import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { UserPlus, Eye, EyeOff, CheckCircle, ArrowRight, Sparkles, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterPage({ setPage, showToast }) {
  const { register } = useAuth();
  const [step, setStep]       = useState(1); // 1 = type, 2 = form, 3 = success
  const [role, setRole]       = useState('buyer');
  const [form, setForm]       = useState({ name:'', email:'', password:'', phone:'', city:'Conakry', store_name:'', store_description:'' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Countdown timer for auto-redirect after success
  useEffect(() => {
    if (step === 3) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            setPage('home');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdownRef.current);
    }
  }, [step, setPage]);

  const goToDashboard = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setPage('home');
  };

  const handle = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Mot de passe trop court (minimum 6 caractères).'); return; }
    setError(''); setLoading(true);
    // On envoie le formulaire tel quel. Le backend s'occupe de créer le compte utilisateur et le profil boutique, peu importe le rôle.
    const res = await register({ ...form, role });
    setLoading(false);
    if (res.success) {
      setStep(3); // Go to success screen instead of direct redirect
    }
    else setError(res.message);
  };

  /* ──────── STEP 3: SUCCESS SCREEN ──────── */
  if (step === 3) return (
    <div className="auth-page fade-in" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 30%, #f0f9ff 70%, #fefce8 100%)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="auth-card"
        style={{ maxWidth: '480px', textAlign: 'center', padding: '48px 36px', position: 'relative', overflow: 'hidden' }}
      >
        {/* Decorative background elements */}
        <div style={{
          position: 'absolute', top: '-30px', right: '-30px',
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(0,148,96,0.08), rgba(252,209,22,0.08))',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute', bottom: '-20px', left: '-20px',
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(230,57,70,0.06), rgba(252,209,22,0.06))',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Animated checkmark circle */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.7, type: 'spring', stiffness: 150, damping: 12 }}
            style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #009460 0%, #00b371 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 12px 40px rgba(0,148,96,0.25), 0 4px 12px rgba(0,148,96,0.15)'
            }}
          >
            <motion.div
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <CheckCircle size={48} color="white" strokeWidth={2.5} />
            </motion.div>
          </motion.div>

          {/* Floating confetti particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, x: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [20, -60 - (i * 15)],
                x: [(i % 2 === 0 ? -1 : 1) * (20 + i * 12)],
                scale: [0, 1.2, 1, 0.5],
                rotate: [0, (i % 2 === 0 ? 180 : -180)]
              }}
              transition={{ delay: 0.4 + (i * 0.1), duration: 1.8, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: '80px',
                left: '50%',
                width: '10px', height: '10px',
                borderRadius: i % 3 === 0 ? '50%' : '2px',
                background: ['#009460', '#FCD116', '#E63946', '#CE1126', '#00b371', '#F4A261'][i],
                zIndex: 2,
                pointerEvents: 'none'
              }}
            />
          ))}

          {/* Guinea flag accent bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
            style={{ display: 'flex', height: '4px', borderRadius: '4px', overflow: 'hidden', margin: '0 auto 28px', width: '80px' }}
          >
            <div style={{ flex: 1, background: '#CE1126' }} />
            <div style={{ flex: 1, background: '#FCD116' }} />
            <div style={{ flex: 1, background: '#009460' }} />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              fontSize: '1.6rem', fontWeight: '900', color: '#2B2D42',
              marginBottom: '12px', lineHeight: 1.3
            }}
          >
            🎉 Félicitations {form.name.split(' ')[0]} !
          </motion.h1>

          {/* Success message */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            style={{
              fontSize: '0.95rem', color: '#6b7280', lineHeight: 1.7,
              marginBottom: '8px', fontWeight: '500'
            }}
          >
            Votre compte <strong style={{ color: '#009460' }}>{role === 'seller' ? 'Vendeur' : 'Acheteur'}</strong> a été créé avec succès sur <strong style={{ color: '#2B2D42' }}>Shop Guinée</strong> !
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            style={{
              fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.6,
              marginBottom: '28px', fontWeight: '400'
            }}
          >
            {role === 'seller'
              ? 'Vous pouvez maintenant créer votre boutique, ajouter vos produits et commencer à vendre sur toute la Guinée 🇬🇳'
              : 'Vous pouvez maintenant explorer nos produits, passer des commandes et profiter de la meilleure marketplace de Guinée 🇬🇳'
            }
          </motion.p>

          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
              border: '1px solid #bbf7d0',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '28px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>✅</span>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#166534' }}>Compte vérifié et activé</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: '500', margin: 0, paddingLeft: '28px' }}>
              Email : <strong style={{ color: '#166534' }}>{form.email}</strong>
            </p>
          </motion.div>

          {/* CTA button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={goToDashboard}
            className="btn btn-primary full-width"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '14px 28px', fontSize: '0.9rem', fontWeight: '800',
              background: 'linear-gradient(135deg, #009460 0%, #00b371 100%)',
              border: 'none', borderRadius: '14px', color: 'white', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,148,96,0.3)',
              marginBottom: '16px'
            }}
          >
            🚀 Accéder à Shop Guinée
            <ArrowRight size={18} />
          </motion.button>

          {/* Countdown */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: '600' }}
          >
            Redirection automatique dans <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '24px', height: '24px', borderRadius: '8px',
              background: '#f3f4f6', color: '#2B2D42', fontWeight: '900', fontSize: '0.8rem',
              margin: '0 4px'
            }}>{countdown}</span> secondes
          </motion.p>
        </div>
      </motion.div>
    </div>
  );

  /* ──────── STEP 1: ROLE SELECTION ──────── */
  if (step === 1) return (
    <div className="auth-page fade-in">
      <div className="auth-card">
        <div className="auth-logo"><span className="logo-green">Shop</span><span className="logo-yellow">Guinée</span></div>
        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-sub text-center mb-4">Choisissez votre type de compte :</p>
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

  /* ──────── STEP 2: REGISTRATION FORM ──────── */
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
            <label className="form-label">Ville de résidence</label>
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

          <button type="submit" className="btn btn-primary full-width" disabled={loading} style={{marginTop: '16px'}}>
            {loading ? 'Création en cours…' : <><UserPlus size={18}/> Rejoindre Shop Guinée</>}
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
