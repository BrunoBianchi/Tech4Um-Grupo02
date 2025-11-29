import { useSocket } from "../hooks/socket-hook";
import { useRoom } from "../hooks/room-hook";
import LoginModal from "../shared/LoginModal";
import Dropdown from "../shared/Dropdown";
import "./forum.css";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../hooks/auth-hook";
import Avatar, { genConfig } from 'react-nice-avatar';
import { useNavigate } from 'react-router-dom';

export default function Forum() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newForum, setNewForum] = useState({ nome: '', descricao: '', tags: '' });

  // Filter states
  const [orderBy, setOrderBy] = useState('popularity');
  const [orderDirection, setOrderDirection] = useState('DESC');
  const [ownerFilter, setOwnerFilter] = useState('');

  const { rooms, join, getRooms, create } = useRoom()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { signed, user } = useAuth()
  const { socket, isConnected, connect } = useSocket()
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const observer = useRef();

  const loadMore = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    const currentLength = rooms ? rooms.length : 0;
    try {
      const count = await getRooms(currentLength, 6, selectedTag, orderBy, orderDirection, ownerFilter);
      if (count < 6) setHasMore(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [rooms, getRooms, isLoading, selectedTag, orderBy, orderDirection, ownerFilter]);

  const lastForumElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && rooms && rooms.length > 0) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadMore, rooms]);

  useEffect(() => {
    setHasMore(true);
    getRooms(0, 6, selectedTag, orderBy, orderDirection, ownerFilter).then(count => {
      if (count < 6) setHasMore(false);
    });
  }, [selectedTag, orderBy, orderDirection, ownerFilter]);

  useEffect(() => {
  }, [rooms]);

  const filteredForums = rooms ? rooms.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const handleCreateForum = async () => {
    if (!newForum.nome.trim()) {
      alert("O nome do fórum é obrigatório!");
      return;
    }

    try {
      const tagsArray = newForum.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      const newRoom = await create(newForum.nome, newForum.descricao, tagsArray);
      setShowCreateModal(false);
      setNewForum({ nome: '', descricao: '', tags: '' });

      if (newRoom && newRoom.id) {
        if (socket?.id) {
          join(newRoom.id, socket.id);
        }
        navigate(`/room/${newRoom.id}`);
      }
    } catch (error) {
      console.error("Erro ao criar sala:", error);
      alert("Erro ao criar sala. Tente novamente.");
    }
  };

  const handleTagClick = (tag, e) => {
    e.stopPropagation();
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    }
  };

  return (
    <div className="forum-wrapper">
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <div className="forum-header">
        <h1 onClick={() => isConnected ? join('84e597c7-9002-4ca5-aec1-c2ff770e7638', socket.id) : console.log("desconectado")}>Opa!</h1>
        <h2>Sobre o que gostaria de falar hoje?</h2>

        <div className="forum-search-area">
          <div className="search-box">
            <input
              type="text"
              placeholder="Busque por nome "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <button
            className="create-btn"
            onClick={() => user ? setShowCreateModal(true) : alert('Faça login para criar um fórum')}
          >
            <span>+</span> Criar novo 4um
          </button>
        </div>

        <div className="filters-area">
          <Dropdown
            options={[
              { value: 'popularity', label: 'Popularidade' },
              { value: 'date', label: 'Data' },
              { value: 'owner', label: 'Dono' }
            ]}
            value={orderBy}
            onChange={setOrderBy}
          />

          <Dropdown
            options={[
              { value: 'DESC', label: 'Decrescente' },
              { value: 'ASC', label: 'Crescente' }
            ]}
            value={orderDirection}
            onChange={setOrderDirection}
          />

          <input
            type="text"
            placeholder="Filtrar por ID do dono"
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="filter-input"
          />
        </div>

        {selectedTag && (
          <div className="filter-reminder">
            <span>Filtrando por: <strong>#{selectedTag}</strong></span>
            <button onClick={() => setSelectedTag(null)} className="clear-filter-btn">✕</button>
          </div>
        )}
      </div>

      <div className="forum-grid">
        {filteredForums.map((f, index) => {
          const isFeatured = index === 0;
          return (
            <div
              ref={filteredForums.length === index + 1 ? lastForumElementRef : null}
              onClick={() => {
                if (!user) {
                  setIsLoginModalOpen(true);
                  return;
                }
                if (socket?.id) {
                  join(f.id, socket.id);
                  navigate(`/room/${f.id}`);
                } else {
                  console.warn("Socket not connected");
                }
              }}
              key={index}
              className={`forum-card ${isFeatured ? "featured" : ""}`}
            >
              {isFeatured && (
                <div className="destaque-header">
                  <span className="destaque-text">Tópico em destaque</span>
                  <img src="https://em-content.zobj.net/source/noto-emoji-animations/344/fire_1f525.gif" alt="Fire" />
                </div>
              )}

              <h3>{f.name}</h3>
              <p className="forum-subinfo">
                {f.owner?.name} • {f.users?.length || 0} pessoas
              </p>

              {f.description && <p className="forum-desc">{f.description}</p>}

              <p className="forum-creator">
                Criado por: <strong>{f.owner?.name}</strong>
              </p>

              {f.tags && f.tags.length > 0 && (
                <div className="forum-tags">
                  {f.tags.map((t, i) => (
                    <span
                      key={i}
                      className={`forum-tag ${selectedTag === t ? 'active' : ''}`}
                      onClick={(e) => handleTagClick(t, e)}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="forum-avatars-stack">
                {f.users?.slice(0, 3).map((u, i) => (
                  <Avatar
                    key={i}
                    className="forum-avatar"
                    {...genConfig(u.name)}
                  />
                ))}
                {(f.users?.length || 0) > 3 && (
                  <div className="forum-avatar-count">
                    +{(f.users?.length || 0) - 3}
                  </div>
                )}
                {(!f.users || f.users.length === 0) && (
                  <div className="forum-avatar-count">0</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      { /* MODAL DE CRIAR FÓRUM */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Criar Novo Fórum</h3>
            <input
              placeholder="Nome do fórum"
              value={newForum.nome}
              onChange={(e) => setNewForum({ ...newForum, nome: e.target.value })}
            />
            <input
              placeholder="Tags (separadas por vírgula)"
              value={newForum.tags}
              onChange={(e) => setNewForum({ ...newForum, tags: e.target.value })}
            />
            <textarea
              placeholder="Descrição (opcional)"
              value={newForum.descricao}
              onChange={(e) => setNewForum({ ...newForum, descricao: e.target.value })}
              rows="4"
            />
            <div className="modal-actions">
              <button onClick={() => setShowCreateModal(false)}>Cancelar</button>
              <button onClick={handleCreateForum}>Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}