import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api, formatPrice } from '../api.js';
import { Package, User, Heart, MessageSquare, LogOut, ChevronRight, CheckCircle2, Truck, Clipboard, MapPin, Phone } from 'lucide-react';

const STATUS_MAP = {
  pending:    { label: 'En attente',       color: 'bg-amber-50 text-amber-600 border-amber-100',      step: 1 },
  confirmed:  { label: 'Confirmée',        color: 'bg-blue-50 text-blue-600 border-blue-100',          step: 2 },
  processing: { label: 'En préparation',   color: 'bg-purple-50 text-purple-600 border-purple-100',  step: 3 },
  shipped:    { label: 'Expédiée',         color: 'bg-indigo-50 text-indigo-600 border-indigo-100',      step: 4 },
  delivered:  { label: 'Livrée',          color: 'bg-emerald-50 text-[#009460] border-emerald-100',  step: 5 },
  cancelled:  { label: 'Annulée',          color: 'bg-rose-50 text-[#E63946] border-rose-100',          step: 0 },
};

const MENU = [
  { key: 'orders',   icon: <Package size={18} />,      label: 'Mes Commandes' },
  { key: 'profile',  icon: <User size={18} />,         label: 'Mon Profil' },
  { key: 'messages', icon: <MessageSquare size={18} />, label: 'Messages privés' },
];

