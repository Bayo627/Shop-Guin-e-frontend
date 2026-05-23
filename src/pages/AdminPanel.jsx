import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api, formatPrice } from '../api.js';
import { Users, Package, BarChart2, CreditCard, Store, CheckCircle, XCircle, LogOut, Trash2 } from 'lucide-react';

export default function AdminPanel({ setPage }) {
  const { user, logout, isAdmin } = useAuth();
  const [tab, setTab]       = useState('stats');
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [products, setProds] = useState([]);
  const [payments, setPays] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]       = useState('');

  useEffect(() => {
    if (!user || !isAdmin) { setPage('login'); return; }
    loadStats();
  }, [user]);

  useEffect(() => {
    if (tab === 'users')    loadUsers();
    if (tab === 'products') loadProducts();
    if (tab === 'payments') loadPayments();
    if (tab === 'vendors')  loadVendors();
  }, [tab]);

  const loadStats    = async () => { try { const d = await api.get('/admin/stats'); setStats(d.stats); } catch(e){} finally { setLoading(false); } };
  const loadUsers    = async () => { try { const d = await api.get('/admin/users');    setUsers(d.users||[]); }    catch(e){} };
  const loadProducts = async () => { try { const d = await api.get('/admin/products'); setProds(d.products||[]); } catch(e){} };
  const loadPayments = async () => { try { const d = await api.get('/payments');       setPays(d.payments||[]); }  catch(e){} };
  const loadVendors  = async () => { try { const d = await api.get('/admin/vendors');  setVendors(d.vendors||[]); }catch(e){} };

  const verifyPayment = async (id, status) => {
    setMsg('');
    try {
      await api.put(`/payments/${id}/verify`, { status });
      setMsg(`✅ Paiement ${status === 'completed' ? 'validé' : 'rejeté'}.`);
      loadPayments(); loadStats();
    } catch(e) { setMsg('❌ ' + e.message); }
  };

  const toggleProduct = async (id, is_active) => {
    try { await api.put(`/admin/products/${id}`, { is_active: is_active ? 0 : 1 }); loadProducts(); }
    catch(e) { alert(e.message); }
  };

  const featureProduct = async (id, is_featured) => {
    try { await api.put(`/admin/products/${id}`, { is_featured: is_featured ? 0 : 1 }); loadProducts(); }
    catch(e) { alert(e.message); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur définitivement ?')) return;
    try { await api.delete(`/admin/users/${id}`); loadUsers(); }
    catch(e) { alert(e.message); }
  };

  const verifyVendor = async (id) => {
    try { await api.put(`/admin/vendors/${id}/verify`); setMsg('✅ Vendeur vérifié !'); loadVendors(); }
    catch(e) { setMsg('❌ ' + e.message); }
  };

  if (!user || !isAdmin) return null;

  const MENU = [
    ['stats',    <BarChart2 size={18}/>, 'Tableau de bord'],
    ['users',    <Users size={18}/>,    'Utilisateurs'],
    ['products', <Package size={18}/>,  'Produits'],
    ['payments', <CreditCard size={18}/>,'Paiements'],
    ['vendors',  <Store size={18}/>,    'Vendeurs'],
  ];

  return (
    <div className="dashboard-page fade-in">
      <div className="container">
        <h1 className="section-title" style={{ margin:'30px 0 24px' }}>🛡️ Panel Administrateur</h1>
        <div className="dashboard-layout">
          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            <div className="dash-user-info">
              <div className="dash-avatar" style={{ background:'var(--color-red)', color:'#fff' }}>{user.name.charAt(0)}</div>
              <div><strong>{user.name}</strong><small>{user.email}</small><span className="badge badge-danger">Admin</span></div>
            </div>
            <ul className="dashboard-sidebar-menu">
              {MENU.map(([k, icon, label]) => (
                <li key={k}>
                  <button className={`dashboard-sidebar-item ${tab===k?'active':''}`} onClick={() => setTab(k)}>
                    {icon} {label}
                  </button>
                </li>
              ))}
            </ul>
            <button className="dashboard-sidebar-item danger" style={{ width:'100%', marginTop:'auto' }}
              onClick={() => { logout(); setPage('home'); }}>
              <LogOut size={18}/> Déconnexion
            </button>
          </aside>

          <div className="dashboard-content">
            {msg && <div className={`alert ${msg.startsWith('✅')?'alert-success':'alert-error'}`} style={{marginBottom:'16px'}}>{msg}</div>}

            {/* ── Stats ── */}
            {tab === 'stats' && (
              <div>
                <h2 className="dash-section-title">Vue d'ensemble</h2>
                {loading ? <div className="spinner"/> : stats && (
                  <>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="stat-number">{stats.users?.total || 0}</div>
                        <div className="stat-label">Utilisateurs total</div>
                        <small>{stats.users?.buyers||0} acheteurs · {stats.users?.sellers||0} vendeurs</small>
                      </div>
                      <div className="stat-card">
                        <div className="stat-number">{stats.products?.total || 0}</div>
                        <div className="stat-label">Produits publiés</div>
                        <small>{stats.products?.active||0} actifs</small>
                      </div>
                      <div className="stat-card">
                        <div className="stat-number">{stats.orders?.total || 0}</div>
                        <div className="stat-label">Commandes passées</div>
                        <small>{stats.orders?.pending||0} en attente</small>
                      </div>
                      <div className="stat-card">
                        <div className="stat-number" style={{ fontSize:'1rem' }}>{formatPrice(stats.total_paid || 0)}</div>
                        <div className="stat-label">Revenus confirmés</div>
                      </div>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', marginTop:'24px' }}>
                      <div>
                        <h3 className="dash-section-title" style={{ fontSize:'1.1rem' }}>Dernières commandes</h3>
                        <div className="table-container">
                          <table className="custom-table">
                            <thead><tr><th>Numéro</th><th>Acheteur</th><th>Total</th><th>Statut</th></tr></thead>
                            <tbody>
                              {(stats.recentOrders||[]).map(o => (
                                <tr key={o.id}>
                                  <td>#{o.order_number}</td>
                                  <td>{o.buyer_name}</td>
                                  <td>{formatPrice(o.total_amount)}</td>
                                  <td><span className="badge badge-info">{o.status}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div>
                        <h3 className="dash-section-title" style={{ fontSize:'1.1rem' }}>Nouveaux membres</h3>
                        <div className="table-container">
                          <table className="custom-table">
                            <thead><tr><th>Nom</th><th>Rôle</th><th>Ville</th></tr></thead>
                            <tbody>
                              {(stats.recentUsers||[]).map(u => (
                                <tr key={u.id}>
                                  <td>{u.name}</td>
                                  <td><span className={`badge ${u.role==='admin'?'badge-danger':u.role==='seller'?'badge-info':'badge-success'}`}>{u.role}</span></td>
                                  <td>{u.city}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Utilisateurs ── */}
            {tab === 'users' && (
              <div>
                <h2 className="dash-section-title">Gestion des Utilisateurs ({users.length})</h2>
                <div className="table-container">
                  <table className="custom-table">
                    <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Ville</th><th>Statut</th><th>Actions</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td><strong>{u.name}</strong></td>
                          <td>{u.email}</td>
                          <td><span className={`badge ${u.role==='admin'?'badge-danger':u.role==='seller'?'badge-info':'badge-success'}`}>{u.role}</span></td>
                          <td>{u.city}</td>
                          <td><span className={`badge ${u.is_active?'badge-success':'badge-danger'}`}>{u.is_active?'Actif':'Inactif'}</span></td>
                          <td>
                            {u.role !== 'admin' && (
                              <button className="icon-btn delete" onClick={() => deleteUser(u.id)}><Trash2 size={15}/></button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Produits ── */}
            {tab === 'products' && (
              <div>
                <h2 className="dash-section-title">Modération des Produits</h2>
                <div className="table-container">
                  <table className="custom-table">
                    <thead><tr><th>Produit</th><th>Vendeur</th><th>Prix</th><th>Actif</th><th>Vedette</th></tr></thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}>
                          <td><strong>{p.name.slice(0,35)}</strong><br/><small>{p.category_name}</small></td>
                          <td>{p.store_name}</td>
                          <td>{formatPrice(p.price)}</td>
                          <td>
                            <button className={`toggle-btn ${p.is_active?'on':'off'}`} onClick={() => toggleProduct(p.id, p.is_active)}>
                              {p.is_active ? <CheckCircle size={18}/> : <XCircle size={18}/>}
                            </button>
                          </td>
                          <td>
                            <button className={`toggle-btn ${p.is_featured?'on':'off'}`} onClick={() => featureProduct(p.id, p.is_featured)}>
                              {p.is_featured ? '⭐' : '☆'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Paiements ── */}
            {tab === 'payments' && (
              <div>
                <h2 className="dash-section-title">Validation des Paiements</h2>
                <div className="table-container">
                  <table className="custom-table">
                    <thead><tr><th>Commande</th><th>Acheteur</th><th>Montant</th><th>Méthode</th><th>Transaction</th><th>Statut</th><th>Actions</th></tr></thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id}>
                          <td>#{p.order_number}</td>
                          <td>{p.buyer_name}</td>
                          <td><strong style={{color:'var(--color-green)'}}>{formatPrice(p.amount)}</strong></td>
                          <td>{p.provider === 'orange_money' ? '🟠 Orange' : p.provider === 'mtn_money' ? '🟡 MTN' : '🏦 Banque'}</td>
                          <td><code style={{fontSize:'.8rem'}}>{p.transaction_id}</code></td>
                          <td><span className={`badge ${p.status==='completed'?'badge-success':p.status==='failed'?'badge-danger':'badge-pending'}`}>{p.status}</span></td>
                          <td>
                            {p.status === 'pending' && (
                              <div style={{display:'flex',gap:'6px'}}>
                                <button className="icon-btn edit" title="Valider" onClick={() => verifyPayment(p.id,'completed')}><CheckCircle size={16}/></button>
                                <button className="icon-btn delete" title="Rejeter" onClick={() => verifyPayment(p.id,'failed')}><XCircle size={16}/></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {payments.length === 0 && <tr><td colSpan="7" style={{textAlign:'center',padding:'30px',color:'var(--text-muted)'}}>Aucun paiement</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Vendeurs ── */}
            {tab === 'vendors' && (
              <div>
                <h2 className="dash-section-title">Gestion des Vendeurs ({vendors.length})</h2>
                <div className="table-container">
                  <table className="custom-table">
                    <thead><tr><th>Boutique</th><th>Propriétaire</th><th>Ville</th><th>Produits</th><th>Ventes</th><th>Vérifié</th><th>Actions</th></tr></thead>
                    <tbody>
                      {vendors.map(v => (
                        <tr key={v.id}>
                          <td><strong>{v.store_name}</strong></td>
                          <td>{v.owner_name}<br/><small>{v.email}</small></td>
                          <td>{v.store_city}</td>
                          <td>{v.product_count}</td>
                          <td>{formatPrice(v.total_sales)}</td>
                          <td>
                            {v.is_verified
                              ? <span className="badge badge-success">✅ Vérifié</span>
                              : <span className="badge badge-pending">En attente</span>}
                          </td>
                          <td>
                            {!v.is_verified && (
                              <button className="btn btn-primary" style={{padding:'6px 12px',fontSize:'.8rem'}} onClick={() => verifyVendor(v.id)}>
                                <CheckCircle size={14}/> Vérifier
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
