import { useSocket } from "../hooks/socket-hook";
import { useRoom } from "../hooks/room-hook";
import LoginModal from "../shared/LoginModal";
import "./forum.css";
import { useEffect, useState } from "react"; 
import { useAuth } from "../hooks/auth-hook";
import Avatar, { genConfig } from 'react-nice-avatar';

export default function Forum() {
 const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newForum, setNewForum] = useState({ nome: '', descricao: '' });
  const [user, setUser] = useState({ name: "João" }); // Simulação
  const {rooms,join,getRooms} = useRoom()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const {signed} = useAuth()
  const {socket,isConnected,connect} = useSocket()
  const [forums, setForums] = useState(rooms);

  useEffect( ()=>{

    getRooms()
  },[])

  useEffect(() => {
     }, [rooms])

  const filteredForums = rooms ? rooms.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

    const handleCreateForum = () => {
    if (!newForum.nome.trim()) {
      alert("O nome do fórum é obrigatório!");
      return;
    }
    // TODO: Implement create call from context
    /*
    const novoForum = {
      titulo: newForum.nome,
      criador: user ? user.name : "Usuário", //nome do usuário logado
      pessoas: "+1 pessoa", // Começa com 1 participante
      descricao: newForum.descricao
    };

    setForums([novoForum, ...forums]); // Adiciona no início
    */
    setNewForum({ nome: '', descricao: '' });
    setShowCreateModal(false);
    alert("Fórum criado com sucesso!");
  };


  return (
    
    
    <div className="forum-wrapper">
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <div className="forum-header">
        <h1 onClick={() => isConnected ? join('84e597c7-9002-4ca5-aec1-c2ff770e7638', socket.id) : console.log("desconectado")}>Opa!</h1>
        <h2>Sobre o que gostaria de falar hoje?</h2>

        <div className="forum-search-area">
          <input
            type="text"
            placeholder="Em busca de uma sala? Encontre-a aqui"

            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-btn">→</button>
          <button 
            className="create-btn"
            onClick={() => user ? setShowCreateModal(true) : alert('Faça login para criar um fórum')}
          >
            Ou crie seu próprio 4um
            </button>
        </div>
      </div>

      <div className="forum-grid">
       {filteredForums.map((f, index) => (
          <div
            onClick={() => {
              if (socket?.id) {
                join(f.id, socket.id);
              } else {
                console.warn("Socket not connected");
              }
            }}
            key={index}
            className={`forum-card ${f.destaque ? "destaque" : ""}`}
          >
            {f.destaque && (
              <span className="destaque-text">Tópico em destaque!</span>
            )}

            <h3>{f.name}</h3>
            <p className="forum-subinfo">
              {f.owner?.name} • {f.users?.length || 0} pessoas
            </p>

            {f.description && <p className="forum-desc">{f.description}</p>}

            <p className="forum-creator">
                Criado por: <strong>{f.owner?.name}</strong>
            </p>

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
        ))}
      </div>
    { /* MODAL DE CRIAR FÓRUM */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Criar Novo Fórum</h3>
            <input 
              placeholder="Nome do fórum"
              value={newForum.nome}
              onChange={(e) => setNewForum({...newForum, nome: e.target.value})}
            />
            <textarea 
              placeholder="Descrição (opcional)"
              value={newForum.descricao}
              onChange={(e) => setNewForum({...newForum, descricao: e.target.value})}
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