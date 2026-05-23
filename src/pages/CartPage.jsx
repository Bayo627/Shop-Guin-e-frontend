import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../api.js';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage({ setPage }) {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (cart.length === 0) return (
    <div className="empty-cart fade-in">
      <div className="container" style={{ textAlign:'center', padding:'80px 0' }}>
        <div style={{ fontSize:'5rem' }}>🛒</div>
        <h2>Votre panier est vide</h2>
        <p style={{ color:'var(--text-secondary)', margin:'12px 0 24px' }}>
          Parcourez notre boutique et ajoutez des produits à votre panier !
        </p>
        <button className="btn btn-primary" onClick={() => setPage('shop')}>
          <ShoppingBag size={18}/> Commencer mes achats
        </button>
      </div>
    </div>
  );

  return (
    <div className="cart-page fade-in">
      <div className="container">
        <h1 className="section-title" style={{ margin:'30px 0 24px' }}>🛒 Mon Panier</h1>

        <div className="cart-layout">
          {/* Articles */}
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.product_id} className="cart-item">
                <img
                  src={item.image_url || 'https://via.placeholder.com/100?text=Produit'}
                  alt={item.name} className="cart-item-img"
                />
                <div className="cart-item-info">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p className="cart-item-store">{item.store_name || 'Boutique Shop Guinée'}</p>
                  <span className={`cart-item-type ${item.type}`}>
                    {item.type === 'digital' ? '💾 Numérique' : '📦 Physique'}
                  </span>
                </div>
                <div className="cart-item-qty">
                  {item.type === 'physical' ? (
                    <div className="qty-ctrl">
                      <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}><Minus size={14}/></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}><Plus size={14}/></button>
                    </div>
                  ) : (
                    <span className="qty-fixed">×1</span>
                  )}
                </div>
                <div className="cart-item-price">
                  {formatPrice(item.price * item.quantity)}
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.product_id)}>
                  <Trash2 size={18}/>
                </button>
              </div>
            ))}
            <div className="cart-actions">
              <button className="btn btn-text" onClick={() => setPage('shop')}>← Continuer mes achats</button>
              <button className="btn btn-text danger" onClick={clearCart}>🗑 Vider le panier</button>
            </div>
          </div>

          {/* Résumé commande */}
          <div className="cart-summary">
            <h3 className="summary-title">Récapitulatif</h3>
            <div className="summary-rows">
              {cart.map(item => (
                <div key={item.product_id} className="summary-row">
                  <span>{item.name.slice(0, 28)}{item.name.length > 28 ? '…' : ''} ×{item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <hr className="dd-hr"/>
              <div className="summary-row summary-total">
                <strong>Total</strong>
                <strong className="total-price">{formatPrice(getCartTotal())}</strong>
              </div>
              <p className="summary-note">⚡ Livraison calculée à l'étape suivante</p>
            </div>

            {isAuthenticated ? (
              <button className="btn btn-primary full-width" onClick={() => setPage('checkout')}>
                Passer la commande <ArrowRight size={18}/>
              </button>
            ) : (
              <div style={{ textAlign:'center' }}>
                <p style={{ marginBottom:'12px', color:'var(--text-secondary)' }}>
                  Connectez-vous pour finaliser votre commande
                </p>
                <button className="btn btn-primary full-width" onClick={() => setPage('login')}>
                  Se connecter pour commander
                </button>
              </div>
            )}

            <div className="secure-badges">
              <span>🔒 Paiement sécurisé</span>
              <span>📦 Livraison rapide</span>
              <span>✅ Vendeurs vérifiés</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
