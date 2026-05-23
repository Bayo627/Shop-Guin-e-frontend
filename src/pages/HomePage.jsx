import React, { useState, useEffect } from 'react';
import { api, formatPrice, renderStars } from '../api.js';
import { ProductCard } from '../App.jsx';
import { ChevronRight, Zap, Shield, Truck, HeadphonesIcon, Store, Star, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const HERO_SLIDES = [
  {
    bg: 'linear-gradient(135deg, #005021 0%, #007A33 50%, #0fa84a 100%)',
    tag: '🌾 100% NATUREL & ARTISANAL',
    title: 'Le Meilleur du Terroir Guinéen',
    sub: 'Miel pur du Fouta, café de Ziama, tissus Lepy et artisanat de Boffa livrés chez vous en toute sécurité.',
    cta: 'Acheter local',
    secondaryCta: 'En savoir plus',
    img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80',
  },
  {
    bg: 'linear-gradient(135deg, #7c1a00 0%, #E63946 50%, #ff5d6a 100%)',
    tag: '📱 HAUTE TECHNOLOGIE & GARANTIE',
    title: 'Tech & Électronique de Pointe',
    sub: 'Commandez vos smartphones, ordinateurs et TV de grandes marques avec garantie et livraison rapide à Conakry.',
    cta: 'Découvrir les offres',
    secondaryCta: 'Nos vendeurs tech',
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
  },
  {
    bg: 'linear-gradient(135deg, #2B2D42 0%, #3a3d56 50%, #4e5272 100%)',
    tag: '👜 MODE & CRÉATIONS AUTHENTIQUES',
    title: 'Mode Guinéenne & Accessoires',
    sub: 'Soyez élégant avec nos bazins brodés, tissus traditionnels Lepy, Kendeli et sacs d\'artisanat local chic.',
    cta: 'Voir la mode',
    secondaryCta: 'Vendre mes designs',
    img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
  },
];

const FEATURES = [
  { icon: <Truck className="text-[#009460]" size={24} />, title: 'Livraison Rapide', desc: 'Conakry & préfectures' },
  { icon: <Shield className="text-[#E63946]" size={24} />, title: 'Paiement Sécurisé', desc: 'OM, MTN MoMo & Virement' },
  { icon: <Zap className="text-[#F4A261]" size={24} />, title: 'Garantie Vendeur', desc: 'Boutiques locales vérifiées' },
  { icon: <HeadphonesIcon className="text-blue-500" size={24} />, title: 'Support Réactif', desc: '+224 620 00 00 01' },
];

export default function HomePage({ setPage, setSelectedProduct, setCatFilter, setKeyword, showToast }) {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured]   = useState([]);
  const [recent, setRecent]       = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading]     = useState(true);

  // Dynamic Popular Sellers
  const popularSellers = [
    { id: 1, name: 'Fouta Terroir Bio', city: 'Labé', rating: 4.9, count: 87, img: '🌾', tags: ['Miel', 'Café'] },
    { id: 2, name: 'Conakry HighTech', city: 'Kaloum', rating: 4.8, count: 142, img: '⚡', tags: ['PC', 'Mobiles'] },
    { id: 3, name: 'Lepy Art & Design', city: 'Boké', rating: 4.9, count: 53, img: '👜', tags: ['Mode', 'Lepy'] },
  ];

  useEffect(() => {
    (async () => {
      try {
        const [cats, feat, rec, best] = await Promise.all([
          api.get('/categories'),
          api.get('/products?featured=1&limit=4'),
          api.get('/products?sortBy=created_at&order=DESC&limit=4'),
          api.get('/products?sortBy=total_sold&order=DESC&limit=4'),
        ]);
        setCategories(cats.categories || []);
        setFeatured(feat.products || []);
        setRecent(rec.products || []);
        setBestSellers(best.products || []);
      } catch (e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      }
    })();
  }, []);

  const goCategory = (slug) => { 
    setCatFilter(slug); 
    setPage('shop'); 
  };

  // Skeleton Card component
  const SkeletonCard = () => (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 flex flex-col gap-4 animate-pulse">
      <div className="h-44 w-full bg-gray-200 rounded-2xl"></div>
      <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
      <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
      <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
      <div className="flex justify-between items-center mt-4">
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-16 font-poppins">
      
      {/* ── HERO BANNER WITH SWIPER & FRAMER MOTION ── */}
      <section className="relative overflow-hidden rounded-[32px] mx-4 md:mx-6 shadow-xl">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          effect={'fade'}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          pagination={{ clickable: true, el: '.swiper-custom-pagination' }}
          navigation
          loop={true}
          className="h-[500px] md:h-[600px] w-full"
        >
          {HERO_SLIDES.map((slide, index) => (
            <SwiperSlide key={index}>
              <div 
                className="w-full h-full flex items-center justify-between px-6 md:px-16 text-white relative"
                style={{ background: slide.bg }}
              >
                {/* Visual patterns inside Hero */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                <div className="max-w-2xl space-y-6 z-10 text-left">
                  <motion.span 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black tracking-widest uppercase"
                  >
                    {slide.tag}
                  </motion.span>
                  
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl md:text-6xl font-black tracking-tight leading-tight whitespace-pre-line"
                  >
                    {slide.title}
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm md:text-base text-white/80 font-medium max-w-lg leading-relaxed"
                  >
                    {slide.sub}
                  </motion.p>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-wrap gap-4 pt-4"
                  >
                    <button 
                      className="px-6 py-3.5 bg-[#FCD116] hover:bg-[#cca400] text-[#2B2D42] font-black rounded-2xl shadow-lg transition active:scale-95 text-xs uppercase tracking-wider flex items-center gap-2 hover:shadow-glow-yellow"
                      onClick={() => setPage('shop')}
                    >
                      <span>{slide.cta}</span>
                      <ChevronRight size={16} />
                    </button>
                    <button 
                      className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-bold transition active:scale-95 text-xs uppercase"
                      onClick={() => setPage('register')}
                    >
                      {slide.secondaryCta}
                    </button>
                  </motion.div>
                </div>
                
                {/* Slide image on right */}
                <div className="hidden lg:block w-[400px] h-[400px] rounded-3xl overflow-hidden shadow-2xl relative z-10 border-4 border-white/10 shrink-0 transform rotate-2 hover:rotate-0 transition-transform duration-500 mr-8">
                  <img src={slide.img} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          
          {/* Swiper Pagination */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 swiper-custom-pagination flex gap-2"></div>
        </Swiper>
      </section>

      {/* ── FEATURES BAR ── */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-premium grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex items-start gap-4 p-2 hover:bg-gray-50 rounded-2xl transition duration-300">
              <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shrink-0">
                {f.icon}
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-[#2B2D42]">{f.title}</h4>
                <p className="text-xs text-gray-400 font-semibold mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATÉGORIES EN GRILLE CARDS ATTRACTIVES ── */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 text-left">
          <div>
            <span className="text-xs font-black uppercase text-[#009460] tracking-widest">Grand Marché</span>
            <h2 className="text-2xl md:text-3xl font-black text-[#2B2D42] mt-1 relative inline-block">
              Parcourir par Catégorie
              <span className="absolute bottom-[-6px] left-0 w-16 h-1 bg-gradient-to-r from-[#009460] to-[#FCD116] rounded-full"></span>
            </h2>
          </div>
          <button 
            className="text-xs font-black text-[#E63946] hover:underline flex items-center gap-1 mt-4 sm:mt-0 uppercase tracking-wider" 
            onClick={() => setPage('shop')}
          >
            <span>Voir tout le marché</span>
            <ArrowUpRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 border border-gray-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((cat, index) => {
              // Custom bg and colors for categories
              const styleClasses = [
                'bg-emerald-50/60 border-emerald-100/60 text-[#009460]',
                'bg-rose-50/60 border-rose-100/60 text-[#E63946]',
                'bg-amber-50/60 border-amber-100/60 text-[#F4A261]',
                'bg-blue-50/60 border-blue-100/60 text-blue-600',
                'bg-purple-50/60 border-purple-100/60 text-purple-600'
              ][index % 5];

              return (
                <button
                  key={cat.id}
                  onClick={() => goCategory(cat.slug)}
                  className={`group border rounded-[28px] p-6 text-left transition duration-300 transform hover:-translate-y-2 hover:shadow-lg flex flex-col items-start gap-4 cursor-pointer relative overflow-hidden ${styleClasses}`}
                >
                  {/* Category icon backdrop effect */}
                  <div className="absolute right-[-10px] bottom-[-10px] text-6xl opacity-10 transform -rotate-12 group-hover:scale-125 transition duration-300">
                    {cat.icon || '📦'}
                  </div>
                  
                  <div className="p-3 bg-white rounded-xl shadow-sm text-2xl flex items-center justify-center group-hover:rotate-12 transition">
                    {cat.icon || '📦'}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-black tracking-tight leading-snug group-hover:underline">
                      {cat.name}
                    </h3>
                    <span className="text-[10px] font-bold text-gray-500 mt-1 block">
                      {cat.product_count || 0} articles
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ── BANNIÈRE PROMOTOIONNELLE INTERCALÉE STYLE ALIBABA ── */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-[#2B2D42] to-[#1A1C2C] text-white p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-b-8 border-[#FCD116] text-left">
          {/* Subtle decoration */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#E63946] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
          
          <div className="space-y-4 max-w-xl">
            <span className="px-3 py-1 bg-[#009460] text-white text-[9px] font-black rounded-full uppercase tracking-wider">
              Exclusivité Shop Guinée 🇬🇳
            </span>
            <h3 className="text-2xl md:text-4xl font-black leading-tight">
              Artisanat d'Excellence & Créations Paysannes
            </h3>
            <p className="text-xs text-gray-300 font-semibold leading-relaxed">
              Soutenez directement les artisans locaux. Miel brut, beurre de karité bio, tissus précieux et sculptures livrés directement depuis les coopératives de production guinéennes.
            </p>
            <div className="flex items-center gap-4 text-xs font-black text-[#FCD116] pt-2">
              <span>✓ 100% Authentique</span>
              <span>✓ Sans intermédiaires</span>
              <span>✓ Prix juste producteur</span>
            </div>
          </div>
          
          <button 
            onClick={() => goCategory('artisanat-mode')}
            className="px-6 py-4 bg-[#E63946] hover:bg-[#C82935] text-white rounded-2xl font-black text-xs uppercase tracking-wider transition active:scale-95 shadow-md flex items-center gap-2 shrink-0 self-start md:self-center"
          >
            <span>Soutenir nos Artisans</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* ── PRODUITS EN VEDETTE ⭐ ── */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-8 text-left">
          <div>
            <span className="text-xs font-black uppercase text-[#E63946] tracking-widest">Coups de Coeur</span>
            <h2 className="text-2xl md:text-3xl font-black text-[#2B2D42] mt-1 relative inline-block">
              ⭐ Produits en Vedette
              <span className="absolute bottom-[-6px] left-0 w-16 h-1 bg-gradient-to-r from-[#E63946] to-[#009460] rounded-full"></span>
            </h2>
          </div>
          <button 
            className="text-xs font-black text-gray-500 hover:text-[#E63946] transition flex items-center gap-1 uppercase tracking-wider" 
            onClick={() => setPage('shop')}
          >
            <span>Parcourir</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : featured.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-400 font-semibold shadow-premium">
            Aucun produit en vedette pour l'instant.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                setPage={setPage} 
                setSelectedProduct={setSelectedProduct} 
                showToast={showToast}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── MEILLEURES VENTES 🔥 ── */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-8 text-left">
          <div>
            <span className="text-xs font-black uppercase text-amber-500 tracking-widest">Tendances Actuelles</span>
            <h2 className="text-2xl md:text-3xl font-black text-[#2B2D42] mt-1 relative inline-block">
              🔥 Meilleures Ventes
              <span className="absolute bottom-[-6px] left-0 w-16 h-1 bg-gradient-to-r from-amber-500 to-[#E63946] rounded-full"></span>
            </h2>
          </div>
          <button 
            className="text-xs font-black text-gray-500 hover:text-[#E63946] transition flex items-center gap-1 uppercase tracking-wider" 
            onClick={() => setPage('shop')}
          >
            <span>Voir tout</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : bestSellers.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-400 font-semibold shadow-premium">
            Pas encore de meilleures ventes.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                setPage={setPage} 
                setSelectedProduct={setSelectedProduct} 
                showToast={showToast}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── SECTION DOUBLE BANNIÈRE ALIBABA STYLE (OFFRES TECH & ARTISANAT) ── */}
      <section className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
        {/* Banner Left */}
        <div className="rounded-[32px] overflow-hidden relative h-64 flex flex-col justify-end p-8 bg-cover bg-center shadow-lg border border-gray-100" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.85)), url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80')` }}>
          <div className="absolute top-6 left-6 bg-[#E63946] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm">Offre Tech</div>
          <h4 className="text-xl md:text-2xl font-black text-white leading-tight mb-2">PC & Smartphones d'occasion certifiés</h4>
          <p className="text-[11px] text-gray-300 font-semibold mb-4 leading-relaxed max-w-sm">Toutes les offres de nos boutiques tech de Kaloum. Matériel vérifié par nos équipes.</p>
          <button onClick={() => goCategory('tech-electronique')} className="px-4 py-2.5 bg-white text-[#2B2D42] hover:bg-[#FCD116] transition rounded-xl text-xs font-black uppercase tracking-wider self-start flex items-center gap-1.5 active:scale-95 shadow-md">
            <span>Visiter Tech</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Banner Right */}
        <div className="rounded-[32px] overflow-hidden relative h-64 flex flex-col justify-end p-8 bg-cover bg-center shadow-lg border border-gray-100" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.85)), url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&q=80')` }}>
          <div className="absolute top-6 left-6 bg-[#009460] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm">Coopérative Locale</div>
          <h4 className="text-xl md:text-2xl font-black text-white leading-tight mb-2">Tissu Traditionnel Lepy & Bazin Brodé</h4>
          <p className="text-[11px] text-gray-300 font-semibold mb-4 leading-relaxed max-w-sm">Vente de rouleaux de Lepy authentique fabriqués par des couturières de Labé.</p>
          <button onClick={() => goCategory('artisanat-mode')} className="px-4 py-2.5 bg-white text-[#2B2D42] hover:bg-[#FCD116] transition rounded-xl text-xs font-black uppercase tracking-wider self-start flex items-center gap-1.5 active:scale-95 shadow-md">
            <span>Découvrir la Mode</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </section>

      {/* ── NOUVEAUX ARRIVAGES 🆕 ── */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-8 text-left">
          <div>
            <span className="text-xs font-black uppercase text-[#009460] tracking-widest">Nouveautés</span>
            <h2 className="text-2xl md:text-3xl font-black text-[#2B2D42] mt-1 relative inline-block">
              🆕 Nouveaux Arrivages
              <span className="absolute bottom-[-6px] left-0 w-16 h-1 bg-gradient-to-r from-[#009460] to-[#FCD116] rounded-full"></span>
            </h2>
          </div>
          <button 
            className="text-xs font-black text-gray-500 hover:text-[#E63946] transition flex items-center gap-1 uppercase tracking-wider" 
            onClick={() => { setKeyword(''); setPage('shop'); }}
          >
            <span>Voir tout</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-400 font-semibold shadow-premium">
            Pas de nouveaux arrivages en ligne.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recent.map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                setPage={setPage} 
                setSelectedProduct={setSelectedProduct} 
                showToast={showToast}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── VENDEURS POPULAIRES 🏪 ── */}
      <section className="container mx-auto px-4 md:px-6 pb-6">
        <div className="flex items-end justify-between mb-8 text-left">
          <div>
            <span className="text-xs font-black uppercase text-[#F4A261] tracking-widest">Boutiques Populaires</span>
            <h2 className="text-2xl md:text-3xl font-black text-[#2B2D42] mt-1 relative inline-block">
              🏪 Vendeurs à la Une
              <span className="absolute bottom-[-6px] left-0 w-16 h-1 bg-gradient-to-r from-[#F4A261] to-[#E63946] rounded-full"></span>
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-400">Garants de la charte qualité</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {popularSellers.map(seller => (
            <div key={seller.id} className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-premium hover:shadow-premium-hover transition duration-300 relative overflow-hidden group">
              {/* Soft decorative background circles */}
              <div className="absolute right-[-15px] top-[-15px] w-24 h-24 bg-gradient-to-tr from-gray-50 to-gray-100 rounded-full group-hover:scale-110 transition duration-300"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 bg-[#FCD116]/10 text-2xl rounded-2xl flex items-center justify-center shadow-inner font-extrabold border border-[#FCD116]/20">
                  {seller.img}
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#2B2D42] group-hover:text-[#E63946] transition-colors">{seller.name}</h4>
                  <span className="text-[10px] text-gray-400 font-bold block mt-1">📍 Ville : {seller.city}, Guinée</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-50 pt-5 mt-5 relative z-10">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="fill-[#FCD116] text-[#FCD116]" />
                  <span className="text-xs font-black text-[#2B2D42]">{seller.rating}</span>
                  <span className="text-[10px] text-gray-400 font-bold">({seller.count} avis)</span>
                </div>
                
                <div className="flex gap-1">
                  {seller.tags.map(t => (
                    <span key={t} className="bg-gray-50 text-gray-500 border border-gray-100 text-[8px] font-black px-2 py-0.5 rounded-md uppercase">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setPage('shop')}
                className="w-full mt-5 py-3 bg-gray-50 hover:bg-[#E63946] hover:text-white rounded-xl text-xs font-black text-[#2B2D42] text-center transition duration-300 shadow-sm uppercase tracking-wider relative z-10 active:scale-95"
              >
                Visiter la Boutique
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── BANNIÈRE BANDEAU REJOINDRE EN TANT QUE VENDEUR ── */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="bg-gradient-to-tr from-[#007A33] via-[#009460] to-[#0fa84a] text-white rounded-[36px] p-8 md:p-12 relative overflow-hidden shadow-xl text-left">
          {/* Subtle design graphics */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-2xl space-y-4">
            <h3 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
              Rejoignez les Vendeurs de Shop Guinée !
            </h3>
            <p className="text-xs md:text-sm text-white/90 font-medium leading-relaxed max-w-lg">
              Créez votre boutique en moins de 5 minutes, listez vos produits physiques ou numériques et vendez-les en toute sérénité à Conakry et dans toute la Guinée. Inscription gratuite !
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => setPage('register')}
                className="px-6 py-3.5 bg-[#FCD116] hover:bg-[#cca400] text-[#2B2D42] font-black rounded-2xl shadow-lg transition active:scale-95 text-xs uppercase tracking-wider flex items-center gap-1.5 hover:shadow-glow-yellow"
              >
                <span>Créer ma boutique</span>
                <ChevronRight size={16} />
              </button>
              <button 
                onClick={() => setPage('chat')}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-bold transition active:scale-95 text-xs uppercase"
              >
                Parler à un conseiller
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
