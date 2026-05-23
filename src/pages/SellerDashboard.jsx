import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api, formatPrice } from '../api.js';
import { Plus, Edit, Trash2, Package, BarChart2, Store, LogOut, CheckCircle, XCircle, Truck, DollarSign, Clock, HelpCircle } from 'lucide-react';

const STATUS_LABELS = { 
  pending: 'En attente', 
  confirmed: 'Confirmée', 
  processing: 'En préparation', 
  shipped: 'Expédiée', 
  delivered: 'Livrée', 
  cancelled: 'Annulée' 
};
const STATUS_NEXT = { 
  confirmed: 'processing', 
  processing: 'shipped', 
  shipped: 'delivered' 
};

export default function SellerDashboard({ setPage, showToast }) {
  const { user, logout, isSeller } = useAuth();
  const [tab, setTab]       = useState('stats');
  const [products, setProducts] = useState([]);
  const [orders, setOrders]   = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [msg, setMsg]         = useState('');

  const emptyForm = { 
    name: '', 
    category_id: '', 
    description: '', 
    short_desc: '', 
    price: '', 
    promo_price: '', 
    stock: '', 
    type: 'physical', 
    main_image: '', 
    file_url: '' 
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!user || !isSeller) { 
      setPage('login'); 
      return; 
    }
    loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, o, c] = await Promise.all([
        api.get('/products/my-products'),
        api.get('/orders/seller-orders'),
        api.get('/categories'),
      ]);
      setProducts(p.products || []);
      setOrders(o.orders || []);
      setCategories(c.categories || []);

      // Calculate stats locally
      const totalRevenue = (o.orders || [])
        .filter(ord => ord.payment_status === 'completed')
        .reduce((s, ord) => s + parseFloat(ord.total_amount), 0);
        
      setStats({
        products: (p.products || []).length,
        orders:   (o.orders || []).length,
        revenue:  totalRevenue,
        pending:  (o.orders || []).filter(ord => ord.status === 'pending').length,
      });
    } catch(e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
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
    } catch(err) { 
      setMsg('❌ ' + err.message); 
      showToast('❌ Erreur de sauvegarde.', 'error');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Supprimer ce produit définitivement ?')) return;
    try { 
      await api.delete(`/products/${id}`); 
      showToast('🗑️ Produit supprimé.', 'success');
      loadAll(); 
    } catch(err) { 
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
    } catch(err) { 
      alert(err.message); 
    }
  };

  if (!user || !isSeller) return null;

  return (
    <div className="container mx-auto px-4 md:px-6 font-poppins text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 my-8">
        <div>
          <span className="text-xs font-black uppercase text-[#009460] tracking-widest">Espace Vendeur</span>
          <h1 className="text-3xl font-black text-[#2B2D42] mt-1">🏪 Tableau de Bord Vendeur</h1>
        </div>
        <button 
          onClick={() => setPage('shop')} 
          className="px-5 py-2.5 bg-gray-150 border border-gray-200 text-[#2B2D42] hover:bg-gray-200 rounded-xl text-xs font-black uppercase tracking-wider transition self-start"
        >
          Visiter la boutique
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Panel */}
        <aside className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-premium h-fit space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FCD116] to-amber-300 text-secondary-dark flex items-center justify-center font-black text-xl shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <strong className="text-sm text-[#2B2D42] block truncate">{user.name}</strong>
              <span className="text-[10px] text-gray-400 block truncate mb-1.5">{user.email}</span>
              <span className="px-2 py-0.5 bg-[#009460] text-white text-[8px] font-black rounded-full uppercase tracking-wider">
                Vendeur Certifié
              </span>
            </div>
          </div>

          <ul className="flex flex-col gap-1.5">
            {[
              ['stats',    <BarChart2 size={18} />, 'Aperçu général'],
              ['products', <Package size={18} />,    'Mes Produits'],
              ['orders',   <Truck size={18} />,      'Commandes Reçues'],
              ['store',    <Store size={18} />,      'Ma Boutique'],
            ].map(([k, icon, label]) => (
              <li key={k}>
                <button 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-[#009460] transition cursor-pointer ${tab === k ? 'bg-emerald-50 text-[#009460]' : ''}`} 
                  onClick={() => { setTab(k); setShowForm(false); }}
                >
                  {icon} 
                  <span>{label}</span>
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

        {/* Content Panel */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-[28px] p-6 md:p-8 shadow-premium">
          
          {/* ── Tab: Statistics ── */}
          {tab === 'stats' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-black text-[#2B2D42]">Aperçu de votre activité</h2>
                <p className="text-xs text-gray-400 font-semibold mt-1">Suivez en temps réel l'évolution de vos ventes en Guinée.</p>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 bg-gray-100 rounded-2xl border border-gray-150"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1 */}
                  <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute right-3 top-3 p-1.5 bg-white text-[#009460] rounded-lg shadow-sm border border-emerald-50">
                      <Package size={16} />
                    </div>
                    <span className="text-3xl font-black text-[#009460]">{stats?.products || 0}</span>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Produits en ligne</span>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute right-3 top-3 p-1.5 bg-white text-blue-600 rounded-lg shadow-sm border border-blue-50">
                      <Truck size={16} />
                    </div>
                    <span className="text-3xl font-black text-blue-600">{stats?.orders || 0}</span>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Commandes reçues</span>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-[#FDF0F1] border border-red-100 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute right-3 top-3 p-1.5 bg-white text-[#E63946] rounded-lg shadow-sm border border-red-50">
                      <DollarSign size={16} />
                    </div>
                    <span className="text-xl font-black text-[#E63946] truncate mt-1">
                      {formatPrice(stats?.revenue || 0).split(' ')[0]} GNF
                    </span>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Revenus encaissés</span>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute right-3 top-3 p-1.5 bg-white text-amber-600 rounded-lg shadow-sm border border-amber-50">
                      <Clock size={16} />
                    </div>
                    <span className="text-3xl font-black text-amber-600">{stats?.pending || 0}</span>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">En attente</span>
                  </div>
                </div>
              )}

              {/* Tips Section */}
              <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-sm font-black text-[#2B2D42]">
                  <HelpCircle size={18} className="text-[#009460]" />
                  <h3>💡 Conseils pour augmenter vos ventes guinéennes</h3>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-500 pl-2 list-disc">
                  <li>✅ Rédigez des descriptions complètes et soignées de vos produits locaux.</li>
                  <li>✅ Ajoutez des images nettes et d'ambiance pour rassurer vos clients guinéens.</li>
                  <li>✅ Répondez promptement aux questions via la messagerie instantanée.</li>
                  <li>✅ Proposez des réductions (prix promo) pour attirer l'attention des acheteurs.</li>
                </ul>
              </div>
            </div>
          )}

          {/* ── Tab: Products Management ── */}
          {tab === 'products' && (
            <div className="space-y-6">
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

              {/* Product addition Form */}
              {showForm && (
                <div className="bg-gray-50 border border-gray-150 p-6 rounded-2xl space-y-6">
                  <h3 className="text-sm font-black text-[#2B2D42] border-b border-gray-200 pb-2">
                    {editProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
                  </h3>
                  <form onSubmit={saveProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-600">Nom du produit *</label>
                        <input 
                          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 focus:ring-[#E63946]/10 focus:border-[#E63946] transition" 
                          required 
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
                          <option value="">-- Choisir --</option>
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
                        value={form.description} 
                        onChange={e => set('description', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black text-gray-600">Description courte</label>
                      <input 
                        className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 focus:ring-[#E63946]/10 focus:border-[#E63946] transition" 
                        value={form.short_desc} 
                        onChange={e => set('short_desc', e.target.value)} 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-600">Prix normal (GNF) *</label>
                        <input 
                          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 focus:ring-[#E63946]/10 focus:border-[#E63946] transition" 
                          type="number" 
                          required 
                          value={form.price} 
                          onChange={e => set('price', e.target.value)} 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-600">Prix promotionnel (GNF)</label>
                        <input 
                          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 focus:ring-[#E63946]/10 focus:border-[#E63946] transition" 
                          type="number" 
                          value={form.promo_price} 
                          onChange={e => set('promo_price', e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-600">Type de produit</label>
                        <select 
                          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 focus:ring-[#E63946]/10 focus:border-[#E63946] transition" 
                          value={form.type} 
                          onChange={e => set('type', e.target.value)}
                        >
                          <option value="physical">📦 Produit physique</option>
                          <option value="digital">💾 Fichier numérique</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-600">Stock {form.type === 'digital' ? '(Illimité)' : ''}</label>
                        <input 
                          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 focus:ring-[#E63946]/10 focus:border-[#E63946] transition" 
                          type="number" 
                          value={form.stock} 
                          onChange={e => set('stock', e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black text-gray-600">URL image principale</label>
                      <input 
                        className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 focus:ring-[#E63946]/10 focus:border-[#E63946] transition" 
                        placeholder="https://images.unsplash.com/..." 
                        value={form.main_image} 
                        onChange={e => set('main_image', e.target.value)} 
                      />
                    </div>

                    {form.type === 'digital' && (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-600">URL du fichier numérique</label>
                        <input 
                          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 focus:ring-[#E63946]/10 focus:border-[#E63946] transition" 
                          placeholder="https://monespace/pdf.pdf" 
                          value={form.file_url} 
                          onChange={e => set('file_url', e.target.value)} 
                        />
                      </div>
                    )}

                    {form.main_image && (
                      <div className="pt-2">
                        <span className="text-[10px] font-black text-gray-400 block mb-1">Aperçu image :</span>
                        <img src={form.main_image} alt="Aperçu" className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                      <button 
                        type="submit" 
                        className="px-5 py-3 bg-[#009460] hover:bg-[#007A33] text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-md active:scale-95"
                      >
                        <CheckCircle size={15} />
                        <span>Enregistrer</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowForm(false)} 
                        className="px-5 py-3 bg-white border border-gray-200 text-[#2B2D42] hover:bg-gray-100 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95"
                      >
                        <XCircle size={15} />
                        <span>Annuler</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Product Listing Table */}
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center text-gray-400 font-semibold">
                  <span>📦 Vous n'avez aucun produit en ligne.</span>
                  <button onClick={openCreate} className="mt-4 px-4 py-2.5 bg-[#009460] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md block mx-auto">Créer mon premier produit</button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                        <th className="p-4">Détails Produit</th>
                        <th className="p-4">Catégorie</th>
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
                              <div className="min-w-0">
                                <strong className="text-gray-800 font-bold block truncate max-w-[180px]">{p.name}</strong>
                                <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider mt-0.5 block">{p.type === 'digital' ? '💾 Numérique' : '📦 Physique'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-500 font-semibold">{p.category_name}</td>
                          <td className="p-4">
                            <strong className="text-[#009460] font-black block">{formatPrice(p.promo_price || p.price)}</strong>
                            {p.promo_price && <span className="text-[10px] text-gray-400 line-through font-semibold">{formatPrice(p.price)}</span>}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase tracking-wider ${p.stock > 5 ? 'bg-emerald-50 text-[#009460]' : p.stock > 0 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-[#E63946]'}`}>
                              {p.type === 'digital' ? 'Illimité' : `${p.stock} pces`}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-gray-600">{p.total_sold || 0}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => openEdit(p)} 
                                className="p-2 text-blue-500 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition cursor-pointer"
                                title="Modifier"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={() => deleteProduct(p.id)} 
                                className="p-2 text-[#E63946] hover:bg-rose-50 border border-transparent hover:border-red-100 rounded-xl transition cursor-pointer"
                                title="Supprimer"
                              >
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

          {/* ── Tab: Orders Received ── */}
          {tab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#2B2D42]">Commandes Reçues ({orders.length})</h2>
                <p className="text-xs text-gray-400 font-semibold mt-1">Gérez et préparez les commandes achetées par vos clients.</p>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse border border-gray-100"></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center text-gray-400 font-semibold">
                  📋 Aucune commande reçue pour l'instant.
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {orders.map(o => (
                    <div key={o.id} className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-sm">
                      {/* Card Header */}
                      <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-[#2B2D42]">#{o.order_number}</span>
                          <span className="text-[10px] text-gray-400 font-semibold">{new Date(o.created_at).toLocaleDateString('fr-GN', { dateStyle: 'medium' })}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-wider">
                          <span className={`px-2.5 py-0.5 rounded-full ${o.payment_status === 'completed' ? 'bg-emerald-50 text-[#009460]' : 'bg-amber-50 text-amber-600'}`}>
                            {o.payment_status === 'completed' ? '💰 Payé Orange/MTN' : '⏳ En attente paiement'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                            {STATUS_LABELS[o.status] || o.status}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
                          <div>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-1">Acheteur</span>
                            <span className="text-gray-800 font-bold">{o.buyer_name}</span>
                            <span className="block text-gray-400 text-[10px] mt-0.5">📞 {o.buyer_phone}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-1">Destination</span>
                            <span className="text-gray-800 font-bold">{o.shipping_city}</span>
                            <span className="block text-gray-400 text-[10px] mt-0.5">📍 {o.shipping_address || 'Aucune adresse fournie'}</span>
                          </div>
                        </div>

                        {/* List items */}
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
                          {(o.items || []).map(item => (
                            <div key={item.id} className="flex items-center justify-between gap-4 text-xs">
                              <div className="flex items-center gap-2">
                                <img src={item.product_image || 'https://via.placeholder.com/40'} alt="" className="w-8 h-8 object-cover rounded-lg border border-gray-200" />
                                <span className="font-bold text-gray-700">{item.product_name} <span className="text-gray-400 text-[10px]">×{item.quantity}</span></span>
                              </div>
                              <span className="font-black text-[#009460]">{formatPrice(item.total_price)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Footer details & Action */}
                        <div className="border-t border-gray-50 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                          <div>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Montant Total Client</span>
                            <strong className="text-sm font-black text-[#2B2D42]">{formatPrice(o.total_amount)}</strong>
                          </div>
                          
                          {STATUS_NEXT[o.status] && (
                            <button 
                              onClick={() => advanceStatus(o.id, o.status)} 
                              className="px-4 py-2.5 bg-[#009460] hover:bg-[#007A33] text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-md active:scale-95 shrink-0 self-start sm:self-center"
                            >
                              <Truck size={15} />
                              <span>Marquer : {STATUS_LABELS[STATUS_NEXT[o.status]]}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Store Parameters ── */}
          {tab === 'store' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#2B2D42]">Paramètres de ma boutique</h2>
                <p className="text-xs text-gray-400 font-semibold mt-1">Configurez l'apparence et les coordonnées de votre stand public.</p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-tr from-[#FCD116] to-amber-300 rounded-2xl flex items-center justify-center shadow-md font-black text-3xl shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-2 min-w-0 flex-1">
                  <h3 className="text-base font-black text-gray-800 truncate">{user.store_name || `${user.name} Boutique`}</h3>
                  <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                    {user.store_description || 'Aucune description rédigée pour votre stand.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-black text-gray-400 uppercase pt-2">
                    <span>📞 Contact : {user.phone || 'Non renseigné'}</span>
                    <span>📍 Ville : {user.city || 'Non renseignée'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-[#009460] leading-relaxed">
                ℹ️ Pour modifier les informations d'identité commerciale (nom de boutique, description), rendez-vous dans les options de votre **Profil Acheteur / Compte central** ou contactez l'assistance technique.
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
