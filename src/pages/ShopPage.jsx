import React, { useState, useEffect } from 'react';
import { api, formatPrice } from '../api.js';
import { ProductCard } from '../App.jsx';
import { SlidersHorizontal, ChevronDown, Search, X, Plus, Store, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const SORT_OPTIONS = [
  { value: 'created_at-DESC', label: 'Plus récents' },
  { value: 'price-ASC',       label: 'Prix croissant' },
  { value: 'price-DESC',      label: 'Prix décroissant' },
  { value: 'rating-DESC',     label: 'Mieux notés' },
  { value: 'sales-DESC',      label: 'Plus vendus' },
];

export default function ShopPage({ setPage, setSelectedProduct, keyword, setKeyword, categoryFilter, setCatFilter, showToast }) {
  const { isAuthenticated, isSeller } = useAuth();
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]       = useState(true);

  // Vendor filter from VendorsPage
  const [vendorId, setVendorId]     = useState(() => {
    const v = localStorage.getItem('shop_vendor_filter');
    return v ? parseInt(v) : null;
  });
  const [vendorInfo, setVendorInfo] = useState(null);

  const [filters, setFilters] = useState({
    category: categoryFilter || '',
    minPrice: '', maxPrice: '',
    type: '', sortBy: 'created_at', order: 'DESC',
    page: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleCategoryAddProduct = (cat) => {
    if (!isAuthenticated) {
      showToast("🔑 Veuillez vous connecter pour ajouter un produit.", "error");
      setPage('login');
      return;
    }
    if (!isSeller) {
      showToast("🏪 Seuls les comptes vendeurs peuvent ajouter des produits.", "error");
      localStorage.setItem('dash_tab', 'profile');
      setPage('dashboard');
      return;
    }
    localStorage.setItem('dash_tab', 'products');
    localStorage.setItem('dash_prefill_category', cat.id);
    localStorage.setItem('dash_open_create', 'true');
    setPage('dashboard');
  };

  useEffect(() => {
    setFilters(f => ({ ...f, category: categoryFilter || '', page: 1 }));
  }, [categoryFilter]);

  // Load categories: vendor-specific when filtering by vendor, all categories otherwise
  useEffect(() => {
    if (vendorId) {
      api.get(`/vendors/${vendorId}/categories`)
        .then(d => setCategories(d.categories || []))
        .catch(() => setCategories([]));
      // Also load vendor info for the banner
      api.get('/vendors/public')
        .then(d => {
          const v = (d.vendors || []).find(v => v.id === vendorId);
          setVendorInfo(v || null);
        })
        .catch(() => {});
    } else {
      api.get('/categories').then(d => setCategories(d.categories || [])).catch(() => {});
      setVendorInfo(null);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchProducts();
  }, [filters, keyword, vendorId]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword)          params.set('keyword',  keyword);
      if (filters.category) params.set('category', filters.category);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.type)     params.set('type',     filters.type);
      if (vendorId)         params.set('vendorId', vendorId);
      params.set('sortBy', filters.sortBy);
      params.set('order',  filters.order);
      params.set('page',   filters.page);
      params.set('limit',  '16');

      const data = await api.get(`/products?${params}`);
      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const setSort = (val) => {
    const [sortBy, order] = val.split('-');
    setFilters(f => ({ ...f, sortBy, order, page: 1 }));
  };

  const clearVendorFilter = () => {
    setVendorId(null);
    localStorage.removeItem('shop_vendor_filter');
    setFilters(f => ({ ...f, category: '', page: 1 }));
    setCatFilter('');
  };

  const clearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '', type: '', sortBy: 'created_at', order: 'DESC', page: 1 });
    setKeyword('');
    setCatFilter('');
    clearVendorFilter();
  };

  const hasFilters = filters.category || filters.minPrice || filters.maxPrice || filters.type || keyword || vendorId;

  return (
    <div className="shop-page fade-in">
      <div className="container">
        {/* Vendor Banner */}
        {vendorInfo && (
          <div className="mb-6 bg-gradient-to-r from-[#2B2D42] to-[#1A1C2C] text-white rounded-2xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 bg-[#009460] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-lg font-black">
                {vendorInfo.store_logo_url ? (
                  <img src={vendorInfo.store_logo_url} alt={vendorInfo.store_name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Store size={22} className="text-[#FCD116]" />
                )}
              </div>
              <div>
                <h2 className="text-sm font-black tracking-wide">
                  🏪 {vendorInfo.store_name}
                </h2>
                <p className="text-[10px] text-gray-300 font-semibold mt-0.5">
                  par {vendorInfo.seller_name} • {vendorInfo.city || 'Guinée'}
                </p>
              </div>
            </div>
            <button
              onClick={clearVendorFilter}
              className="relative z-10 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Toutes les boutiques</span>
            </button>
          </div>
        )}

        {/* En-tête */}
        <div className="shop-header">
          <div>
            <h1 className="section-title">{vendorInfo ? vendorInfo.store_name : 'Boutique'}</h1>
            <p className="shop-count">
              {loading ? '…' : `${pagination.total || 0} produit(s) trouvé(s)`}
              {keyword && <> pour "<strong>{keyword}</strong>"</>}
            </p>
          </div>
          <div className="shop-controls">
            <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={18} /> Filtres {showFilters ? '▲' : '▼'}
            </button>
            <select
              className="sort-select"
              onChange={e => setSort(e.target.value)}
              value={`${filters.sortBy}-${filters.order}`}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="shop-layout">
          {/* Sidebar filtres */}
          <aside className={`filter-sidebar ${showFilters ? 'open' : ''}`}>
            <div className="filter-header">
              <h3>Filtrer</h3>
              {hasFilters && <button className="clear-btn" onClick={clearFilters}><X size={14}/> Effacer</button>}
            </div>

            {/* Catégorie */}
            <div className="filter-group">
              <label className="filter-label">Catégorie</label>
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between group/cat py-1">
                  <label className="filter-radio flex-grow cursor-pointer">
                    <input
                      type="radio" name="cat" value={cat.slug}
                      checked={filters.category === cat.slug}
                      onChange={() => { setFilters(f => ({ ...f, category: cat.slug, page: 1 })); setCatFilter(cat.slug); }}
                    />
                    <span>{cat.icon} {cat.name}</span>
                    <span className="filter-count">{cat.product_count}</span>
                  </label>
                  <button
                    title="Ajouter un produit dans cette catégorie"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategoryAddProduct(cat);
                    }}
                    className="p-1 text-gray-400 hover:text-[#009460] hover:bg-emerald-50 rounded-lg transition duration-200 ml-1 shrink-0 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/cat:opacity-100 focus:opacity-100"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))}
              <label className="filter-radio">
                <input type="radio" name="cat" value="" checked={!filters.category}
                  onChange={() => { setFilters(f => ({ ...f, category: '', page: 1 })); setCatFilter(''); }} />
                <span>Toutes</span>
              </label>
            </div>

            {/* Prix */}
            <div className="filter-group">
              <label className="filter-label">Prix (GNF)</label>
              <div className="price-range">
                <input className="form-input" placeholder="Min" type="number"
                  value={filters.minPrice}
                  onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value, page: 1 }))} />
                <span>—</span>
                <input className="form-input" placeholder="Max" type="number"
                  value={filters.maxPrice}
                  onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value, page: 1 }))} />
              </div>
            </div>

            {/* Type */}
            <div className="filter-group">
              <label className="filter-label">Type de produit</label>
              {[['','Tous'],['physical','Physique 📦'],['digital','Numérique 💾']].map(([v,l]) => (
                <label key={v} className="filter-radio">
                  <input type="radio" name="type" value={v}
                    checked={filters.type === v}
                    onChange={() => setFilters(f => ({ ...f, type: v, page: 1 }))} />
                  <span>{l}</span>
                </label>
              ))}
            </div>
          </aside>

          {/* Grille produits */}
          <div className="shop-main">
            {loading ? (
              <div className="product-grid">
                {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>Aucun produit trouvé</h3>
                <p>Essayez d'autres mots-clés ou retirez certains filtres.</p>
                <button className="btn btn-primary" onClick={clearFilters}>Réinitialiser les filtres</button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map(p => (
                    <ProductCard key={p.id} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="page-btn"
                      disabled={filters.page <= 1}
                      onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                    >← Précédent</button>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        className={`page-btn ${filters.page === i + 1 ? 'active' : ''}`}
                        onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}
                      >{i + 1}</button>
                    ))}
                    <button
                      className="page-btn"
                      disabled={filters.page >= pagination.totalPages}
                      onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                    >Suivant →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
