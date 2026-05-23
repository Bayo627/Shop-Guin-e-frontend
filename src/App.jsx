import React, { useState, useEffect } from 'react';
import { useAuth }  from './context/AuthContext.jsx';
import { useCart }  from './context/CartContext.jsx';
import { formatPrice, renderStars, api } from './api.js';
import { ShoppingCart, Search, User, Store, LogOut, Shield, ClipboardList,
         MessageSquare, LogIn, Menu, X, Bell, Heart, Globe, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock list of categories if API call is slow/fails
const STATIC_CATEGORIES = [
  { id: 1, name: 'Terroir & Alimentation', slug: 'terroir-alimentation', icon: '🌾' },
  { id: 2, name: 'Artisanat & Mode', slug: 'artisanat-mode', icon: '👜' },
  { id: 3, name: 'Tech & Électronique', slug: 'tech-electronique', icon: '📱' },
  { id: 4, name: 'Beauté & Santé', slug: 'beaute-sante', icon: '🧴' },
  { id: 5, name: 'Maison & Jardin', slug: 'maison-jardin', icon: '🏠' },
];

/* ──────────── NAVBAR / HEADER PREMIUM ──────────── */
const Navbar = ({ page, setPage, keyword, setKeyword, setCatFilter, showToast }) => {
  const { user, logout, isAuthenticated, isSeller, isAdmin } = useAuth();
  const { getCartItemsCount } = useCart();
  const [open, setOpen]   = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  
  // Custom states for interactive widgets
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState('FR');
  const [notifOpen, setNotifOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);
  
  const [categories, setCategories] = useState(STATIC_CATEGORIES);

  useEffect(() => {
    // Dynamic fetching of categories
    api.get('/categories')
      .then(d => {
        if (d && d.categories && d.categories.length > 0) {
          setCategories(d.categories);
        }
      })
      .catch(() => {}); // Fallback to static
  }, []);

  const go = (p) => {
    setPage(p);
    setOpen(false);
    setMobileMenu(false);
    setLangOpen(false);
    setNotifOpen(false);
    setFavOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    go('shop');
  };

  const handleCategoryClick = (slug) => {
    setCatFilter(slug);
    go('shop');
  };

  // Mock Notifications & Favorites
  const notifications = [
    { id: 1, text: '🎉 Bienvenue sur Shop Guinée !', date: 'À l\'instant' },
    { id: 2, text: '🔥 Offre flash : Miel du Fouta à -20%', date: 'Il y a 2h' },
    { id: 3, text: '📦 Commande #4829 expédiée avec succès.', date: 'Hier' }
  ];

  const mockFavorites = [
    { id: 1, name: 'Miel Pur du Fouta', price: 75000, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&q=80' },
    { id: 2, name: 'Tissu Lepy de Labé', price: 150000, img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&q=80' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm font-poppins border-b border-gray-100">
      {/* 1. Guinea Flag Bar */}
      <div className="h-[5px] w-full flex">
        <div className="h-full flex-1 bg-[#CE1126]"></div>
        <div className="h-full flex-1 bg-[#FCD116]"></div>
        <div className="h-full flex-1 bg-[#009460]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* 2. Main Header row */}
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <button className="flex items-center gap-2.5 transition active:scale-95" onClick={() => { setCatFilter(''); setKeyword(''); go('home'); }}>
            <div className="p-2 text-white bg-gradient-to-tr from-[#007A33] to-[#009460] rounded-xl shadow-md flex items-center justify-center">
              <Store size={22} className="animate-pulse" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#2B2D42]">
              Shop<span className="text-[#009460]">Guinée</span>
            </span>
          </button>

          {/* Search bar */}
          <form className="hidden md:flex flex-1 max-w-xl mx-8 relative items-center" onSubmit={handleSearch}>
            <div className="relative w-full group">
              <input
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#E63946] focus:ring-4 focus:ring-[#E63946]/10 transition outline-none text-sm text-[#2B2D42]"
                placeholder="Rechercher des produits, artisans, spécialités..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
              <button type="submit" className="absolute right-2 top-1.5 bottom-1.5 px-4 bg-[#E63946] hover:bg-[#C82935] text-white rounded-xl flex items-center justify-center transition shadow-md hover:shadow-glow-red">
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Language Selector 🌐 */}
            <div className="relative">
              <button 
                onClick={() => { setLangOpen(!langOpen); setNotifOpen(false); setFavOpen(false); setOpen(false); }}
                className="p-2.5 hover:bg-gray-50 rounded-xl transition text-[#2B2D42] flex items-center gap-1 text-sm font-semibold"
              >
                <Globe size={20} />
                <span className="hidden sm:inline text-xs">{lang}</span>
                <ChevronDown size={12} className="opacity-60" />
              </button>
              
              <AnimatePresence>
                {langOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 z-50"
                  >
                    {[
                      { code: 'FR', label: 'Français' },
                      { code: 'PU', label: 'Pular (🇬🇳)' },
                      { code: 'SO', label: 'Soussou (🇬🇳)' },
                      { code: 'MA', label: 'Malinké (🇬🇳)' }
                    ].map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangOpen(false); showToast(`Langue changée en : ${l.label}`); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#E63946] rounded-xl transition"
                      >
                        <span>{l.label}</span>
                        {lang === l.code && <Check size={14} className="text-[#009460]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications 🔔 */}
            <div className="relative">
              <button 
                onClick={() => { setNotifOpen(!notifOpen); setLangOpen(false); setFavOpen(false); setOpen(false); }}
                className="p-2.5 hover:bg-gray-50 rounded-xl transition text-[#2B2D42] relative"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#E63946] rounded-full border-2 border-white animate-bounce"></span>
              </button>
              
              <AnimatePresence>
                {notifOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 z-50"
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
                      <span className="font-bold text-sm text-[#2B2D42]">Notifications</span>
                      <button onClick={() => { setNotifOpen(false); showToast("Notifications marquées comme lues"); }} className="text-xs text-[#E63946] hover:underline font-semibold">Tout lire</button>
                    </div>
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="p-2.5 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition text-left cursor-pointer">
                          <p className="text-xs font-medium text-gray-800">{n.text}</p>
                          <span className="text-[10px] text-gray-400 mt-1 block">{n.date}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Favorites ❤️ */}
            <div className="relative">
              <button 
                onClick={() => { setFavOpen(!favOpen); setLangOpen(false); setNotifOpen(false); setOpen(false); }}
                className="p-2.5 hover:bg-gray-50 rounded-xl transition text-[#2B2D42] relative"
              >
                <Heart size={20} className="hover:text-[#E63946] transition-colors" />
                <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-[#009460] text-[9px] text-white rounded-full font-bold border border-white">2</span>
              </button>
              
              <AnimatePresence>
                {favOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 z-50"
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
                      <span className="font-bold text-sm text-[#2B2D42]">Coup de Coeur ❤️</span>
                      <button onClick={() => go('shop')} className="text-xs text-[#E63946] hover:underline font-semibold">Boutique</button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {mockFavorites.map(f => (
                        <div key={f.id} className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded-xl transition">
                          <img src={f.img} alt="" className="w-10 h-10 object-cover rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-gray-800 truncate">{f.name}</h4>
                            <span className="text-[11px] text-red-500 font-extrabold">{formatPrice(f.price)}</span>
                          </div>
                          <button onClick={() => { setFavOpen(false); showToast("Ajouté depuis vos favoris !"); }} className="text-[10px] bg-primary text-white px-2.5 py-1.5 rounded-lg font-bold hover:bg-primary-dark transition">Voir</button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart 🛒 */}
            <button className="p-2.5 hover:bg-gray-50 rounded-xl transition text-[#2B2D42] relative" onClick={() => go('cart')}>
              <div className="relative">
                <ShoppingCart size={20} />
                {getCartItemsCount() > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-3.5 -right-3.5 bg-[#E63946] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                  >
                    {getCartItemsCount()}
                  </motion.span>
                )}
              </div>
            </button>

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-2xl transition border border-gray-100" 
                  onClick={() => { setOpen(!open); setLangOpen(false); setNotifOpen(false); setFavOpen(false); }}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-gn-yellow to-amber-300 text-secondary-dark flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-xs font-bold text-[#2B2D42] pr-1">{user.name.split(' ')[0]}</span>
                </button>
                
                <AnimatePresence>
                  {open && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 z-50 font-poppins"
                    >
                      <div className="p-3 bg-gray-50 rounded-xl mb-2 text-left">
                        <strong className="text-sm text-[#2B2D42] block truncate">{user.name}</strong>
                        <span className="text-[10px] text-gray-500 block truncate">{user.email}</span>
                        <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white bg-[#009460]">
                          {user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Vendeur' : 'Acheteur'}
                        </span>
                      </div>
                      
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 rounded-xl transition text-left font-medium" onClick={() => go('buyer-dashboard')}>
                        <ClipboardList size={16} className="text-gray-400" /> Mes Commandes
                      </button>
                      
                      {isSeller && (
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 rounded-xl transition text-left font-medium" onClick={() => go('seller-dashboard')}>
                          <Store size={16} className="text-[#F4A261]" /> Tableau de Bord Vendeur
                        </button>
                      )}
                      
                      {isAdmin && (
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 rounded-xl transition text-left font-medium" onClick={() => go('admin')}>
                          <Shield size={16} className="text-[#E63946]" /> Administration
                        </button>
                      )}
                      
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 rounded-xl transition text-left font-medium" onClick={() => go('chat')}>
                        <MessageSquare size={16} className="text-gray-400" /> Messages Privés
                      </button>
                      
                      <hr className="my-2 border-gray-100" />
                      
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-red-500 hover:bg-red-50 rounded-xl transition text-left font-bold" onClick={() => { logout(); go('home'); showToast("Vous avez été déconnecté."); }}>
                        <LogOut size={16} /> Déconnexion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                className="flex items-center gap-2 bg-[#E63946] hover:bg-[#C82935] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition hover:shadow-glow-red active:scale-95" 
                onClick={() => go('login')}
              >
                <LogIn size={15}/> <span>Connexion</span>
              </button>
            )}

            {/* Mobile hamburger menu */}
            <button className="md:hidden p-2 hover:bg-gray-50 rounded-xl transition" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>
        </div>
        
        {/* 3. Sub-Navbar: Navigation of Categories (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 border-t border-gray-100 py-3 text-xs font-bold text-gray-600">
          <button onClick={() => { setCatFilter(''); go('shop'); }} className="hover:text-[#E63946] transition-colors relative py-1">
            Toutes les Offres
          </button>
          {categories.slice(0, 6).map(c => (
            <button
              key={c.id}
              onClick={() => handleCategoryClick(c.slug)}
              className="hover:text-[#E63946] transition-colors flex items-center gap-1.5 py-1"
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </button>
          ))}
          <button onClick={() => go('shop')} className="ml-auto text-[#009460] hover:text-[#007A33] transition-colors flex items-center gap-1">
            Voir Tout l'Artisanat ➜
          </button>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white px-6 py-4 z-40 overflow-hidden font-poppins"
          >
            {/* Search mobile */}
            <form className="relative items-center mb-4 flex" onSubmit={handleSearch}>
              <input
                className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#E63946] transition outline-none text-xs text-[#2B2D42]"
                placeholder="Rechercher des produits, artisans..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
              <button type="submit" className="absolute right-1 top-1 bottom-1 px-3 bg-[#E63946] text-white rounded-lg flex items-center justify-center transition">
                <Search size={14} />
              </button>
            </form>

            <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Catégories de Produits</span>
            <div className="flex flex-col gap-2.5 mb-4">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleCategoryClick(c.slug)}
                  className="flex items-center gap-3 text-left py-2 px-3 hover:bg-gray-50 rounded-xl transition text-xs font-semibold text-gray-700"
                >
                  <span className="text-sm">{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>

            <hr className="border-gray-100 my-4" />

            <div className="flex flex-col gap-2.5">
              <button onClick={() => go('shop')} className="w-full py-2.5 border border-gray-200 text-[#2B2D42] rounded-xl text-xs font-bold text-center hover:bg-gray-50 transition">
                Visiter la Boutique
              </button>
              {!isAuthenticated && (
                <button onClick={() => go('login')} className="w-full py-2.5 bg-[#E63946] text-white rounded-xl text-xs font-bold text-center hover:bg-primary-dark transition shadow-md">
                  Se Connecter
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

/* ──────────── FOOTER PREMIUM ──────────── */
const Footer = ({ setPage }) => (
  <footer className="bg-[#2B2D42] text-white pt-16 pb-8 border-t-8 border-[#009460] font-poppins mt-auto">
    <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
      {/* Col 1 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-[#009460] rounded-xl flex items-center justify-center">
            <Store size={18} />
          </div>
          <span className="text-lg font-black text-white">Shop<span className="text-[#009460]">Guinée</span></span>
        </div>
        <p className="text-gray-400 text-xs leading-relaxed mb-6">
          La marketplace N°1 en Guinée. Achetez et vendez vos articles et créations artisanales en toute sécurité via Orange Money, MTN MoMo et Virement Bancaire.
        </p>
        <div className="flex gap-3">
          <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#E63946] transition text-sm">f</a>
          <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#E63946] transition text-sm">t</a>
          <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#E63946] transition text-sm">in</a>
        </div>
      </div>

      {/* Col 2 */}
      <div>
        <h4 className="text-sm font-black uppercase tracking-wider text-white mb-4 border-l-4 border-[#FCD116] pl-2.5">Explorer</h4>
        <ul className="flex flex-col gap-2.5 text-xs text-gray-400 font-semibold">
          {[
            ['home', 'Accueil Principal'],
            ['shop', 'Toute la Boutique'],
            ['cart', 'Mon Panier d\'Achats'],
            ['buyer-dashboard', 'Tableau de Bord Acheteur'],
            ['seller-dashboard', 'Créer un Compte Vendeur']
          ].map(([p, l]) => (
            <li key={p}>
              <button onClick={() => setPage(p)} className="hover:text-[#E63946] transition">
                {l}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Col 3 */}
      <div>
        <h4 className="text-sm font-black uppercase tracking-wider text-white mb-4 border-l-4 border-[#FCD116] pl-2.5">Contact & Support</h4>
        <ul className="flex flex-col gap-3 text-xs text-gray-400 font-medium">
          <li>📞 +224 620 00 00 01</li>
          <li>✉️ support@shopguinee.gn</li>
          <li>📍 Kaloum, Conakry, République de Guinée</li>
          <li className="mt-2 text-xs font-bold text-gray-300 bg-white/5 p-2 rounded-lg border border-white/5">
            Support technique local disponible 7j/7.
          </li>
        </ul>
      </div>

      {/* Col 4 */}
      <div>
        <h4 className="text-sm font-black uppercase tracking-wider text-white mb-4 border-l-4 border-[#FCD116] pl-2.5">Moyens de Paiement</h4>
        <p className="text-gray-400 text-xs leading-relaxed mb-4">
          Paiements instantanés et transactions sécurisées par nos partenaires agréés en Guinée :
        </p>
        <div className="flex flex-wrap gap-2 text-[10px] font-black tracking-wide">
          <span className="bg-[#E63946] text-white px-3 py-1.5 rounded-lg uppercase shadow-sm">Orange Money</span>
          <span className="bg-[#FCD116] text-[#2B2D42] px-3 py-1.5 rounded-lg uppercase shadow-sm">MTN MoMo</span>
          <span className="bg-gray-700 text-white px-3 py-1.5 rounded-lg uppercase shadow-sm">Banque</span>
        </div>
      </div>
    </div>

    {/* Footer Bottom with Guinea Flag Repeat */}
    <div className="border-t border-white/5 pt-8 text-center text-xs text-gray-500 font-medium">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          © {new Date().getFullYear()} Shop Guinée — Tous droits réservés.
        </div>
        
        {/* Guinea Flag Horizontal Accent */}
        <div className="flex gap-1 h-2.5 w-16 rounded-full overflow-hidden">
          <div className="w-full bg-[#CE1126]"></div>
          <div className="w-full bg-[#FCD116]"></div>
          <div className="w-full bg-[#009460]"></div>
        </div>
        
        <div className="text-[10px] text-gray-600">
          Développé avec fierté pour l'Afrique guinéenne 🇬🇳
        </div>
      </div>
    </div>
  </footer>
);

/* ──────────── PRODUCT CARD PREMIUM ──────────── */
export const ProductCard = ({ product, setPage, setSelectedProduct, showToast }) => {
  const { addToCart } = useCart();
  const hasPromo = product.promo_price && product.promo_price < product.price;

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    addToCart({ ...product, id: product.id });
    if (showToast) {
      showToast(`🛒 ${product.name} ajouté au panier !`, 'success');
    }
  };

  return (
    <div className="group relative bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-hover hover:border-[#FCD116]/40 transition duration-300 flex flex-col font-poppins">
      
      {/* Badge Top Left */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 font-bold text-[9px] tracking-wide uppercase text-white">
        {hasPromo && (
          <span className="bg-[#E63946] px-2.5 py-1 rounded-full shadow-sm">
            Promo
          </span>
        )}
        {product.is_featured === 1 && (
          <span className="bg-[#FCD116] text-[#2B2D42] px-2.5 py-1 rounded-full shadow-sm">
            Vedette
          </span>
        )}
        {product.stock <= 3 && product.stock > 0 && product.type === 'physical' && (
          <span className="bg-[#F4A261] px-2.5 py-1 rounded-full shadow-sm animate-pulse">
            Reste {product.stock}
          </span>
        )}
      </div>

      {/* Image container with zoom */}
      <div 
        onClick={() => { setSelectedProduct(product); setPage('product'); }}
        className="h-56 overflow-hidden bg-gray-50 cursor-pointer relative"
      >
        <img
          src={product.main_image || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80'}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-108 transition duration-500"
          loading="lazy"
        />
        {/* Soft overlay on image hover */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition duration-300"></div>
      </div>

      {/* Product Details */}
      <div className="p-5 flex flex-col flex-1">
        <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1 block">
          {product.category_name || 'Artisanat'}
        </span>
        
        <h3 
          onClick={() => { setSelectedProduct(product); setPage('product'); }}
          className="text-[13px] font-bold text-[#2B2D42] hover:text-[#E63946] transition cursor-pointer mb-2 line-clamp-2 h-9 leading-relaxed"
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 text-[11px] text-amber-500 mb-4">
          <span className="font-semibold text-xs leading-none">{renderStars(product.avg_rating || 4.5)}</span>
          <span className="text-gray-400 text-[10px] font-medium mt-0.5">({product.total_reviews || 0})</span>
        </div>

        {/* Price & Add to Cart footer */}
        <div className="mt-auto border-t border-gray-50 pt-4 flex items-center justify-between gap-2 relative overflow-hidden">
          <div className="flex flex-col">
            {hasPromo ? (
              <>
                <span className="text-[15px] font-black text-[#E63946] leading-none">
                  {formatPrice(product.promo_price)}
                </span>
                <span className="text-[11px] text-gray-400 font-bold line-through mt-1">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-[15px] font-black text-[#2B2D42] leading-none">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Slide-in cart button on hover */}
          <div className="relative h-10 w-28 overflow-hidden rounded-xl">
            <button
              onClick={handleAddToCartClick}
              disabled={product.type === 'physical' && product.stock === 0}
              className={`w-full h-full text-xs font-black uppercase flex items-center justify-center gap-1.5 transition duration-300 shadow-sm border ${
                product.stock === 0 && product.type === 'physical'
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-tr from-[#E63946] to-[#ff5d6a] hover:from-[#C82935] hover:to-[#E63946] text-white border-transparent hover:shadow-glow-red md:translate-y-full md:group-hover:translate-y-0'
              }`}
            >
              {product.stock === 0 && product.type === 'physical' ? (
                'Rupture'
              ) : (
                <>
                  <ShoppingCart size={13} />
                  <span>Panier</span>
                </>
              )}
            </button>
            
            {/* Desktop-only secondary button indicator */}
            <span className="hidden md:flex absolute inset-0 items-center justify-center border border-gray-200 text-gray-600 rounded-xl text-xs font-extrabold group-hover:-translate-y-full transition-transform duration-300 pointer-events-none bg-white">
              + Ajouter
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};

/* ──────────── MAIN APP COMPONENT ──────────── */
export default function App() {
  const [page, setPage]              = useState('home');
  const [keyword, setKeyword]        = useState('');
  const [categoryFilter, setCatFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Custom Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Import dynamique des pages
  const pages = {
    home:             React.lazy(() => import('./pages/HomePage.jsx')),
    shop:             React.lazy(() => import('./pages/ShopPage.jsx')),
    product:          React.lazy(() => import('./pages/ProductDetailPage.jsx')),
    cart:             React.lazy(() => import('./pages/CartPage.jsx')),
    checkout:         React.lazy(() => import('./pages/CheckoutPage.jsx')),
    login:            React.lazy(() => import('./pages/LoginPage.jsx')),
    register:         React.lazy(() => import('./pages/RegisterPage.jsx')),
    'buyer-dashboard':React.lazy(() => import('./pages/BuyerDashboard.jsx')),
    'seller-dashboard':React.lazy(() => import('./pages/SellerDashboard.jsx')),
    admin:            React.lazy(() => import('./pages/AdminPanel.jsx')),
    chat:             React.lazy(() => import('./pages/ChatPage.jsx')),
  };

  const PageComponent = pages[page] || pages['home'];

  const pageProps = {
    setPage, 
    keyword, 
    setKeyword, 
    categoryFilter, 
    setCatFilter,
    selectedProduct, 
    setSelectedProduct,
    showToast, // Pass showToast to all pages
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#2B2D42] font-poppins antialiased selection:bg-[#E63946] selection:text-white">
      {/* Header with Flags & Search */}
      <Navbar 
        page={page} 
        setPage={setPage} 
        keyword={keyword} 
        setKeyword={setKeyword} 
        setCatFilter={setCatFilter}
        showToast={showToast}
      />
      
      {/* Active Page View wrapped in standard spacing */}
      <main className="flex-grow py-6 md:py-10">
        <React.Suspense fallback={
          <div className="fixed inset-0 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center z-50">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-[#E63946] border-r-[#FCD116] border-b-[#009460] animate-spin"></div>
            </div>
            <p className="mt-4 text-xs font-black text-gray-500 uppercase tracking-widest animate-pulse">Chargement de Shop Guinée…</p>
          </div>
        }>
          {/* Animated Page Transitions using Framer Motion */}
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <PageComponent {...pageProps} />
            </motion.div>
          </AnimatePresence>
        </React.Suspense>
      </main>

      {/* Premium Footer */}
      <Footer setPage={setPage} />

      {/* Global Animated Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3.5 px-5 py-4 rounded-2xl shadow-xl border text-xs font-extrabold max-w-sm ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-rose-50 border-rose-100 text-rose-800'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
              toast.type === 'success' ? 'bg-[#009460] text-white' : 'bg-[#E63946] text-white'
            }`}>
              {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            </div>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
