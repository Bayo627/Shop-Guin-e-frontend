import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, formatPrice } from '../api.js';
import { CheckCircle, ChevronRight } from 'lucide-react';

const STEPS = ['Livraison', 'Paiement', 'Confirmation'];

const PAYMENT_INFO = {
  orange_money: {
    label: 'Orange Money', emoji: '🟠',
    number: '+224 620 00 00 01', name: 'SHOP GUINÉE SARL',
    instruction: 'Composez *144# → Transfert → Entrez le numéro ci-dessus → Montant exact → Confirmez → Notez l\'ID de transaction.'
  },
  mtn_money: {
    label: 'MTN MoMo', emoji: '🟡',
    number: '+224 664 00 00 01', name: 'SHOP GUINÉE SARL',
    instruction: 'Composez *555# → MoMo Pay → Entrez le numéro ci-dessus → Montant exact → PIN → Notez l\'ID de transaction.'
  },
  bank_transfer: {
    label: 'Virement Bancaire', emoji: '🏦',
    number: 'GN64 0009 1234 5678 9012 34', name: 'SHOP GUINÉE SARL (Ecobank)',
    instruction: 'Effectuez un virement vers le compte ci-dessus en indiquant votre numéro de commande en référence.'
  },
};

export default function CheckoutPage({ setPage }) {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [shipping, setShipping] = useState({
    name: user?.name || '', phone: user?.phone || '',
    address: user?.address || '', city: user?.city || 'Conakry',
  });
  const [method, setMethod] = useState('orange_money');
  const [txId, setTxId]     = useState('');
  const [senderPhone, setSender] = useState('');

  if (cart.length === 0 && step !== 2) { setPage('cart'); return null; }

  const placeOrder = async () => {
    if (!shipping.address || !shipping.name) { setError('Nom et adresse de livraison requis.'); return; }
    setLoading(true); setError('');
    try {
      const data = await api.post('/orders', {
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        shipping_name: shipping.name, shipping_phone: shipping.phone,
        shipping_address: shipping.address, shipping_city: shipping.city,
        payment_method: method,
      });
      setOrderId(data.order.id);
      setOrderNumber(data.order.order_number);
      setStep(1);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const submitPayment = async () => {
    if (!txId.trim() || !senderPhone.trim()) { setError('Numéro expéditeur et ID de transaction requis.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/payments', { order_id: orderId, provider: method, transaction_id: txId, sender_phone: senderPhone });
      clearCart();
      setStep(2);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const pm = PAYMENT_INFO[method];

  return (
    <div className="checkout-page fade-in">
      <div className="container">
        <h1 className="section-title" style={{ margin:'30px 0 24px' }}>Finaliser ma commande</h1>

        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                <div className="step-circle">{i < step ? <CheckCircle size={18}/> : i + 1}</div>
                <span>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'done' : ''}`}/>}
            </React.Fragment>
          ))}
        </div>

        {error && <div className="alert alert-error" style={{ maxWidth:'640px', margin:'0 auto 16px' }}>{error}</div>}

        {/* ── ÉTAPE 0 : Livraison ── */}
        {step === 0 && (
          <div className="checkout-card">
            <h2>📦 Adresse de livraison</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nom complet *</label>
                <input className="form-input" value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone *</label>
                <input className="form-input" value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Adresse complète *</label>
              <input className="form-input" placeholder="Quartier, rue, numéro…" value={shipping.address}
                onChange={e => setShipping({...shipping, address: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Ville *</label>
              <select className="form-input" value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})}>
                {['Conakry','Kindia','Labé','Kankan','N\'Zérékoré','Mamou','Faranah','Boké'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <h2 style={{ marginTop:'28px' }}>💳 Mode de paiement</h2>
            <div className="payment-methods">
              {Object.entries(PAYMENT_INFO).map(([k, v]) => (
                <label key={k} className={`payment-option ${method === k ? 'selected' : ''}`}>
                  <input type="radio" name="method" value={k} checked={method === k} onChange={() => setMethod(k)}/>
                  <span className="payment-emoji">{v.emoji}</span>
                  <span>{v.label}</span>
                </label>
              ))}
            </div>

            <div className="order-mini-summary">
              <strong>Récapitulatif :</strong>
              {cart.map(i => (
                <div key={i.product_id} className="summary-row">
                  <span>{i.name} ×{i.quantity}</span>
                  <span>{formatPrice(i.price * i.quantity)}</span>
                </div>
              ))}
              <div className="summary-row summary-total">
                <strong>Total à payer</strong>
                <strong style={{ color:'var(--color-green)' }}>{formatPrice(getCartTotal())}</strong>
              </div>
            </div>

            <button className="btn btn-primary" style={{ marginTop:'20px' }} onClick={placeOrder} disabled={loading}>
              {loading ? 'Traitement…' : <>Valider ma commande <ChevronRight size={18}/></>}
            </button>
          </div>
        )}

        {/* ── ÉTAPE 1 : Paiement ── */}
        {step === 1 && (
          <div className="checkout-card">
            <div className="alert alert-success">
              ✅ Commande <strong>#{orderNumber}</strong> créée ! Veuillez maintenant effectuer votre paiement.
            </div>
            <h2>{pm.emoji} Instructions — {pm.label}</h2>
            <div className="payment-instructions">
              <p>{pm.instruction}</p>
              <div className="payment-number-box">
                <span>Numéro / Compte :</span>
                <strong>{pm.number}</strong>
              </div>
              <div className="payment-number-box">
                <span>Bénéficiaire :</span>
                <strong>{pm.name}</strong>
              </div>
              <div className="payment-number-box total">
                <span>Montant exact :</span>
                <strong style={{ color:'var(--color-green)', fontSize:'1.2rem' }}>{formatPrice(getCartTotal())}</strong>
              </div>
            </div>

            <div className="form-group" style={{ marginTop:'24px' }}>
              <label className="form-label">Votre numéro de téléphone expéditeur *</label>
              <input className="form-input" placeholder="+224 6XX XX XX XX"
                value={senderPhone} onChange={e => setSender(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">ID / Code de transaction reçu par SMS *</label>
              <input className="form-input" placeholder="Ex: OA202405231234ABC ou TXN123456"
                value={txId} onChange={e => setTxId(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={submitPayment} disabled={loading}>
              {loading ? 'Soumission…' : <><CheckCircle size={18}/> Confirmer mon paiement</>}
            </button>
          </div>
        )}

        {/* ── ÉTAPE 2 : Confirmation ── */}
        {step === 2 && (
          <div className="checkout-card success-card" style={{ textAlign:'center' }}>
            <div className="success-icon">🎉</div>
            <h2>Commande confirmée !</h2>
            <p>Votre commande <strong>#{orderNumber}</strong> a été reçue et votre paiement est en cours de validation.</p>
            <p style={{ color:'var(--text-secondary)', marginTop:'12px' }}>
              Vous serez notifié par SMS/email dès validation. Délai habituel : <strong>24h ouvrables.</strong>
            </p>
            <div className="success-actions">
              <button className="btn btn-primary" onClick={() => setPage('buyer-dashboard')}>
                📦 Suivre mes commandes
              </button>
              <button className="btn btn-outline" onClick={() => setPage('shop')}>
                Continuer mes achats
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
