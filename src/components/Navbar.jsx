import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Search, ShoppingCart, User, Store, LogOut, MessageSquare, Shield, ClipboardList, LogIn } from 'lucide-react';

export const Navbar = ({ setCurrentPage, setKeywordFilter, setCategoryFilter }) => {
  const { user, logout, isAuthenticated, isSeller, isAdmin } = useAuth();
  const { getCartItemsCount } = useCart();
  const [searchValue, setSearchValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (setKeywordFilter) {
      setKeywordFilter(searchValue);
      setCategoryFilter(''); // Réinitialiser le filtre de catégorie pour la recherche
      setCurrentPage('shop');
    }
  };

  const handleLogoClick = () => {
    setSearchValue('');
    if (setKeywordFilter) setKeywordFilter('');
    if (setCategoryFilter) setCategoryFilter('');
    setCurrentPage('home');
  };

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.navContainer}>
        {/* LOGO SHOP GUINÉE */}
        <div onClick={handleLogoClick} style={styles.logo}>
          <span style={styles.logoGreen}>Shop</span>
          <span style={styles.logoYellow}>Guinée</span>
          <span style={styles.logoFlag}></span>
        </div>

        {/* BARRE DE RECHERCHE */}
        <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
          <input
            type="text"
            placeholder="Rechercher des produits, marques, artisanat..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchButton}>
            <Search size={18} />
            <span style={styles.searchText}>Rechercher</span>
          </button>
        </form>

        {/* LIENS / ACTIONS */}
        <div style={styles.navActions}>
          <button onClick={() => setCurrentPage('shop')} style={styles.navLink}>
            Boutique
          </button>

          {/* CHAT/MESSAGES (SI CONNECTÉ) */}
          {isAuthenticated && (
            <button onClick={() => setCurrentPage('chat')} style={styles.navLinkIcon} title="Messages">
              <MessageSquare size={20} />
              <span style={styles.linkText}>Messages</span>
            </button>
          )}

          {/* PANIER */}
          <button onClick={() => setCurrentPage('cart')} style={styles.cartButton} title="Panier">
            <div style={styles.cartIconWrapper}>
              <ShoppingCart size={22} />
              {getCartItemsCount() > 0 && (
                <span style={styles.cartBadge}>{getCartItemsCount()}</span>
              )}
            </div>
            <span style={styles.linkText}>Panier</span>
          </button>

          {/* MENU COMPTE / AUTH */}
          <div style={styles.profileDropdown}>
            {isAuthenticated ? (
              <>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} style={styles.userButton}>
                  <div style={styles.avatar}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={styles.userName}>{user.name.split(' ')[0]}</span>
                </button>

                {dropdownOpen && (
                  <div style={styles.dropdownMenu}>
                    <div style={styles.dropdownHeader}>
                      <strong>{user.name}</strong>
                      <span style={styles.dropdownSub}>{user.email}</span>
                      <span style={styles.dropdownRole}>{user.role === 'admin' ? 'Administrateur' : user.role === 'seller' ? 'Vendeur' : 'Acheteur'}</span>
                    </div>

                    <hr style={styles.divider} />

                    {/* LIENS CONDITIONNELS AU RÔLE */}
                    {isSeller && (
                      <button
                        onClick={() => { setCurrentPage('seller-dashboard'); setDropdownOpen(false); }}
                        style={styles.dropdownItem}
                      >
                        <Store size={16} /> Tableau de Bord Vendeur
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => { setCurrentPage('admin-panel'); setDropdownOpen(false); }}
                        style={styles.dropdownItem}
                      >
                        <Shield size={16} /> Panel Administrateur
                      </button>
                    )}

                    <button
                      onClick={() => { setCurrentPage('buyer-dashboard'); setDropdownOpen(false); }}
                      style={styles.dropdownItem}
                    >
                      <ClipboardList size={16} /> Mes Commandes
                    </button>

                    <hr style={styles.divider} />

                    <button
                      onClick={() => { logout(); setCurrentPage('home'); setDropdownOpen(false); }}
                      style={{ ...styles.dropdownItem, color: 'var(--color-red)' }}
                    >
                      <LogOut size={16} /> Déconnexion
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button onClick={() => setCurrentPage('login')} style={styles.loginButton}>
                <LogIn size={18} />
                Connexion
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: 'var(--shadow-sm)'
  },
  navContainer: {
    display: 'flex',
    align-items: 'center',
    justify-content: 'space-between',
    height: '75px',
    gap: '20px'
  },
  logo: {
    display: 'flex',
    align-items: 'center',
    cursor: 'pointer',
    fontSize: '1.6rem',
    fontWeight: '800',
    userSelect: 'none'
  },
  logoGreen: {
    color: 'var(--color-green)'
  },
  logoYellow: {
    color: 'var(--color-yellow-dark)'
  },
  logoFlag: {
    width: '6px',
    height: '24px',
    backgroundColor: 'var(--color-red)',
    marginLeft: '6px',
    borderRadius: '2px'
  },
  searchForm: {
    display: 'flex',
    flexGrow: 1,
    maxWidth: '550px',
    borderRadius: 'var(--border-radius-md)',
    overflow: 'hidden',
    border: '1.5px solid var(--color-green)'
  },
  searchInput: {
    flexGrow: 1,
    padding: '10px 16px',
    border: 'none',
    outline: 'none',
    fontSize: '0.95rem'
  },
  searchButton: {
    backgroundColor: 'var(--color-green)',
    color: 'var(--text-white)',
    padding: '0 20px',
    display: 'flex',
    align-items: 'center',
    gap: '8px',
    fontWeight: '600'
  },
  searchText: {
    '@media (max-width: 768px)': {
      display: 'none'
    }
  },
  navActions: {
    display: 'flex',
    align-items: 'center',
    gap: '24px'
  },
  navLink: {
    fontWeight: '600',
    color: 'var(--text-primary)',
    fontSize: '0.95rem'
  },
  navLinkIcon: {
    display: 'flex',
    align-items: 'center',
    gap: '8px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  cartButton: {
    display: 'flex',
    align-items: 'center',
    gap: '8px',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  cartIconWrapper: {
    position: 'relative'
  },
  cartBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: 'var(--color-red)',
    color: 'var(--text-white)',
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '10px',
    border: '2px solid var(--bg-secondary)'
  },
  profileDropdown: {
    position: 'relative'
  },
  userButton: {
    display: 'flex',
    align-items: 'center',
    gap: '10px'
  },
  avatar: {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-green-light)',
    color: 'var(--color-green)',
    display: 'flex',
    align-items: 'center',
    justify-content: 'center',
    fontWeight: '700',
    border: '1px solid var(--color-green)'
  },
  userName: {
    fontWeight: '600',
    fontSize: '0.95rem',
    color: 'var(--text-primary)'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '48px',
    right: 0,
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--shadow-lg)',
    width: '260px',
    padding: '12px 0',
    zIndex: 101,
    animation: 'fadeIn 0.2s ease-out'
  },
  dropdownHeader: {
    padding: '10px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  dropdownSub: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)'
  },
  dropdownRole: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--color-green)',
    marginTop: '4px',
    textTransform: 'uppercase'
  },
  divider: {
    border: 'none',
    borderBottom: '1px solid var(--border-color)',
    margin: '8px 0'
  },
  dropdownItem: {
    width: '100%',
    textAlign: 'left',
    padding: '10px 20px',
    display: 'flex',
    align-items: 'center',
    gap: '10px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    fontSize: '0.9rem'
  },
  loginButton: {
    backgroundColor: 'var(--color-green-light)',
    color: 'var(--color-green)',
    padding: '10px 20px',
    borderRadius: 'var(--border-radius-md)',
    fontWeight: '700',
    display: 'flex',
    align-items: 'center',
    gap: '8px'
  },
  linkText: {
    fontSize: '0.95rem'
  }
};
