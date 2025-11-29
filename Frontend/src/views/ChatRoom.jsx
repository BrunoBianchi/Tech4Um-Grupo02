import { api } from '../services/axios';
import React, { useState, useEffect, useRef } from 'react';
import Avatar, { genConfig } from 'react-nice-avatar';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../hooks/socket-hook';
import { useAuth } from '../hooks/auth-hook';
import { useRoom } from '../hooks/room-hook';
import EmojiPicker from 'emoji-picker-react';
import './chat-room.css';

export default function ChatRoom() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user } = useAuth();
  const { join } = useRoom();
  const { socket, isConnected, connect } = useSocket();

  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());

  // Mention State
  const [mentionSearch, setMentionSearch] = useState(null);
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionCursorIndex, setMentionCursorIndex] = useState(0);

  // Private Message State
  const [privateRecipient, setPrivateRecipient] = useState(null);

  // Similar Rooms State
  const [similarRooms, setSimilarRooms] = useState([]);

  // Picker State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState('');

  // Mock GIF Data with keywords for local search
  const GIF_LIBRARY = [
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXp1Z2J6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6/3o7TKSjRrfIPjeiVyM/giphy.gif", keywords: ["happy", "dance", "excited", "yay"] },
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXp1Z2J6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6/l0HlHFRbmaZtBRhXG/giphy.gif", keywords: ["hello", "hi", "wave", "welcome"] },
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXp1Z2J6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6/xT0xezQGU5xQOuTxWQ/giphy.gif", keywords: ["confused", "what", "huh", "question"] },
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXp1Z2J6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6/3o6Zt481isNVuQI1l6/giphy.gif", keywords: ["cat", "funny", "animal", "cute"] },
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXp1Z2J6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6/l0MYt5qVJZHrK86Ed/giphy.gif", keywords: ["dog", "funny", "animal", "cute"] },
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXp1Z2J6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6a3Z6/3o7TKDkDbfd7fW7J5u/giphy.gif", keywords: ["laugh", "lol", "haha", "funny"] },
    { url: "https://media.giphy.com/media/26tPplGWjN0xLyq5i/giphy.gif", keywords: ["yes", "agree", "nod", "ok"] },
    { url: "https://media.giphy.com/media/3o7btUg31OCi0NXdkY/giphy.gif", keywords: ["no", "nope", "disagree", "stop"] },
    { url: "https://media.giphy.com/media/l0HlCqV35hdEg2PN6/giphy.gif", keywords: ["cry", "sad", "tears", "upset"] },
    { url: "https://media.giphy.com/media/3o6UB3VhArvomJHtdK/giphy.gif", keywords: ["angry", "mad", "rage", "furious"] },
    { url: "https://media.giphy.com/media/l2JIdnF6aJcNqnUfC/giphy.gif", keywords: ["party", "celebrate", "fun", "cool"] },
    { url: "https://media.giphy.com/media/3oEjHWXddcIYf6st4k/giphy.gif", keywords: ["thumbs up", "like", "good", "approve"] },
  ];

  const [filteredGifs, setFilteredGifs] = useState(GIF_LIBRARY);

  useEffect(() => {
    if (!gifSearch.trim()) {
      setFilteredGifs(GIF_LIBRARY);
    } else {
      const term = gifSearch.toLowerCase();
      const filtered = GIF_LIBRARY.filter(g =>
        g.keywords.some(k => k.includes(term))
      );
      setFilteredGifs(filtered);
    }
  }, [gifSearch]);

  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const pickerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
        setShowGifPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerRef]);

  useEffect(() => {
    if (socket && isConnected && roomId) {
      const initChat = async () => {
        try {
          // 1. Join the room (HTTP request -> Server adds socket to room channel)
          await join(roomId, socket.id);

          // 2. Fetch messages
          console.log(`[Frontend] Fetching messages for room ${roomId}...`);
          const res = await api.get(`/room/${roomId}/messages`);
          console.log(`[Frontend] Messages received:`, res.data);

          setMessages(res.data.map(m => ({
            id: m.id,
            user: m.user,
            text: m.text,
            avatarConfig: genConfig(m.user),
            userId: m.userId,
            createdAt: m.createdAt,
            isPrivate: m.isPrivate,
            destinationName: m.destinationName
          })));

          // 3. Join socket.io room
          socket.emit('join_room', roomId);

          // 4. Request participants
          socket.emit('request_participants', roomId);
        } catch (err) {
          console.error("Failed to join room or fetch messages:", err);
        }
      };
      initChat();

      socket.on('receive_message', (newMessage) => {
        console.log('[Frontend] Socket received message:', newMessage);
        setMessages((prev) => [...prev, {
          id: newMessage.id,
          user: newMessage.user,
          text: newMessage.text,
          avatarConfig: genConfig(newMessage.user),
          userId: newMessage.userId,
          createdAt: newMessage.createdAt || new Date().toISOString(),
          isPrivate: newMessage.isPrivate,
          destinationName: newMessage.destinationName
        }]);
      });

      socket.on('update_participants', (updatedParticipants) => {
        setParticipants(updatedParticipants);
      });

      socket.on('user_typing', ({ userId, isTyping }) => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          if (isTyping) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      });

      return () => {
        if (socket && roomId) {
          socket.emit('leave_room', roomId);
        }
        socket.off('receive_message');
        socket.off('update_participants');
        socket.off('user_typing');
      };
    } else if (!socket && !isConnected) {
      const token = localStorage.getItem('@App:token');
      if (token) connect(token);
    }
  }, [socket, isConnected, roomId]);

  // Fetch Similar Rooms
  useEffect(() => {
    if (roomId) {
      api.get(`/room/${roomId}/similar`)
        .then(res => {
          setSimilarRooms(res.data);
        })
        .catch(err => console.error("Failed to fetch similar rooms:", err));
    }
  }, [roomId]);

  const handleSendMessage = (msgText = message) => {
    if (msgText.trim() && socket) {
      const payload = { roomId, message: msgText };
      if (privateRecipient) {
        payload.recipientId = privateRecipient.id;
      }
      socket.emit('send_message', payload);
      setMessage('');
      setShowMentionPopup(false);
      setPrivateRecipient(null);
      socket.emit('typing_stop', roomId);
      setShowEmojiPicker(false);
      setShowGifPicker(false);
    }
  };

  const handleParticipantClick = (participant) => {
    if (participant.id !== user?.id) {
      setPrivateRecipient(participant);
      setActiveTab('chat'); // Switch to chat on mobile
    }
  };

  const cancelPrivateMode = () => {
    setPrivateRecipient(null);
  };

  const handleTyping = (e) => {
    const val = e.target.value;
    setMessage(val);

    // Mention Logic
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbol !== -1) {
      const query = textBeforeCursor.slice(lastAtSymbol + 1);
      if (query.length >= 0) {
        setMentionSearch(query);
        setShowMentionPopup(true);
        setMentionCursorIndex(lastAtSymbol);
      } else {
        setShowMentionPopup(false);
      }
    } else {
      setShowMentionPopup(false);
    }

    if (socket) {
      socket.emit('typing_start', roomId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', roomId);
      }, 2000);
    }
  };

  const insertMention = (participantName) => {
    const textBeforeAt = message.slice(0, mentionCursorIndex);
    const textAfterCursor = message.slice(mentionCursorIndex + (mentionSearch?.length || 0) + 1);
    const newMessage = `${textBeforeAt}@${participantName} ${textAfterCursor}`;
    setMessage(newMessage);
    setShowMentionPopup(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const onEmojiClick = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
  };

  const onGifClick = (gifUrl) => {
    // Send GIF as a message (you might want to handle this differently on backend, e.g. type: 'image')
    // For now, sending as text URL
    handleSendMessage(gifUrl);
  };

  const getFilteredParticipants = () => {
    if (!mentionSearch) return participants;
    return participants.filter(p => p.name.toLowerCase().includes(mentionSearch.toLowerCase()));
  };

  const renderMessageContent = (text) => {
    // Check if text is a GIF URL (simple check)
    if (text.startsWith('http') && (text.includes('giphy.com') || text.endsWith('.gif'))) {
      return <img src={text} alt="GIF" className="message-gif" />;
    }

    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="mention">{part}</span>;
      }
      return part;
    });
  };

  const isUserMentioned = (text) => {
    if (!user) return false;
    return text.includes(`@${user.name}`);
  };

  const getTypingText = () => {
    if (typingUsers.size === 0) return null;
    const typingNames = [];
    typingUsers.forEach(userId => {
      const participant = participants.find(p => p.id === userId);
      if (participant) {
        typingNames.push(participant.name);
      }
    });
    if (typingNames.length === 0) return null;
    if (typingNames.length === 1) {
      return `${typingNames[0]} está digitando...`;
    } else if (typingNames.length <= 3) {
      return `${typingNames.join(", ")} estão digitando...`;
    } else {
      return `Várias pessoas estão digitando...`;
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header-nav">
        <button onClick={() => navigate('/')} className="back-button">
          ← Voltar para o dashboard
        </button>
        <div className="mobile-tabs">
          <button
            className={`mobile-tab ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => setActiveTab('participants')}
          >
            Participantes
          </button>
          <button
            className={`mobile-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
          <button
            className={`mobile-tab ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            Salas
          </button>
        </div>
      </div>

      <div className="chat-layout">
        {/* LEFT SIDEBAR - PARTICIPANTS */}
        <div className={`chat-sidebar-left ${activeTab === 'participants' ? 'mobile-visible' : ''}`}>
          <div className="sidebar-header">
            <h3>Participantes</h3>
            <button className="search-icon-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </div>
          <div className="participants-list">
            {participants.map((p) => (
              <div key={p.id} className={`participant-item ${p.active ? 'online' : 'offline'}`} onClick={() => handleParticipantClick(p)}>
                <div className="avatar-wrapper">
                  <Avatar className="participant-avatar" {...genConfig(p.name)} />
                  {p.active && <div className="online-indicator"></div>}
                </div>
                <span className="participant-name">{p.name} {p.id === user?.id && '(Você)'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div className={`chat-main ${activeTab === 'chat' ? 'mobile-visible' : ''}`}>
          <div className="chat-room-header">
            <h2>Chat Room</h2>
            <span className="created-by">ID: <strong>{roomId}</strong></span>
          </div>

          <div className="messages-list">
            {messages.map((msg, index) => (
              <div key={index} className={`message-item ${msg.userId === user?.id ? 'my-message' : ''} ${isUserMentioned(msg.text) ? 'mentioned' : ''} ${msg.isPrivate ? 'private-message' : ''}`}>
                <Avatar className="message-avatar" {...msg.avatarConfig} />
                <div className="message-content">
                  <div className="message-user">
                    {msg.user}
                    <span className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.isPrivate && <span className="private-tag">🔒 Privado {msg.userId === user?.id ? `para ${msg.destinationName}` : 'para você'}</span>}
                  </div>
                  <div className="message-text">{renderMessageContent(msg.text)}</div>
                </div>
              </div>
            ))}
            {getTypingText() && (
              <div className="typing-status">{getTypingText()}</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={`chat-input-area ${privateRecipient ? 'private-mode' : ''}`} style={{ position: 'relative' }}>

            {/* Pickers Container */}
            {(showEmojiPicker || showGifPicker) && (
              <div className="picker-container" ref={pickerRef}>
                {showEmojiPicker && (
                  <EmojiPicker onEmojiClick={onEmojiClick} width="100%" height="350px" />
                )}
                {showGifPicker && (
                  <div className="gif-picker">
                    <input
                      type="text"
                      placeholder="Buscar GIFs..."
                      value={gifSearch}
                      onChange={(e) => setGifSearch(e.target.value)}
                      className="gif-search-input"
                    />
                    <div className="gif-grid">
                      {filteredGifs.map((gif, index) => (
                        <img
                          key={index}
                          src={gif.url}
                          alt="GIF"
                          onClick={() => onGifClick(gif.url)}
                          className="gif-item"
                        />
                      ))}
                      {filteredGifs.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', padding: '20px' }}>
                          Nenhum GIF encontrado
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showMentionPopup && (
              <div className="mention-popup">
                {getFilteredParticipants().map(p => (
                  <div key={p.id} className="mention-option" onClick={() => insertMention(p.name)}>
                    <div className="avatar-wrapper">
                      <Avatar className="participant-avatar" {...genConfig(p.name)} style={{ width: 24, height: 24 }} />
                    </div>
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="input-header">
              {privateRecipient ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: '#ffcc00' }}>🔒 Mensagem privada para {privateRecipient.name}</span>
                  <button onClick={cancelPrivateMode} className="cancel-private">Cancelar</button>
                </div>
              ) : (
                <span>Enviando mensagem...</span>
              )}
              <div className="input-actions">
                <span
                  className="action-icon"
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowGifPicker(false);
                  }}
                >
                  😊
                </span>
                <span
                  className="action-icon"
                  onClick={() => {
                    setShowGifPicker(!showGifPicker);
                    setShowEmojiPicker(false);
                  }}
                >
                  🖼️
                </span>
              </div>
            </div>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder={privateRecipient ? `Mensagem privada para ${privateRecipient.name}...` : "Escreva aqui uma mensagem maneira para mandar para os colegas..."}
                value={message}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
              />
              <button className="send-btn" onClick={() => handleSendMessage()}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR - ROOMS */}
        <div className={`chat-sidebar-right ${activeTab === 'rooms' ? 'mobile-visible' : ''}`}>
          {similarRooms.map((r, index) => (
            <div key={r.id || index} className="room-item" onClick={() => {
              navigate(`/room/${r.id}`);
              window.location.reload();
            }}>
              <div className="room-name">{r.name}</div>
              <div className="room-info">
                {r.count} pessoas
                {r.tags && r.tags.length > 0 && <span className="room-tags"> • {r.tags.slice(0, 2).join(', ')}</span>}
              </div>
            </div>
          ))}
          {similarRooms.length === 0 && (
            <div className="no-rooms">Nenhuma sala similar encontrada.</div>
          )}
        </div>
      </div>
    </div>
  );
}
