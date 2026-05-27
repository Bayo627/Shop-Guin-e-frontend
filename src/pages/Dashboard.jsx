import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api, formatPrice } from '../api.js';
import {
  Plus, Edit, Trash2, Package, BarChart2, Store, LogOut, CheckCircle,
  XCircle, Truck, DollarSign, Clock, HelpCircle, Eye, Save, ShoppingBag,
  Wallet, TrendingUp, ArrowRight, MessageSquare, AlertTriangle,
  CreditCard, FileText, RefreshCw, ChevronDown, ChevronUp, Image, Info, User, Phone, MapPin, Clipboard
} from 'lucide-react';

const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée'
};
const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-600 border-amber-100',
  confirmed: 'bg-blue-50 text-blue-600 border-blue-100',
  processing: 'bg-purple-50 text-purple-600 border-purple-100',
  shipped: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  delivered: 'bg-emerald-50 text-[#009460] border-emerald-100',
  cancelled: 'bg-rose-50 text-[#E63946] border-rose-100'
};
const STATUS_NEXT = {
  confirmed: 'processing',
  processing: 'shipped',
  shipped: 'delivered'
};
const PAYMENT_LABELS = {
  orange_money: '🟠 Orange Money',
  mtn_money: '🟡 MTN MoMo',
  bank_transfer: '🏦 Virement'
};

// STATUS_MAP pour le suivi de livraison acheteur
const STATUS_MAP = {
  pending:    { label: 'En attente',      color: 'bg-amber-50 text-amber-600 border-amber-100',     step: 1 },
  confirmed:  { label: 'Confirmée',       color: 'bg-blue-50 text-blue-600 border-blue-100',        step: 2 },
  processing: { label: 'En préparation',  color: 'bg-purple-50 text-purple-600 border-purple-100',  step: 3 },
  shipped:    { label: 'Expédiée',        color: 'bg-indigo-50 text-indigo-600 border-indigo-100',  step: 4 },
  delivered:  { label: 'Livrée ✅',       color: 'bg-emerald-50 text-[#009460] border-emerald-100', step: 5 },
  cancelled:  { label: 'Annulée ❌',      color: 'bg-rose-50 text-[#E63946] border-rose-100',       step: 0 },
};

const getMenuForRole = (role) => {
  const allMenu = [
    { key: 'stats', icon: <BarChart2 size={18} />, label: 'Aperçu Vendeur', roles: ['seller', 'admin'] },
    { key: 'purchases', icon: <ShoppingBag size={18} />, label: 'Mes Achats', roles: ['buyer', 'admin'] },
    { key: 'products', icon: <Package size={18} />, label: 'Mes Produits', roles: ['seller', 'admin'] },
    { key: 'orders', icon: <Truck size={18} />, label: 'Commandes Reçues', roles: ['seller', 'admin'] },
    { key: 'earnings', icon: <Wallet size={18} />, label: 'Mes Revenus', roles: ['seller', 'admin'] },
    { key: 'store', icon: <Store size={18} />, label: 'Ma Boutique', roles: ['seller', 'admin'] },
    { key: 'profile', icon: <User size={18} />, label: 'Mon Profil', roles: ['buyer', 'seller', 'admin'] },
  ];
  return allMenu.filter(m => m.roles.includes(role));
};