export default function BuyerDashboard({ setPage, showToast }) {
  const { user, logout, updateProfile } = useAuth();
  const [tab, setTab]         = useState('orders');
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', city: '', address: '' });
  const [profileMsg, setProfileMsg]   = useState('');

  useEffect(() => {
    if (!user) { 
      setPage('login'); 
      return; 
    }
    setProfileForm({ 
      name: user.name || '', 
      phone: user.phone || '', 
      city: user.city || 'Conakry', 
      address: user.address || '' 
    });
    
    api.get('/orders/my-orders')
      .then(d => setOrders(d.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    const res = await updateProfile(profileForm);
    if (res.success) {
      showToast('✅ Votre profil a été mis à jour avec succès.', 'success');
    } else {
      setProfileMsg('❌ ' + res.message);
      showToast('❌ Échec de la mise à jour.', 'error');
    }
  };

  if (!user) return null;

  // Delivery step component
  const DeliveryStepper = ({ currentStatus }) => {
    const sInfo = STATUS_MAP[currentStatus] || { step: 1 };
    const stepNum = sInfo.step;
    
    if (stepNum === 0) {
      return (
        <div className="bg-rose-50 border border-rose-100 text-[#E63946] px-4 py-2.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
          <span>❌ Cette commande a été annulée. Contactez le service client en cas de besoin.</span>
        </div>
      );
    }

    const steps = [
      { id: 1, label: 'Commandé' },
      { id: 2, label: 'Confirmé' },
      { id: 3, label: 'En cours' },
      { id: 4, label: 'Expédié' },
      { id: 5, label: 'Livré' }
    ];

    return (
      <div className="w-full py-4 px-2">
        {/* Progress Line */}
        <div className="relative flex justify-between items-center w-full">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-gray-100 -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-[#009460] -z-10 transition-all duration-500"
            style={{ width: `${((stepNum - 1) / 4) * 100}%` }}
          ></div>

          {steps.map(s => {
            const isCompleted = stepNum >= s.id;
            const isActive = stepNum === s.id;

            return (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm transition border ${
                  isActive 
                    ? 'bg-[#FCD116] border-[#cca400] text-[#2B2D42] scale-110 ring-4 ring-[#FCD116]/20' 
                    : isCompleted 
                      ? 'bg-[#009460] border-transparent text-white' 
                      : 'bg-white border-gray-200 text-gray-400'
                }`}>
                  {isCompleted && !isActive ? '✓' : s.id}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider ${
                  isActive 
                    ? 'text-[#2B2D42]' 
                    : isCompleted 
                      ? 'text-[#009460]' 
                      : 'text-gray-400'
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 md:px-6 font-poppins text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 my-8">
        <div>
          <span className="text-xs font-black uppercase text-[#009460] tracking-widest">Espace Client</span>
          <h1 className="text-3xl font-black text-[#2B2D42] mt-1">👤 Mon Compte</h1>
        </div>
        <button 
          onClick={() => setPage('shop')} 
          className="px-5 py-2.5 bg-[#E63946] hover:bg-[#C82935] text-white rounded-xl text-xs font-black uppercase tracking-wider transition self-start shadow-md hover:shadow-glow-red"
        >
          Continuer mes achats
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <aside className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-premium h-fit space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#009460] to-emerald-400 text-white flex items-center justify-center font-black text-xl shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <strong className="text-sm text-[#2B2D42] block truncate">{user.name}</strong>
              <span className="text-[10px] text-gray-400 block truncate mb-1.5">{user.email}</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-[#009460] border border-emerald-100 text-[8px] font-black rounded-full uppercase tracking-wider">
                Acheteur Certifié
              </span>
            </div>
          </div>

          <ul className="flex flex-col gap-1.5">
            {MENU.map(m => (
              <li key={m.key}>
                <button 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-[#009460] transition cursor-pointer ${tab === m.key ? 'bg-emerald-50 text-[#009460]' : ''}`} 
                  onClick={() => setTab(m.key)}
                >
                  {m.icon} 
                  <span>{m.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <hr className="border-gray-50" />

          <button 
            className="w-full flex items-center gap-3 px-4 py-3 bg-rose-50 hover:bg-rose-100 text-[#E63946] rounded-xl text-xs font-black transition cursor-pointer"
            onClick={() => { logout(); setPage('home'); showToast("Vous avez été déconnecté."); }}
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-[28px] p-6 md:p-8 shadow-premium">
          
          {/* ── Tab: Orders History & Stepper ── */}
          {tab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#2B2D42]">Mes Commandes ({orders.length})</h2>
                <p className="text-xs text-gray-400 font-semibold mt-1">Suivez en temps réel l'avancement et la livraison de vos colis.</p>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center text-gray-400 font-semibold flex flex-col items-center gap-4">
                  <div className="text-4xl">📦</div>
                  <h3>Vous n'avez passé aucune commande.</h3>
                  <button onClick={() => setPage('shop')} className="px-5 py-2.5 bg-[#009460] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md">Commencer à explorer</button>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {orders.map(o => {
                    const s = STATUS_MAP[o.status] || { label: o.status, color: 'bg-gray-50 text-gray-500', step: 1 };
                    return (
                      <div key={o.id} className="border border-gray-150 rounded-2xl overflow-hidden shadow-sm bg-white hover:border-gray-200 transition">
                        
                        {/* Summary Header */}
                        <div className="bg-gray-50 border-b border-gray-100 px-5 py-4 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                            <div>
                              <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">Numéro</span>
                              <span className="text-gray-800 font-bold">#{o.order_number}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">Date</span>
                              <span className="text-gray-800 font-bold">{new Date(o.created_at).toLocaleDateString('fr-GN')}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${s.color}`}>
                              {s.label}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${o.payment_status === 'completed' ? 'bg-emerald-50 text-[#009460]' : 'bg-amber-50 text-amber-600'}`}>
                              {o.payment_status === 'completed' ? 'Payée' : 'Paiement en attente'}
                            </span>
                          </div>
                        </div>

                        {/* Visual Delivery Stepper timeline */}
                        <div className="px-5 py-6 border-b border-gray-50">
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block mb-2 text-left">Suivi de livraison visuel</span>
                          <DeliveryStepper currentStatus={o.status} />
                        </div>

                        {/* Order Items & Summary */}
                        <div className="p-5 space-y-4">
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 divide-y divide-gray-200/50 space-y-2.5">
                            {(o.items || []).map(item => (
                              <div key={item.id} className="flex items-center justify-between gap-4 text-xs pt-2.5 first:pt-0">
                                <div className="flex items-center gap-2">
                                  <img src={item.product_image || 'https://via.placeholder.com/40'} alt="" className="w-8 h-8 object-cover rounded-lg border border-gray-200" />
                                  <span className="font-bold text-gray-700">{item.product_name} <span className="text-gray-400 text-[10px]">×{item.quantity}</span></span>
                                </div>
                                <span className="font-black text-[#009460]">{formatPrice(item.total_price)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                            <div>
                              <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">Total facturé</span>
                              <strong className="text-sm font-black text-[#2B2D42]">{formatPrice(o.total_amount)}</strong>
                            </div>
                            
                            <button 
                              onClick={() => { setPage('chat'); showToast("Messagerie ouverte avec le vendeur."); }} 
                              className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 text-[11px] font-bold rounded-xl transition flex items-center gap-1 shadow-sm active:scale-95"
                            >
                              <MessageSquare size={13} />
                              <span>Contacter le vendeur</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Profile Editor ── */}
          {tab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#2B2D42]">Mon Profil</h2>
                <p className="text-xs text-gray-400 font-semibold mt-1">Gérez vos informations de livraison et de contact.</p>
              </div>

              {profileMsg && (
                <div className={`p-4 rounded-xl text-xs font-black border ${profileMsg.startsWith('✅') ? 'bg-emerald-50 border-emerald-100 text-[#009460]' : 'bg-rose-50 border-rose-100 text-[#E63946]'}`}>
                  {profileMsg}
                </div>
              )}

              <form onSubmit={saveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-gray-600">Nom complet *</label>
                    <div className="relative flex items-center">
                      <User size={16} className="absolute left-4 text-gray-400" />
                      <input 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-xs outline-none focus:bg-white focus:ring-4 focus:ring-[#009460]/10 focus:border-[#009460] transition font-semibold" 
                        required 
                        value={profileForm.name} 
                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-gray-600">Téléphone de livraison *</label>
                    <div className="relative flex items-center">
                      <Phone size={16} className="absolute left-4 text-gray-400" />
                      <input 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-xs outline-none focus:bg-white focus:ring-4 focus:ring-[#009460]/10 focus:border-[#009460] transition font-semibold" 
                        required 
                        placeholder="+224 6..." 
                        value={profileForm.phone} 
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400">Adresse e-mail (Non modifiable)</label>
                  <input 
                    className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-500 font-semibold cursor-not-allowed outline-none" 
                    disabled 
                    value={user.email} 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-600">Adresse de livraison (Quartier, Rue) *</label>
                  <div className="relative flex items-center">
                    <MapPin size={16} className="absolute left-4 text-gray-400" />
                    <input 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-xs outline-none focus:bg-white focus:ring-4 focus:ring-[#009460]/10 focus:border-[#009460] transition font-semibold" 
                      required 
                      placeholder="Ex: Kipé, face au centre commercial..." 
                      value={profileForm.address} 
                      onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-600">Ville principale *</label>
                  <select 
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:bg-white focus:ring-4 focus:ring-[#009460]/10 focus:border-[#009460] transition font-semibold" 
                    value={profileForm.city} 
                    onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                  >
                    {['Conakry', 'Kindia', 'Labé', 'Kankan', 'N\'Zérékoré', 'Mamou', 'Faranah', 'Boké'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button 
                    type="submit" 
                    className="px-6 py-3.5 bg-[#009460] hover:bg-[#007A33] text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    <Clipboard size={15} />
                    <span>Sauvegarder mon profil</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Tab: Private Messages Link ── */}
          {tab === 'messages' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#2B2D42]">Messagerie privée</h2>
                <p className="text-xs text-gray-400 font-semibold mt-1">Échangez en direct avec vos commerçants et posez vos questions.</p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4">
                <div className="text-4xl">💬</div>
                <h3 className="text-sm font-black text-[#2B2D42]">Messagerie Centralisée</h3>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                  Retrouvez toutes vos conversations avec les artisans et boutiques de Shop Guinée. Discutez de la livraison, des caractéristiques des produits ou négociez des commandes de groupe.
                </p>
                <button 
                  onClick={() => setPage('chat')} 
                  className="px-5 py-3.5 bg-[#009460] text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md hover:bg-[#007A33] active:scale-95 inline-flex items-center gap-1.5"
                >
                  <MessageSquare size={16} />
                  <span>Ouvrir la messagerie</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
