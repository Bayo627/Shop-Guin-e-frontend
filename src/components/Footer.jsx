import React from 'react';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';

export const Footer = ({ setCurrentPage }) => {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.container}>
        {/* Colonne 1 : Branding */}
        <div style={styles.col}>
          <div style={styles.logo}>
            <span style={styles.logoGreen}>Shop</span>
            <span style={styles.logoYellow}>Guinée</span>
          </div>
          <p style={styles.description}>
            La première marketplace en Guinée inspirée des leaders mondiaux. Connectez les acheteurs et vendeurs locaux pour acheter en toute sécurité via Orange Money, MTN Money et Virement Bancaire.
          </p>
        </div>

        {/* Colonne 2 : Liens rapides */}
        <div style={styles.col}>
          <h4 style={styles.heading}>Explorer</h4>
          <ul style={styles.list}>
            <li><button onClick={() => setCurrentPage('home')} style={styles.link}>Accueil</button></li>
            <li><button onClick={() => setCurrentPage('shop')} style={styles.link}>Boutique</button></li>
            <li><button onClick={() => setCurrentPage('cart')} style={styles.link}>Mon Panier</button></li>
            <li><button onClick={() => setCurrentPage('buyer-dashboard')} style={styles.link}>Mon Compte Acheteur</button></li>
          </ul>
        </div>

        {/* Colonne 3 : Support & Contact */}
        <div style={styles.col}>
          <h4 style={styles.heading}>Contact & Support</h4>
          <ul style={styles.contactList}>
            <li style={styles.contactItem}>
              <Phone size={16} color="var(--color-green)" />
              <span>+224 620 00 00 00 / 664 00 00 00</span>
            </li>
            <li style={styles.contactItem}>
              <Mail size={16} color="var(--color-green)" />
              <span>support@shopguinee.gn</span>
            </li>
            <li style={styles.contactItem}>
              <MapPin size={16} color="var(--color-green)" />
              <span>Kaloum, Conakry, République de Guinée</span>
            </li>
          </ul>
        </div>

        {/* Colonne 4 : Modes de paiement */}
        <div style={styles.col}>
          <h4 style={styles.heading}>Modes de Paiement</h4>
          <p style={styles.text}>Nous acceptons les paiements locaux sécurisés :</p>
          <div style={styles.paymentMethods}>
            <div style={styles.badgeOM}>Orange Money</div>
            <div style={styles.badgeMTN}>MTN MoMo</div>
            <div style={styles.badgeBank}>Banque</div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={styles.copyright}>
        <div className="container" style={styles.copyContainer}>
          <p>© {new Date().getFullYear()} Shop Guinée. Tous droits réservés.</p>
          <p style={styles.developer}>
            Fait avec <Heart size={14} color="var(--color-red)" fill="var(--color-red)" /> pour le commerce guinéen.
          </p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: 'var(--bg-dark)',
    color: '#94a3b8',
    paddingTop: '60px',
    borderTop: '5px solid var(--color-green)'
  },
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '40px',
    paddingBottom: '40px'
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  logo: {
    fontSize: '1.4rem',
    fontWeight: '800',
    marginBottom: '8px'
  },
  logoGreen: {
    color: 'var(--color-green)'
  },
  logoYellow: {
    color: 'var(--color-yellow)'
  },
  description: {
    fontSize: '0.9rem',
    lineHeight: '1.6',
    color: '#cbd5e1'
  },
  heading: {
    color: '#ffffff',
    fontSize: '1.1rem',
    fontWeight: '700',
    position: 'relative',
    paddingBottom: '8px',
    marginBottom: '8px'
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  link: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    padding: 0
  },
  contactList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    fontSize: '0.9rem'
  },
  contactItem: {
    display: 'flex',
    align-items: 'center',
    gap: '10px'
  },
  text: {
    fontSize: '0.9rem'
  },
  paymentMethods: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '6px'
  },
  badgeOM: {
    backgroundColor: '#ff6600',
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '700'
  },
  badgeMTN: {
    backgroundColor: '#ffcc00',
    color: '#000000',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '700'
  },
  badgeBank: {
    backgroundColor: '#0066cc',
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '700'
  },
  copyright: {
    backgroundColor: '#090d16',
    padding: '20px 0',
    marginTop: '20px',
    fontSize: '0.85rem'
  },
  copyContainer: {
    display: 'flex',
    justify-content: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  developer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  }
};