export default function Dashboard({ setPage, showToast }) {
  const { user, logout, updateProfile } = useAuth();
  
  const [tab, setTab] = useState(() => {
    const saved = localStorage.getItem('dash_tab');
    const validTabs = getMenuForRole(user?.role).map(m => m.key);
    if (saved && validTabs.includes(saved)) return saved;
    return user?.role === 'seller' ? 'stats' : 'purchases';
  });
  
  const [products, setProducts] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [earningsSummary, setEarningsSummary] = useState({ total: 0, pending: 0, completed: 0, commission_rate: 5 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [msg, setMsg] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderFilter, setOrderFilter] = useState('all');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [storeForm, setStoreForm] = useState({
    name: '', phone: '', city: '', address: '',
    store_name: '', store_description: ''
  });
  const [storeSaving, setStoreSaving] = useState(false);
  
  const [profileMsg, setProfileMsg] = useState('');

  const emptyForm = {
    name: '', category_id: '', description: '', short_desc: '',
    price: '', promo_price: '', stock: '', type: 'physical',
    main_image: '', file_url: ''
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!user) {
      setPage('login');
      return;
    }
    setStoreForm({
      name: user.name || '',
      phone: user.phone || '',
      city: user.city || 'Conakry',
      address: user.address || '',
      store_name: user.store_name || '',
      store_description: user.store_description || ''
    });
    loadAll();
  }, [user]);

  useEffect(() => {
    if (tab === 'products') {
      const openCreateFlag = localStorage.getItem('dash_open_create');
      if (openCreateFlag === 'true') {
        localStorage.removeItem('dash_open_create');
        const prefillCat = localStorage.getItem('dash_prefill_category');
        localStorage.removeItem('dash_prefill_category');
        
        setForm({
          ...emptyForm,
          category_id: prefillCat || ''
        });
        setEditProduct(null);
        setShowForm(true);
        setMsg('');
      }
    }
  }, [tab]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, oSeller, oBuyer, c, e] = await Promise.all([
        api.get('/products/my-products').catch(() => ({ products: [] })),
        api.get('/orders/seller-orders').catch(() => ({ orders: [] })),
        api.get('/orders/my-orders').catch(() => ({ orders: [] })),
        api.get('/categories').catch(() => ({ categories: [] })),
        api.get('/orders/seller-earnings').catch(() => ({ earnings: [], summary: { total: 0, pending: 0, completed: 0, commission_rate: 5 } })),
      ]);
      setProducts(p.products || []);
      setSellerOrders(oSeller.orders || []);
      setBuyerOrders(oBuyer.orders || []);
      setCategories(c.categories || []);
      setEarnings(e.earnings || []);
      setEarningsSummary(e.summary || { total: 0, pending: 0, completed: 0, commission_rate: 5 });

      // Si le vendeur a des produits, on le met sur l'aperçu par défaut (la première fois)
      if (p.products?.length > 0 && tab === 'purchases' && !localStorage.getItem('dash_tab')) {
        setTab('stats');
      }

      // Calculate stats locally
      const allOrders = oSeller.orders || [];
      const totalRevenue = allOrders
        .filter(ord => ord.payment_status === 'completed')
        .reduce((s, ord) => {
          const items = ord.items || [];
          return s + items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
        }, 0);

      setStats({
        products: (p.products || []).length,
        orders: allOrders.length,
        revenue: totalRevenue,
        pending: allOrders.filter(ord => ord.status === 'pending' || ord.status === 'confirmed').length,
        delivered: allOrders.filter(ord => ord.status === 'delivered').length,
        avgRating: (p.products || []).reduce((s, pr) => s + parseFloat(pr.avg_rating || 0), 0) / Math.max((p.products || []).length, 1),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (k) => {
    setTab(k);
    setShowForm(false);
    localStorage.setItem('dash_tab', k);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => {
    setForm(emptyForm);
    setEditProduct(null);
    setShowForm(true);
    setMsg('');
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      category_id: p.category_id,
      description: p.description,
      short_desc: p.short_desc || '',
      price: p.price,
      promo_price: p.promo_price || '',
      stock: p.stock,
      type: p.type,
      main_image: p.main_image || '',
      file_url: p.file_url || ''
    });
    setEditProduct(p);
    setShowForm(true);
    setMsg('');
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, form);
        showToast('✅ Produit mis à jour avec succès.', 'success');
      } else {
        await api.post('/products', form);
        showToast('✅ Produit créé avec succès !', 'success');
      }
      setShowForm(false);
      loadAll();
    } catch (err) {
      setMsg('❌ ' + err.message);
      showToast('❌ Erreur de sauvegarde.', 'error');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    setMsg('');
    try {
      const token = localStorage.getItem('sg_token');
      const res = await fetch('http://127.0.0.1:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors du téléchargement');
      
      setForm(f => ({ ...f, main_image: `http://127.0.0.1:5000${data.url}` }));
      showToast('📸 Image téléchargée avec succès !', 'success');
    } catch (err) {
      setMsg('❌ ' + err.message);
      showToast('❌ Erreur de téléchargement.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Supprimer ce produit définitivement ?')) return;
    try {
      await api.delete(`/products/${id}`);
      showToast('🗑️ Produit supprimé.', 'success');
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const advanceStatus = async (orderId, currentStatus) => {
    const next = STATUS_NEXT[currentStatus];
    if (!next) return;
    try {
      await api.put(`/orders/${orderId}/status`, { status: next });
      showToast('📦 Statut de la commande mis à jour !', 'success');
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const saveStoreSettings = async (e) => {
    e.preventDefault();
    setStoreSaving(true);
    setProfileMsg('');
    try {
      const res = await updateProfile(storeForm);
      if (res.success) {
        showToast('✅ Paramètres mis à jour !', 'success');
        setProfileMsg('✅ Vos informations ont été sauvegardées.');
      } else {
        showToast('❌ ' + (res.message || 'Erreur'), 'error');
        setProfileMsg('❌ ' + res.message);
      }
    } catch (err) {
      showToast('❌ Erreur réseau.', 'error');
    }
    setStoreSaving(false);
  };

  const downloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem('sg_token');
      const response = await fetch(`http://127.0.0.1:5000/api/orders/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Erreur lors du téléchargement de la facture');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast('❌ Impossible de télécharger la facture', 'error');
    }
  };

  const filteredOrders = orderFilter === 'all'
    ? sellerOrders
    : sellerOrders.filter(o => o.status === orderFilter);

  if (!user) return null;

  // Delivery step component for Buyer Tab
  const DeliveryStepper = ({ currentStatus }) => {
    const sInfo = STATUS_MAP[currentStatus] || { label: currentStatus };
    const stepNum = ['pending','confirmed','processing','shipped','delivered'].indexOf(currentStatus) + 1;
    
    if (currentStatus === 'cancelled') {
      return (
        <div className="bg-rose-50 border border-rose-100 text-[#E63946] px-4 py-2.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
          <span>❌ Cette commande a été annulée. Contactez le vendeur.</span>
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
                  isActive ? 'text-[#2B2D42]' : isCompleted ? 'text-[#009460]' : 'text-gray-400'
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
    <div className="container mx-auto px-4 md:px-6 font-poppins text-left mb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 my-8">
        <div>
          <span className="text-xs font-black uppercase text-[#009460] tracking-widest">Mon Compte</span>
          <h1 className="text-3xl font-black text-[#2B2D42] mt-1">👋 Bonjour, {user.name}</h1>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            Gérez vos achats et vos ventes depuis un seul endroit.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start">
          {user?.role === 'seller' && (
            <button
              onClick={() => { setTab('products'); openCreate(); }}
              className="px-4 py-2.5 bg-[#009460] hover:bg-[#007A33] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition active:scale-95"
            >
              <Plus size={16} />
              <span>Vendre un article</span>
            </button>
          )}
          {user?.role === 'buyer' && (
            <button
              onClick={() => setPage('shop')}
              className="px-4 py-2.5 bg-white border border-gray-200 text-[#2B2D42] hover:bg-gray-50 rounded-xl text-xs font-black uppercase tracking-wider transition"
            >
              Faire des achats
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ═══════ Sidebar Panel ═══════ */}
        <aside className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-premium h-fit space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FCD116] to-amber-300 text-secondary-dark flex items-center justify-center font-black text-xl shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <strong className="text-sm text-[#2B2D42] block truncate">{user.name}</strong>
              <span className="text-[10px] text-gray-400 block truncate mb-1.5">{user.email}</span>
              <span className="px-2 py-0.5 bg-[#009460] text-white text-[8px] font-black rounded-full uppercase tracking-wider">
                Utilisateur Vérifié
              </span>
            </div>
          </div>

          <ul className="flex flex-col gap-1.5">
            {getMenuForRole(user?.role).map(m => (
              <li key={m.key}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    tab === m.key 
                      ? 'bg-emerald-50 text-[#009460]' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-[#009460]'
                  }`}
                  onClick={() => handleTabChange(m.key)}
                >
                  {m.icon}
                  <span>{m.label}</span>
                  {m.key === 'orders' && stats?.pending > 0 && (
                    <span className="ml-auto bg-[#E63946] text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                      {stats.pending}
                    </span>
                  )}
                  {m.key === 'purchases' && buyerOrders.length > 0 && (
                    <span className="ml-auto bg-gray-100 text-gray-500 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                      {buyerOrders.length}
                    </span>
                  )}
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

        {/* ═══════ Content Panel ═══════ */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-[28px] p-6 md:p-8 shadow-premium min-h-[600px]">

          {/* ══════════════════════════════════════════════════
             TAB: PURCHASES (Acheteur)
             ══════════════════════════════════════════════════ */}
          {tab === 'purchases' && (
            <div className="space-y-6 fade-in">
              <div>
                <h2 className="text-xl font-black text-[#2B2D42]">Mes Achats ({buyerOrders.length})</h2>
                <p className="text-xs text-gray-400 font-semibold mt-1">Suivez en temps réel l'avancement et la livraison de vos colis.</p>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : buyerOrders.length === 0 ? (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center text-gray-400 font-semibold flex flex-col items-center gap-4">
                  <div className="text-4xl">🛍️</div>
                  <h3>Vous n'avez passé aucune commande.</h3>
                  <button onClick={() => setPage('shop')} className="px-5 py-2.5 bg-[#009460] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md">Commencer à explorer</button>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {buyerOrders.map(o => {
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
                              {o.payment_status === 'completed' ? 'Payée' : 'En attente'}
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
                            
                            <div className="flex gap-2">
                              <button 
                                onClick={() => downloadInvoice(o.id)} 
                                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-[#009460] text-[11px] font-bold rounded-xl transition flex items-center gap-1 shadow-sm active:scale-95"
                              >
                                <FileText size={13} />
                                <span>Facture</span>
                              </button>
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
             TAB: STATISTICS / APERÇU (Vendeur)
             ══════════════════════════════════════════════════ */}
          {tab === 'stats' && (
            <div className="space-y-8 fade-in">
              <div>
                <h2 className="text-xl font-black text-[#2B2D42]">Aperçu de votre boutique</h2>
                <p className="text-xs text-gray-400 font-semibold mt-1">Suivez en temps réel l'évolution de vos ventes en Guinée.</p>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 bg-gray-100 rounded-2xl border border-gray-150"></div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden hover:shadow-md transition">
                      <div className="absolute right-3 top-3 p-1.5 bg-white text-[#009460] rounded-lg shadow-sm border border-emerald-50">
                        <Package size={16} />
                      </div>
                      <span className="text-3xl font-black text-[#009460]">{stats?.products || 0}</span>
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Produits en ligne</span>
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden hover:shadow-md transition">
                      <div className="absolute right-3 top-3 p-1.5 bg-white text-blue-600 rounded-lg shadow-sm border border-blue-50">
                        <Truck size={16} />
                      </div>
                      <span className="text-3xl font-black text-blue-600">{stats?.orders || 0}</span>
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Commandes reçues</span>
                    </div>

                    <div className="bg-[#FDF0F1] border border-red-100 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden hover:shadow-md transition">
                      <div className="absolute right-3 top-3 p-1.5 bg-white text-[#E63946] rounded-lg shadow-sm border border-red-50">
                        <DollarSign size={16} />
                      </div>
                      <span className="text-xl font-black text-[#E63946] truncate mt-1">
                        {formatPrice(earningsSummary.completed || 0)}
                      </span>
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Revenus encaissés</span>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden hover:shadow-md transition">
                      <div className="absolute right-3 top-3 p-1.5 bg-white text-amber-600 rounded-lg shadow-sm border border-amber-50">
                        <Clock size={16} />
                      </div>
                      <span className="text-3xl font-black text-amber-600">{stats?.pending || 0}</span>
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">En attente</span>
                    </div>
                  </div>

                  {products.length === 0 && (
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-100 rounded-2xl p-8 text-center space-y-4">
                      <div className="text-4xl">🚀</div>
                      <h3 className="text-lg font-black text-[#009460]">Devenez vendeur sur Shop Guinée !</h3>
                      <p className="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed font-semibold">
                        Gagnez de l'argent en vendant vos propres produits à travers toute la Guinée. C'est simple, rapide et sécurisé.
                      </p>
                      <button
                        onClick={() => { setTab('products'); openCreate(); }}
                        className="px-6 py-3 bg-[#009460] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:bg-[#007A33] transition"
                      >
                        Ajouter mon premier produit
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
             TAB: PRODUCTS MANAGEMENT (Vendeur)
             ══════════════════════════════════════════════════ */}
          {tab === 'products' && (
            <div className="space-y-6 fade-in">
              <div className="flex items-center justify-between gap-4 border-b border-gray-50 pb-4">
                <div>
                  <h2 className="text-xl font-black text-[#2B2D42]">Mes Produits ({products.length})</h2>
                  <p className="text-xs text-gray-400 font-semibold mt-1">Créez et gérez vos offres d'artisanat, mode ou tech.</p>
                </div>
                {!showForm && (
                  <button
                    onClick={openCreate}
                    className="px-4 py-2.5 bg-[#E63946] hover:bg-[#C82935] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition hover:shadow-glow-red active:scale-95"
                  >
                    <Plus size={16} />
                    <span>Nouveau produit</span>
                  </button>
                )}
              </div>

              {msg && (
                <div className={`p-4 rounded-xl text-xs font-black border ${msg.startsWith('✅') ? 'bg-emerald-50 border-emerald-100 text-[#009460]' : 'bg-rose-50 border-rose-100 text-[#E63946]'}`}>
                  {msg}
                </div>
              )}

              {/* Product addition/edit Form */}
              {showForm && (
                <div className="bg-gray-50 border border-gray-150 p-6 rounded-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-[#2B2D42] border-b border-gray-200 pb-2">
                      {editProduct ? '✏️ Modifier le produit' : '➕ Ajouter un nouveau produit'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="p-2 hover:bg-gray-200 rounded-xl transition"
                    >
                      <XCircle size={18} className="text-gray-400" />
                    </button>
                  </div>
                  <form onSubmit={saveProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-600">Nom du produit *</label>
                        <input
                          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 focus:ring-[#E63946]/10 focus:border-[#E63946] transition"
                          required
                          placeholder="Ex: iPhone 14 Pro Max"
                          value={form.name}
                          onChange={e => set('name', e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-600">Catégorie *</label>
                        <select
                          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 focus:ring-[#E63946]/10 focus:border-[#E63946] transition"
                          required
                          value={form.category_id}
                          onChange={e => set('category_id', e.target.value)}
                        >
                          <option value="">-- Choisir une catégorie --</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black text-gray-600">Description longue *</label>
                      <textarea
                        className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 focus:ring-[#E63946]/10 focus:border-[#E63946] transition"
                        rows="4"
                        required
                        placeholder="Décrivez votre produit en détail : matériaux, dimensions, couleurs, provenance..."
                        value={form.description}
                        onChange={e => set('description', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-600">Prix normal (GNF) *</label>
                        <input
                          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 focus:ring-[#E63946]/10 focus:border-[#E63946] transition"
                          type="number"
                          min="0"
                          required
                          placeholder="Ex: 150000"
                          value={form.price}
                          onChange={e => set('price', e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-600">Quantité en stock *</label>
                        <input
                          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 focus:ring-[#E63946]/10 focus:border-[#E63946] transition"
                          type="number"
                          min="0"
                          placeholder="Ex: 25"
                          value={form.stock}
                          onChange={e => set('stock', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black text-gray-600 flex items-center gap-2">
                        <Image size={14} /> Image principale
                      </label>
                      <div className="flex flex-col gap-3">
                        {form.main_image && (
                          <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                            <img src={form.main_image} alt="Aperçu" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex flex-col gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition">
                          <label className="text-xs font-semibold text-gray-500 cursor-pointer text-center">
                            {uploadingImage ? '⏳ Téléchargement en cours...' : 'Cliquez ici pour choisir une image (JPG, PNG, WEBP)'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold my-1">
                           <div className="flex-1 h-px bg-gray-200"></div>
                           <span>OU SAISISSEZ UNE URL</span>
                           <div className="flex-1 h-px bg-gray-200"></div>
                        </div>
                        <input
                          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 focus:ring-[#E63946]/10 focus:border-[#E63946] transition"
                          placeholder="https://images.unsplash.com/..."
                          value={form.main_image}
                          onChange={e => set('main_image', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        className="px-5 py-3 bg-[#009460] hover:bg-[#007A33] text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-md active:scale-95"
                      >
                        <CheckCircle size={15} />
                        <span>{editProduct ? 'Mettre à jour' : 'Publier le produit'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-5 py-3 bg-white border border-gray-200 text-[#2B2D42] hover:bg-gray-100 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95"
                      >
                        <span>Annuler</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Product Listing Table */}
              {!showForm && !loading && products.length === 0 && (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center text-gray-400 font-semibold space-y-4">
                  <div className="text-5xl">📦</div>
                  <p>Vous n'avez aucun produit en ligne.</p>
                  <button onClick={openCreate} className="mt-2 px-5 py-3 bg-[#009460] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md inline-flex items-center gap-1.5">
                    <Plus size={15} /> Créer mon premier produit
                  </button>
                </div>
              )}

              {!showForm && products.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                        <th className="p-4">Détails Produit</th>
                        <th className="p-4">Prix</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Ventes</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={p.main_image || 'https://via.placeholder.com/48?text=P'} alt="" className="w-11 h-11 object-cover rounded-xl border border-gray-100 shadow-sm shrink-0" />
                              <strong className="text-gray-800 font-bold block truncate max-w-[180px]">{p.name}</strong>
                            </div>
                          </td>
                          <td className="p-4 font-black text-[#009460]">{formatPrice(p.price)}</td>
                          <td className="p-4 font-semibold">{p.stock}</td>
                          <td className="p-4 font-bold text-gray-600">{p.total_sold || 0}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => openEdit(p)} className="p-2 text-blue-500 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition cursor-pointer">
                                <Edit size={14} />
                              </button>
                              <button onClick={() => deleteProduct(p.id)} className="p-2 text-[#E63946] hover:bg-rose-50 border border-transparent hover:border-red-100 rounded-xl transition cursor-pointer">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
             TAB: ORDERS RECEIVED (Vendeur)
             ══════════════════════════════════════════════════ */}
          {tab === 'orders' && (
            <div className="space-y-6 fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-[#2B2D42]">Commandes Reçues ({sellerOrders.length})</h2>
                  <p className="text-xs text-gray-400 font-semibold mt-1">Gérez et préparez les commandes de vos clients.</p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  <div className="h-32 bg-gray-50 rounded-2xl animate-pulse"></div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center text-gray-400 font-semibold space-y-2">
                  <div className="text-4xl">📋</div>
                  <p>Aucune commande reçue pour l'instant.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {filteredOrders.map(o => (
                    <div key={o.id} className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition">
                      <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-[#2B2D42]">#{o.order_number}</span>
                          <span className="text-[10px] text-gray-400 font-semibold">{new Date(o.created_at).toLocaleDateString('fr-GN')}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-wider">
                          <span className={`px-2.5 py-0.5 rounded-full ${o.payment_status === 'completed' ? 'bg-emerald-50 text-[#009460]' : 'bg-amber-50 text-amber-600'}`}>
                            {o.payment_status === 'completed' ? '💰 Payé' : '⏳ Paiement en attente'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[o.status] || 'bg-gray-50 text-gray-500'}`}>
                            {STATUS_LABELS[o.status] || o.status}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
                          <div>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-1">👤 Acheteur</span>
                            <span className="text-gray-800 font-bold">{o.buyer_name}</span>
                            {o.buyer_phone && <span className="block text-gray-400 text-[10px] mt-0.5">📞 {o.buyer_phone}</span>}
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-1">📍 Destination</span>
                            <span className="text-gray-800 font-bold">{o.shipping_city}</span>
                            <span className="block text-gray-400 text-[10px] mt-0.5">{o.shipping_address || 'Aucune adresse'}</span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
                          {(o.items || []).map(item => (
                            <div key={item.id} className="flex items-center justify-between gap-4 text-xs">
                              <span className="font-bold text-gray-700">{item.product_name} <span className="text-gray-400 text-[10px]">×{item.quantity}</span></span>
                              <span className="font-black text-[#009460]">{formatPrice(item.total_price)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-gray-50 pt-4 flex items-center justify-between mt-2">
                          <div>
                            <strong className="text-sm font-black text-[#2B2D42]">{formatPrice(o.total_amount)}</strong>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => downloadInvoice(o.id)} 
                              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-[#009460] text-[11px] font-bold rounded-xl transition flex items-center gap-1 shadow-sm active:scale-95"
                            >
                              <FileText size={13} />
                            </button>
                            {STATUS_NEXT[o.status] && (
                              <button onClick={() => advanceStatus(o.id, o.status)} className="px-4 py-2 bg-[#009460] hover:bg-[#007A33] text-white rounded-xl text-xs font-black uppercase tracking-wider transition">
                                → {STATUS_LABELS[STATUS_NEXT[o.status]]}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
             TAB: EARNINGS (Vendeur)
             ══════════════════════════════════════════════════ */}
          {tab === 'earnings' && (
            <div className="space-y-6 fade-in">
              <div>
                <h2 className="text-xl font-black text-[#2B2D42]">💰 Mes Revenus</h2>
                <p className="text-xs text-gray-400 font-semibold mt-1">
                  Suivez vos gains, commissions et paiements reçus.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-emerald-50/70 border border-emerald-100 p-5 rounded-2xl">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Revenus encaissés</span>
                  <span className="text-xl font-black text-[#009460] block mt-1">{formatPrice(earningsSummary.completed)}</span>
                </div>
                <div className="bg-amber-50/70 border border-amber-100 p-5 rounded-2xl">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">En attente de paiement</span>
                  <span className="text-xl font-black text-amber-600 block mt-1">{formatPrice(earningsSummary.pending)}</span>
                </div>
              </div>

              {earnings.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-2xl text-center text-gray-400 font-semibold text-xs">
                  Aucune transaction enregistrée.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                        <th className="p-4">Commande</th>
                        <th className="p-4">Net vendeur</th>
                        <th className="p-4">Paiement</th>
                        <th className="p-4">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {earnings.map(e => (
                        <tr key={e.order_id} className="hover:bg-gray-50 transition">
                          <td className="p-4 font-bold">#{e.order_number}</td>
                          <td className="p-4 font-black text-[#009460]">{formatPrice(e.net_amount)}</td>
                          <td className="p-4 text-[10px] font-bold text-gray-500">{PAYMENT_LABELS[e.payment_method] || e.payment_method}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase ${e.payment_status === 'completed' ? 'bg-emerald-50 text-[#009460]' : 'bg-amber-50 text-amber-600'}`}>
                              {e.payment_status === 'completed' ? '✅ Encaissé' : '⏳ En attente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
             TAB: STORE / BOUTIQUE
             ══════════════════════════════════════════════════ */}
          {tab === 'store' && (
            <div className="space-y-6 fade-in">
              <div>
                <h2 className="text-xl font-black text-[#2B2D42]">🏪 Ma Boutique</h2>
                <p className="text-xs text-gray-400 font-semibold mt-1">Personnalisez votre vitrine pour les acheteurs.</p>
              </div>

              <form onSubmit={saveStoreSettings} className="space-y-5 bg-gray-50 border border-gray-100 rounded-2xl p-6">
                {profileMsg && <div className="text-xs font-black p-3 bg-white rounded-xl shadow-sm text-center text-[#009460]">{profileMsg}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-gray-600">Nom de la boutique</label>
                    <input className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none" placeholder="Ex: Ma Boutique" value={storeForm.store_name} onChange={e => setStoreForm({ ...storeForm, store_name: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-gray-600">Téléphone pro</label>
                    <input className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none" value={storeForm.phone} onChange={e => setStoreForm({ ...storeForm, phone: e.target.value })} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-600">Description</label>
                  <textarea className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none" rows="3" value={storeForm.store_description} onChange={e => setStoreForm({ ...storeForm, store_description: e.target.value })} />
                </div>

                <button type="submit" disabled={storeSaving} className="px-6 py-3 bg-[#009460] text-white rounded-xl text-xs font-black uppercase shadow-md flex items-center gap-1.5 disabled:opacity-50 mt-4">
                  <Save size={15} /> <span>Sauvegarder</span>
                </button>
              </form>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
             TAB: PROFILE / COMPTE
             ══════════════════════════════════════════════════ */}
          {tab === 'profile' && (
            <div className="space-y-6 fade-in">
              <div>
                <h2 className="text-xl font-black text-[#2B2D42]">Mon Profil Utilisateur</h2>
                <p className="text-xs text-gray-400 font-semibold mt-1">Gérez vos informations de livraison et de contact.</p>
              </div>

              {profileMsg && <div className={`p-4 rounded-xl text-xs font-black border ${profileMsg.startsWith('✅') ? 'bg-emerald-50 border-emerald-100 text-[#009460]' : 'bg-rose-50 border-rose-100 text-[#E63946]'}`}>{profileMsg}</div>}

              <form onSubmit={saveStoreSettings} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-gray-600">Nom complet *</label>
                    <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none" required value={storeForm.name} onChange={e => setStoreForm({ ...storeForm, name: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-gray-400">Email</label>
                    <input className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-500 cursor-not-allowed" disabled value={user.email} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-600">Adresse de livraison (Quartier, Rue) *</label>
                  <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none" required value={storeForm.address} onChange={e => setStoreForm({ ...storeForm, address: e.target.value })} />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-600">Ville principale *</label>
                  <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none" value={storeForm.city} onChange={e => setStoreForm({ ...storeForm, city: e.target.value })}>
                    {['Conakry', 'Kindia', 'Labé', 'Kankan', 'N\'Zérékoré', 'Mamou', 'Faranah', 'Boké'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button type="submit" className="px-6 py-3.5 bg-[#009460] text-white rounded-xl text-xs font-black uppercase shadow-md flex items-center gap-1.5">
                    <Clipboard size={15} /> <span>Sauvegarder mon profil</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
