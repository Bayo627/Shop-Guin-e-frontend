import React, { useState, useEffect } from 'react';
import { api, formatPrice, renderStars } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ShoppingCart, MessageSquare, Star, Package, Download, ChevronLeft, Share2 } from 'lucide-react';

export default function ProductDetailPage({ selectedProduct, setPage, setSelectedProduct }) {
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct]   = useState(selectedProduct);
  const [qty, setQty]           = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [reviewMsg, setReviewMsg]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab]           = useState('desc'); // desc | reviews | seller

  useEffect(() => {
    if (!selectedProduct) { setPage('shop'); return; }
    api.get(`/products/${selectedProduct.id}`)
      .then(d => setProduct(d.product))
      .catch(() => {});
  }, [selectedProduct]);

  if (!product) return <div className="loading-screen"><div className="spinner"/><p>Chargement…</p></div>;

  const images = (() => {
    try { return product.images ? JSON.parse(product.images) : [product.main_image]; }
    catch { return [product.main_image]; }
  })().filter(Boolean);
  if (!images.length) images.push('https://via.placeholder.com/600x400?text=Produit');

  const hasPromo = product.promo_price && parseFloat(product.promo_price) < parseFloat(product.price);
  const finalPrice = hasPromo ? product.promo_price : product.price;
  const discount = hasPromo ? Math.round((1 - product.promo_price / product.price) * 100) : 0;

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { setPage('login'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', { product_id: product.id, ...reviewForm });
      setReviewMsg('✅ Votre avis a été publié !');
      const d = await api.get(`/products/${product.id}`);
      setProduct(d.product);
    } catch (err) {
      setReviewMsg('❌ ' + err.message);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="product-detail fade-in">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button onClick={() => setPage('home')}>Accueil</button>
          <span>/</span>
          <button onClick={() => setPage('shop')}>Boutique</button>
          <span>/</span>
          <span>{product.category_name}</span>
          <span>/</span>
          <span className="breadcrumb-active">{product.name}</span>
        </div>

        <div className="detail-grid">
          {/* ── Galerie Images ── */}
          <div className="detail-gallery">
            <div className="main-img-wrap">
              <img src={images[activeImg]} alt={product.name} className="detail-main-img" />
              {hasPromo && <span className="detail-badge">-{discount}%</span>}
            </div>
            {images.length > 1 && (
              <div className="thumbnails">
                {images.map((img, i) => (
                  <img key={i} src={img} alt="" className={`thumb ${i === activeImg ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)} />
                ))}
              </div>
            )}
          </div>

          {/* ── Infos Produit ── */}
          <div className="detail-info">
            <span className="detail-cat">{product.category_name}</span>
            <h1 className="detail-title">{product.name}</h1>

            <div className="detail-meta">
              <span className="stars" style={{ color:'#d97706', fontSize:'1.1rem' }}>
                {renderStars(product.avg_rating || 0)}
              </span>
              <span className="detail-reviews">({product.total_reviews || 0} avis)</span>
              <span className="detail-sold">• {product.total_sold || 0} vendus</span>
            </div>

            <div className="detail-price-block">
              <span className="detail-price">{formatPrice(finalPrice)}</span>
              {hasPromo && (
                <span className="detail-old-price">{formatPrice(product.price)}</span>
              )}
              {hasPromo && <span className="discount-badge">-{discount}%</span>}
            </div>

            {product.short_desc && <p className="detail-short-desc">{product.short_desc}</p>}

            {/* Stock */}
            {product.type === 'physical' ? (
              <div className={`stock-info ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                <Package size={16}/>
                {product.stock > 0 ? `En stock (${product.stock} disponibles)` : 'Rupture de stock'}
              </div>
            ) : (
              <div className="stock-info digital">
                <Download size={16}/> Téléchargement immédiat après paiement
              </div>
            )}

            {/* Quantité */}
            {product.type === 'physical' && product.stock > 0 && (
              <div className="qty-wrap">
                <label className="form-label">Quantité :</label>
                <div className="qty-ctrl">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                </div>
              </div>
            )}

            {/* Boutons actions */}
            <div className="detail-actions">
              <button
                className="btn btn-primary"
                disabled={product.type === 'physical' && product.stock === 0}
                onClick={() => { addToCart(product, qty); setPage('cart'); }}
              >
                <ShoppingCart size={20}/> Ajouter au panier
              </button>
              {isAuthenticated && user?.role === 'buyer' && (
                <button className="btn btn-outline" onClick={() => setPage('chat')}>
                  <MessageSquare size={18}/> Contacter le vendeur
                </button>
              )}
            </div>

            {/* Boutique */}
            <div className="seller-mini-card">
              <div className="seller-avatar">{(product.store_name || 'S').charAt(0)}</div>
              <div>
                <strong>{product.store_name}</strong>
                <p>Vendu par {product.seller_name}</p>
                {product.vendor_rating > 0 && (
                  <span style={{ color:'#d97706' }}>{renderStars(product.vendor_rating)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Onglets ── */}
        <div className="detail-tabs">
          {[['desc','📝 Description'],['reviews','⭐ Avis'],['seller','🏪 Boutique']].map(([k,l]) => (
            <button key={k} className={`tab-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        <div className="tab-content">
          {tab === 'desc' && (
            <div className="description-text">
              {product.description.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
          )}

          {tab === 'reviews' && (
            <div className="reviews-section">
              <div className="reviews-summary">
                <div className="rating-big">{parseFloat(product.avg_rating || 0).toFixed(1)}</div>
                <div>
                  <div style={{ color:'#d97706', fontSize:'1.5rem' }}>{renderStars(product.avg_rating || 0)}</div>
                  <p>{product.total_reviews} avis</p>
                </div>
              </div>

              {(product.reviews || []).map(r => (
                <div key={r.id} className="review-card">
                  <div className="review-header">
                    <div className="review-avatar">{(r.buyer_name || 'A').charAt(0)}</div>
                    <div>
                      <strong>{r.buyer_name}</strong>
                      {r.is_verified === 1 && <span className="verified-badge">✅ Achat vérifié</span>}
                      <div style={{ color:'#d97706' }}>{renderStars(r.rating)}</div>
                    </div>
                    <span className="review-date">{new Date(r.created_at).toLocaleDateString('fr-GN')}</span>
                  </div>
                  {r.title && <strong className="review-title">{r.title}</strong>}
                  {r.comment && <p>{r.comment}</p>}
                </div>
              ))}

              {/* Formulaire avis */}
              {isAuthenticated && user?.role === 'buyer' && (
                <div className="review-form-wrap">
                  <h3>Laisser un avis</h3>
                  {reviewMsg && <div className={`alert ${reviewMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{reviewMsg}</div>}
                  <form onSubmit={submitReview}>
                    <div className="form-group">
                      <label className="form-label">Note</label>
                      <div className="star-picker">
                        {[1,2,3,4,5].map(n => (
                          <button key={n} type="button"
                            className={`star-btn ${reviewForm.rating >= n ? 'active' : ''}`}
                            onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>★</button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Titre (optionnel)</label>
                      <input className="form-input" placeholder="Résumé de votre avis"
                        value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Commentaire</label>
                      <textarea className="form-input" rows="4" placeholder="Décrivez votre expérience…"
                        value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Publication…' : <><Star size={16}/> Publier mon avis</>}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {tab === 'seller' && (
            <div className="seller-tab">
              <div className="seller-card-big">
                <div className="seller-avatar-big">{(product.store_name || 'S').charAt(0)}</div>
                <div>
                  <h3>{product.store_name}</h3>
                  <p>{product.store_description}</p>
                  <p>📞 {product.seller_phone}</p>
                  {product.vendor_rating > 0 && (
                    <p>Note boutique : <span style={{ color:'#d97706' }}>{renderStars(product.vendor_rating)}</span></p>
                  )}
                </div>
              </div>
              {isAuthenticated && (
                <button className="btn btn-outline" onClick={() => setPage('chat')}>
                  <MessageSquare size={18}/> Envoyer un message au vendeur
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
