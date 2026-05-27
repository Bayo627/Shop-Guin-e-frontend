import React, { useState, useEffect } from 'react';
import { api, formatPrice } from '../api.js';
import {
  Store, Star, MapPin, Package, Search, ArrowRight,
  ShieldCheck, TrendingUp, Users, ChevronRight, X
} from 'lucide-react';

export default function VendorsPage({ setPage, setCatFilter, showToast }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const data = await api.get('/vendors/public');
      setVendors(data.vendors || []);
    } catch (err) {
      console.error('Erreur chargement vendeurs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(v =>
    v.store_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.seller_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.city?.toLowerCase().includes(search.toLowerCase())
  );

  const handleVisitStore = (vendor) => {
    // Navigate to shop page filtered by this vendor's products
    setCatFilter('');
    setPage('shop');
    // Store vendor filter info for the shop page
    localStorage.setItem('shop_vendor_filter', vendor.id);
    showToast(`🏪 Bienvenue chez ${vendor.store_name} !`, 'success');
  };

  // Color palette for vendor cards
  const cardStyles = [
    { bg: 'from-emerald-50 to-green-50', border: 'border-emerald-100', accent: 'text-[#009460]', badge: 'bg-emerald-100 text-[#009460]' },
    { bg: 'from-rose-50 to-pink-50', border: 'border-rose-100', accent: 'text-[#E63946]', badge: 'bg-rose-100 text-[#E63946]' },
    { bg: 'from-amber-50 to-yellow-50', border: 'border-amber-100', accent: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
    { bg: 'from-blue-50 to-indigo-50', border: 'border-blue-100', accent: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
    { bg: 'from-purple-50 to-violet-50', border: 'border-purple-100', accent: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
    { bg: 'from-cyan-50 to-teal-50', border: 'border-cyan-100', accent: 'text-cyan-600', badge: 'bg-cyan-100 text-cyan-700' },
  ];

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 font-poppins space-y-10 mb-20">

      {/* ── Header Section ── */}
      <div className="text-left space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase text-[#009460] tracking-widest">Annuaire des Boutiques</span>
            <h1 className="text-3xl md:text-4xl font-black text-[#2B2D42] mt-1 relative inline-block">
              🏪 Nos Vendeurs Vérifiés
              <span className="absolute bottom-[-6px] left-0 w-20 h-1 bg-gradient-to-r from-[#009460] to-[#FCD116] rounded-full"></span>
            </h1>
            <p className="text-xs text-gray-400 font-semibold mt-3 max-w-xl leading-relaxed">
              Explorez les boutiques de confiance sur Shop Guinée. Chaque vendeur est vérifié par notre équipe. Cliquez sur une boutique pour découvrir ses produits.
            </p>
          </div>

          <button
            onClick={() => setPage('shop')}
            className="px-5 py-2.5 bg-white border border-gray-200 text-[#2B2D42] hover:bg-gray-50 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 self-start shrink-0"
          >
            <Package size={15} />
            <span>Voir tous les produits</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-[#009460]/10 focus:border-[#009460] transition font-semibold text-[#2B2D42]"
            placeholder="Rechercher une boutique, un vendeur, une ville..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={14} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* ── Stats Banner ── */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-premium grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <ShieldCheck size={20} className="text-[#009460]" />
          </div>
          <div className="text-left">
            <span className="text-lg font-black text-[#2B2D42]">{vendors.length}</span>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Boutiques Vérifiées</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <Star size={20} className="text-amber-500" />
          </div>
          <div className="text-left">
            <span className="text-lg font-black text-[#2B2D42]">
              {vendors.length > 0 ? (vendors.reduce((s, v) => s + parseFloat(v.rating || 0), 0) / vendors.length).toFixed(1) : '0'}
            </span>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Note Moyenne</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <Package size={20} className="text-blue-600" />
          </div>
          <div className="text-left">
            <span className="text-lg font-black text-[#2B2D42]">
              {vendors.reduce((s, v) => s + (v.product_count || 0), 0)}
            </span>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Produits en Ligne</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
            <TrendingUp size={20} className="text-[#E63946]" />
          </div>
          <div className="text-left">
            <span className="text-lg font-black text-[#2B2D42]">100%</span>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Taux de Confiance</span>
          </div>
        </div>
      </div>

      {/* ── Vendors Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 bg-gray-50 border border-gray-100 rounded-[28px] animate-pulse"></div>
          ))}
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-premium space-y-4">
          <div className="text-5xl">🔍</div>
          <h3 className="text-lg font-black text-[#2B2D42]">Aucune boutique trouvée</h3>
          <p className="text-xs text-gray-400 font-semibold max-w-md mx-auto">
            {search
              ? `Aucun résultat pour "${search}". Essayez un autre mot-clé.`
              : 'Aucun vendeur vérifié pour le moment. Revenez bientôt !'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="px-5 py-2.5 bg-[#009460] text-white rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Voir toutes les boutiques
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor, index) => {
            const style = cardStyles[index % cardStyles.length];
            return (
              <div
                key={vendor.id}
                className={`group bg-gradient-to-br ${style.bg} border ${style.border} rounded-[28px] p-6 shadow-premium hover:shadow-premium-hover transition duration-300 relative overflow-hidden flex flex-col text-left`}
              >
                {/* Decorative circle */}
                <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/40 rounded-full group-hover:scale-125 transition duration-500"></div>
                <div className="absolute right-[10px] bottom-[40px] w-16 h-16 bg-white/20 rounded-full group-hover:scale-150 transition duration-700"></div>

                {/* Verified Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${style.badge} text-[8px] font-black uppercase tracking-wider rounded-full`}>
                    <ShieldCheck size={10} />
                    Vérifié
                  </span>
                </div>

                {/* Store Header */}
                <div className="flex items-center gap-4 relative z-10 mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-xl font-black ${style.accent} group-hover:scale-110 transition duration-300`}>
                    {vendor.store_logo_url ? (
                      <img src={vendor.store_logo_url} alt={vendor.store_name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      getInitials(vendor.store_name)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-[#2B2D42] truncate group-hover:text-[#E63946] transition-colors">
                      {vendor.store_name}
                    </h3>
                    <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1 mt-1">
                      <MapPin size={10} />
                      {vendor.city || 'Guinée'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                      par {vendor.seller_name}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed line-clamp-2 mb-4 relative z-10 flex-grow">
                  {vendor.store_description || 'Boutique officielle sur Shop Guinée. Découvrez nos produits de qualité.'}
                </p>

                {/* Stats Row */}
                <div className="flex items-center justify-between border-t border-white/60 pt-4 mb-4 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <Star size={14} className="fill-[#FCD116] text-[#FCD116]" />
                    <span className="text-xs font-black text-[#2B2D42]">
                      {parseFloat(vendor.rating || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Package size={12} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-500">
                      {vendor.product_count || 0} produit{(vendor.product_count || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleVisitStore(vendor)}
                  className="w-full py-3 bg-white hover:bg-[#E63946] hover:text-white border border-gray-200 hover:border-transparent rounded-xl text-xs font-black text-[#2B2D42] text-center transition duration-300 shadow-sm uppercase tracking-wider relative z-10 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Store size={14} />
                  <span>Visiter la boutique</span>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CTA Banner ── */}
      <div className="bg-gradient-to-r from-[#2B2D42] to-[#1A1C2C] text-white rounded-[32px] p-8 md:p-12 relative overflow-hidden shadow-xl text-left">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#009460] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        <div className="max-w-2xl space-y-4">
          <span className="px-3 py-1 bg-[#FCD116] text-[#2B2D42] text-[9px] font-black rounded-full uppercase tracking-wider">
            Devenez Vendeur 🇬🇳
          </span>
          <h3 className="text-xl md:text-3xl font-black leading-tight">
            Vous aussi, vendez sur Shop Guinée !
          </h3>
          <p className="text-xs text-gray-300 font-semibold leading-relaxed max-w-md">
            Rejoignez notre communauté de vendeurs vérifiés. Créez votre boutique gratuitement et atteignez des milliers de clients à travers toute la Guinée.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setPage('register')}
              className="px-6 py-3 bg-[#FCD116] hover:bg-[#cca400] text-[#2B2D42] font-black rounded-xl text-xs uppercase tracking-wider transition active:scale-95 shadow-md flex items-center gap-1.5"
            >
              <span>Créer ma boutique</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
