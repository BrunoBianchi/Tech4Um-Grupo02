import "./forum.css";
import { useState } from "react"; 

export default function Forum() {
 const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newForum, setNewForum] = useState({ nome: '', descricao: '' });
  const [user, setUser] = useState({ name: "João" }); // Simulação
  const [forums, setForums] = useState([
    {
      destaque: true,
      titulo: "product-development-stuff",
      criador: "Lara Alves",
      pessoas: "+48 pessoas",
      descricao:
        "O que temos de bom nessa sala, pessoal? Bora falar de programação, criação de coisas legais e projetos pessoais e desafios que queiram compartilhar.",
    },
    {
      titulo: "gente-maneira-discutindo-tema-maneiro",
      criador: "Um Nome",
      pessoas: "+70 pessoas",
    },
    {
      titulo: "Thinking about...",
      criador: "Um Nome",
      pessoas: "+70 pessoas",
    },
    {
      titulo: "#segurança",
      criador: "Um Nome",
      pessoas: "+70 pessoas",
    },
    {
      titulo: "Manda um nome maneiro para esse 4um",
      criador: "Um Nome",
      pessoas: "+10 pessoas",
    },
    {
      titulo: "gamegamegame!",
      criador: "Um Nome",
      pessoas: "+70 pessoas",
    },
    {
      titulo: "E as férias?...",
      criador: "Um Nome",
      pessoas: "+70 pessoas",
    },
    {
      destaque: true,
      titulo: "Designers_na_firma",
      criador: "Lucas Gomes",
      pessoas: "+65 pessoas",
      descricao:
        "O que temos de bom nessa sala, pessoal? Bora falar de programação, criação de coisas legais e projetos pessoais e desafios que queiram compartilhar.",
    },
    {
      titulo: "Referências e Boas práticas",
      criador: "Um Nome",
      pessoas: "+70 pessoas",
    },
    {
      titulo: "Systemmmmm",
      criador: "Um Nome",
      pessoas: "+70 pessoas",
    },
    {
      titulo: "Tem_muita_coisa_...",
      criador: "Um Nome",
      pessoas: "+70 pessoas",
    },
  ]);

// Filtrar forums baseado na busca
  const filteredForums = forums.filter(f => 
    f.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.descricao && f.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

    // Função para criar novo fórum
    const handleCreateForum = () => {
    if (!newForum.nome.trim()) {
      alert("O nome do fórum é obrigatório!");
      return;
    }

    const novoForum = {
      titulo: newForum.nome,
      criador: user ? user.name : "Usuário", //nome do usuário logado
      pessoas: "+1 pessoa", // Começa com 1 participante
      descricao: newForum.descricao
    };

    setForums([novoForum, ...forums]); // Adiciona no início
    setNewForum({ nome: '', descricao: '' });
    setShowCreateModal(false);
    alert("Fórum criado com sucesso!");
  };


  return (
    <div className="forum-wrapper">
      <div className="forum-header">
        <h1>Opa!</h1>
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
            key={index}
            className={`forum-card ${f.destaque ? "destaque" : ""}`}
          >
            {f.destaque && (
              <span className="destaque-text">Tópico em destaque!</span>
            )}

            <h3>{f.titulo}</h3>
            <p className="forum-subinfo">
              {f.criador} {f.pessoas}
            </p>

            {f.descricao && <p className="forum-desc">{f.descricao}</p>}

            <p className="forum-creator">
                Criado por: <strong>{f.criador}</strong>
            </p>

            <div className="forum-circle">+115</div>
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