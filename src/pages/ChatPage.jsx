import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Send, User, MessageSquare, Loader, Store, Shield, ArrowLeft } from 'lucide-react';

export default function ChatPage({ setPage }) {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' ou 'chat'
  
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const inboxIntervalRef = useRef(null);

  // Charger la boîte de réception
  const fetchInbox = async (showLoading = false) => {
    if (showLoading) setLoadingConversations(true);
    try {
      const data = await api.get('/messages/inbox');
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la boîte de réception :', err);
    } finally {
      if (showLoading) setLoadingConversations(false);
    }
  };

  // Charger une conversation spécifique
  const fetchConversation = async (partnerId, showLoading = false) => {
    if (showLoading) setLoadingMessages(true);
    try {
      const data = await api.get(`/messages/conversation/${partnerId}`);
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la conversation :', err);
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  // Charger l'inbox au montage
  useEffect(() => {
    if (isAuthenticated) {
      fetchInbox(true);
      // Polling de la boîte de réception toutes les 8 secondes
      inboxIntervalRef.current = setInterval(() => {
        fetchInbox(false);
      }, 8000);
    }
    return () => {
      if (inboxIntervalRef.current) clearInterval(inboxIntervalRef.current);
    };
  }, [isAuthenticated]);

  // Gérer le changement de chat actif et le polling associé
  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (activeChat) {
      fetchConversation(activeChat.user_id, true);
      
      // Mettre en place le polling de la conversation active toutes les 4 secondes
      pollIntervalRef.current = setInterval(() => {
        fetchConversation(activeChat.user_id, false);
      }, 4000);
    } else {
      setMessages([]);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeChat]);

  // Faire défiler vers le bas lors de la réception de nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Envoyer un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Ajout optimiste au state local pour une réactivité instantanée
    const tempMsg = {
      id: Date.now(),
      sender_id: user.id,
      receiver_id: activeChat.user_id,
      content: content,
      created_at: new Date().toISOString(),
      is_read: 0
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await api.post('/messages', {
        receiver_id: activeChat.user_id,
        content: content
      });
      if (res.success) {
        // Remplacer ou rafraîchir
        fetchConversation(activeChat.user_id, false);
        fetchInbox(false);
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi du message :", err);
    } finally {
      setSending(false);
    }
  };

  const handleSelectChat = (conv) => {
    setActiveChat(conv);
    setMobileView('chat');
    // Marquer localement comme lu
    setConversations(prev =>
      prev.map(c => c.user_id === conv.user_id ? { ...c, unread_count: 0 } : c)
    );
  };

  const handleBackToList = () => {
    setMobileView('list');
    setActiveChat(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ maxWidth: '600px', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '4.5rem', marginBottom: '20px' }}>💬</div>
        <h2>Messagerie Shop Guinée</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '15px 0 30px' }}>
          Vous devez être connecté pour accéder à votre messagerie et échanger avec vos acheteurs ou vendeurs.
        </p>
        <button className="btn btn-primary" onClick={() => setPage('login')}>
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="container chat-page-wrapper fade-in">
      <div className="chat-layout-card">
        {/* Barre latérale des discussions */}
        <div className={`chat-sidebar-pane ${mobileView === 'chat' ? 'hide-mobile' : ''}`}>
          <div className="chat-sidebar-header">
            <h3>💬 Mes Discussions</h3>
          </div>
          
          <div className="chat-conversations-list">
            {loadingConversations ? (
              <div className="chat-loading-state">
                <Loader className="spinner" size={24} style={{ color: 'var(--color-green)' }} />
                <p>Chargement des conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="chat-empty-state">
                <MessageSquare size={36} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
                <p>Aucune conversation en cours.</p>
                <button className="btn btn-outline" style={{ marginTop: '15px', padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setPage('shop')}>
                  Explorer les produits
                </button>
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeChat && activeChat.user_id === conv.user_id;
                const isOnline = true; // Simulation présence simplifiée
                
                return (
                  <button
                    key={conv.user_id}
                    className={`conversation-item-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectChat(conv)}
                  >
                    <div className="avatar-wrapper">
                      <div className="chat-avatar">
                        {conv.name.charAt(0).toUpperCase()}
                      </div>
                      {conv.unread_count > 0 && <span className="unread-dot-indicator" />}
                    </div>

                    <div className="conversation-info-box">
                      <div className="conversation-row">
                        <span className="partner-name">{conv.name}</span>
                        <span className="message-time">
                          {new Date(conv.last_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="conversation-row" style={{ marginTop: '4px' }}>
                        <span className="last-message-snippet">
                          {conv.last_message}
                        </span>
                        
                        {conv.role === 'seller' ? (
                          <span className="role-tag-badge seller-tag"><Store size={10} /> Vendeur</span>
                        ) : conv.role === 'admin' ? (
                          <span className="role-tag-badge admin-tag"><Shield size={10} /> Admin</span>
                        ) : (
                          <span className="role-tag-badge buyer-tag"><User size={10} /> Acheteur</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Espace de chat de la conversation */}
        <div className={`chat-conversation-pane ${mobileView === 'list' ? 'hide-mobile' : ''}`}>
          {activeChat ? (
            <>
              {/* En-tête de la discussion active */}
              <div className="active-chat-header">
                <button className="back-arrow-mobile" onClick={handleBackToList}>
                  <ArrowLeft size={20} />
                </button>
                
                <div className="chat-avatar-small">
                  {activeChat.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="active-chat-meta">
                  <h4>{activeChat.name}</h4>
                  <div className="meta-sub">
                    {activeChat.role === 'seller' ? (
                      <span className="partner-type-label"><Store size={12} /> Boutique : {activeChat.store_name || activeChat.name}</span>
                    ) : activeChat.role === 'admin' ? (
                      <span className="partner-type-label"><Shield size={12} /> Support Administratif</span>
                    ) : (
                      <span className="partner-type-label"><User size={12} /> Client</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Corps : Liste des messages scrollable */}
              <div className="chat-messages-container">
                {loadingMessages ? (
                  <div className="messages-loading">
                    <Loader className="spinner" size={24} />
                    <p>Chargement des messages...</p>
                  </div>
                ) : (
                  <>
                    <div className="chat-alert-banner">
                      🔒 Échanges sécurisés. N'effectuez aucun paiement en dehors des méthodes agréées sur Shop Guinée.
                    </div>
                    
                    {messages.map((msg) => {
                      const isMe = msg.sender_id === user.id;
                      const formattedTime = new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <div key={msg.id} className={`message-bubble-row ${isMe ? 'msg-right' : 'msg-left'}`}>
                          <div className={`message-bubble ${isMe ? 'bubble-sent' : 'bubble-received'}`}>
                            <p className="message-content-text">{msg.content}</p>
                            <span className="msg-timestamp">{formattedTime}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Pied de page : Zone de saisie du message */}
              <form className="chat-input-bar-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Tapez votre message ici..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                  className="chat-text-input"
                />
                <button type="submit" className="chat-send-btn" disabled={!newMessage.trim() || sending}>
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected-screen">
              <div className="illustration-wrapper">
                <MessageSquare size={64} style={{ color: 'var(--color-green-light)', fill: 'rgba(0,122,51,0.05)' }} />
              </div>
              <h3>Messagerie Shop Guinée</h3>
              <p>Sélectionnez une discussion à gauche pour commencer à échanger avec un acheteur ou un vendeur en temps réel.</p>
              <div className="chat-features-badges">
                <span>💬 Discussion instantanée</span>
                <span>📦 Suivi des commandes</span>
                <span>⚡ Réactivité assurée</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
