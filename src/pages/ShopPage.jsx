import React, { useState, useEffect } from 'react';
import { api, formatPrice } from '../api.js';
import { ProductCard } from '../App.jsx';
import { SlidersHorizontal, ChevronDown, Search, X } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'created_at-DESC', label: 'Plus récents' },
  { value: 'price-ASC',       label: 'Prix croissant' },
  { value: 'price-DESC',      label: 'Prix décroissant' },
  { value: 'rating-DESC',     label: 'Mieux notés' },
  { value: 'sales-DESC',      label: 'Plus vendus' },
];

export default function ShopPage({ setPage, setSelectedProduct, keyword, setKeyword, categoryFilter, setCatFilter }) {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]       = useState(true);

  const [filters, setFilters] = useState({
    category: categoryFilter || '',
    minPrice: '', maxPrice: '',
    type: '', sortBy: 'created_at', order: 'DESC',
    page: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setFilters(f => ({ ...f, category: categoryFilter || '', page: 1 }));
  }, [categoryFilter]);

  useEffect(() => {
    api.get('/categories').then(d => setCategories(d.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters, keyword]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword)          params.set('keyword',  keyword);
      if (filters.category) params.set('category', filters.category);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.type)     params.set('type',     filters.type);
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

  const clearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '', type: '', sortBy: 'created_at', order: 'DESC', page: 1 });
    setKeyword('');
    setCatFilter('');
  };

  const hasFilters = filters.category || filters.minPrice || filters.maxPrice || filters.type || keyword;

  return (
    <div className="shop-page fade-in">
      <div className="container">
        {/* En-tête */}
        <div className="shop-header">
          <div>
            <h1 className="section-title">Boutique</h1>
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
                <label key={cat.id} className="filter-radio">
                  <input
                    type="radio" name="cat" value={cat.slug}
                    checked={filters.category === cat.slug}
                    onChange={() => { setFilters(f => ({ ...f, category: cat.slug, page: 1 })); setCatFilter(cat.slug); }}
                  />
                  <span>{cat.icon} {cat.name}</span>
                  <span className="filter-count">{cat.product_count}</span>
                </label>
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
