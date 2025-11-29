document.addEventListener('DOMContentLoaded', () => {
    // =========================================================
    // 1. CAPTURA DOS ELEMENTOS DOM
    // =========================================================
    const participantsBoard = document.getElementById('participantsBoard');
    const searchInput = document.getElementById('searchInput');
    const participantList = document.getElementById('participantList');
    const topicList = document.getElementById('topicList');

    const messagesContainer = document.querySelector('.messages-container');
    const topicNameElement = document.querySelector('.topic-header .topic-name');
    const topicMetaElement = document.querySelector('.topic-header .topic-meta');
    const privateIndicator = document.getElementById('privateIndicator');
    const typingStatusElement = document.querySelector('.user-typing-status');
    const headerAvatar = document.getElementById('headerAvatar');

    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');


    // =========================================================
    // 2. CONSTANTES E DADOS (PRONTO PARA INTEGRAÇÃO COM BACKEND)
    // =========================================================

    // ✅ NOTA PARA BACKEND: Esta constante DEVE ser definida pelo backend, 
    // com o nome do usuário logado (Ex: via EJS, Blade, ou uma chamada AJAX inicial).
    // O valor 'Lucas Pivoto' é um MOCK (simulação) para testes em ambiente estático.
    const MY_USER_NAME = 'Lucas Pivoto';

    const DEFAULT_TOPIC_KEY = 'Geral';

    let CHAT_DATA = {};
    let PARTICIPANT_NAMES = [];
    let TOPIC_KEYS = [];

    // ✅ NOTA PARA BACKEND: O backend deve fornecer uma lista completa 
    // de usuários (nome e URL de avatar) no carregamento.
    const USER_AVATARS = {
        [MY_USER_NAME]: 'images/avatars/lucas_pivoto.png',
        'Lara Alves': 'images/avatars/lara_alves.png',
        'Luiz Antonio Magalhães': 'images/avatars/luiz_antonio.png',
        'Fernanda Campos': 'images/avatars/fernanda_campos.png',
        'Ricardo Mendes': 'images/avatars/ricardo_mendes.png',
    };

    // =========================================================
    // 3. FUNÇÕES DE GERENCIAMENTO DE DADOS (LIMPAS PARA BACKEND)
    // =========================================================

    function addParticipant(name, avatarUrl) {
        if (PARTICIPANT_NAMES.includes(name)) return;

        PARTICIPANT_NAMES.push(name);

        if (!USER_AVATARS[name]) {
            USER_AVATARS[name] = avatarUrl || 'images/avatars/generic_user.png';
        }

        // Simulação de criação de chat privado (deve ser gerenciada pelo backend)
        CHAT_DATA[name] = {
            topic: name,
            meta: 'Conversa Privada',
            isPrivate: true,
            messages: [],
            avatarUrl: avatarUrl || 'images/avatars/generic_user.png'
        };
    }

    function createNewTopic(topicName) {
        const key = topicName.startsWith('#') || topicName === DEFAULT_TOPIC_KEY ? topicName : `#${topicName}`;
        const chatKey = topicName === DEFAULT_TOPIC_KEY ? DEFAULT_TOPIC_KEY : key;

        if (TOPIC_KEYS.includes(chatKey)) return;

        TOPIC_KEYS.push(chatKey);

        // Simulação de criação de chat de grupo (deve ser gerenciada pelo backend)
        CHAT_DATA[chatKey] = {
            topic: chatKey,
            meta: `Criado por: ${MY_USER_NAME} | Conversa em Grupo`,
            isPrivate: false,
            messages: [],
            avatarUrl: null
        };
    }

    function initializeForumsAndParticipants() {
        // ✅ PONTO DE INTEGRAÇÃO CRÍTICO: 
        // Esta função deve ser substituída por chamadas a APIs do backend (FETCH/AJAX)
        // que preencherão os arrays TOPIC_KEYS, PARTICIPANT_NAMES e o objeto CHAT_DATA.

        // MOCK/SIMULAÇÃO PARA TESTE ESTÁTICO:
        createNewTopic(DEFAULT_TOPIC_KEY);
        createNewTopic('product-development-stuff');
        createNewTopic('#Segurança');

        addParticipant('Lara Alves', 'images/avatars/lara_alves.png');
        addParticipant('Luiz Antonio Magalhães', 'images/avatars/luiz_antonio.png');
    }

    function filterParticipants() {
        if (!searchInput || !participantList) return;

        const searchTerm = searchInput.value.toLowerCase().trim();
        const items = participantList.querySelectorAll('.participant-item');

        items.forEach(item => {
            const nameElement = item.querySelector('.participant-name-text');
            if (nameElement) {
                const name = nameElement.textContent.toLowerCase();
                if (name.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            }
        });
    }

    // =========================================================
    // 4. FUNÇÕES DE RENDERIZAÇÃO DINÂMICA
    // =========================================================

    function createMessageHTML(message) {
        const messageClass = (message.author === MY_USER_NAME || message.type === 'outgoing') ? 'outgoing' : 'incoming';
        const avatarSrc = USER_AVATARS[message.author] || 'images/avatars/generic_user.png';

        return `
            <div class="message ${messageClass}">
                <span class="author">${message.author}</span>
                <div class="message-content">
                    <img src="${avatarSrc}" alt="Avatar de ${message.author}" class="message-avatar">
                    <p>${message.text}</p>
                </div>
            </div>
        `;
    }

    function updateChatArea(chatKey) {
        const data = CHAT_DATA[chatKey];

        if (!data) {
            console.error(`Dados não encontrados para a chave: ${chatKey}`);
            return;
        }

        if (messagesContainer) {
            messagesContainer.dataset.currentChatKey = chatKey;
        }

        if (topicNameElement) { topicNameElement.textContent = data.topic; }
        if (topicMetaElement) { topicMetaElement.textContent = data.meta; }
        if (typingStatusElement) { typingStatusElement.textContent = `Enviando para: ${data.topic}`; }

        if (headerAvatar) {
            if (data.isPrivate && data.avatarUrl) {
                headerAvatar.src = data.avatarUrl;
                headerAvatar.classList.remove('hidden');
            } else {
                headerAvatar.classList.add('hidden');
            }
        }

        if (privateIndicator) {
            if (data.isPrivate) {
                privateIndicator.classList.remove('hidden');
            } else {
                privateIndicator.classList.add('hidden');
            }
        }

        if (messagesContainer) {
            messagesContainer.innerHTML = '';
            const allMessagesHTML = data.messages.map(createMessageHTML).join('');
            messagesContainer.innerHTML = allMessagesHTML;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    function setActiveItem(clickedItem) {
        document.querySelectorAll('.participant-item, .topic-item').forEach(item => {
            item.classList.remove('active');
        });
        if (clickedItem) {
            clickedItem.classList.add('active');
        }
    }

    function togglePrivateMessageButton(clickedParticipantItem, show) {
        document.querySelectorAll('.private-message-btn').forEach(btn => {
            btn.classList.add('hidden');
        });

        if (show && clickedParticipantItem) {
            const privateBtn = clickedParticipantItem.querySelector('.private-message-btn');
            if (privateBtn) {
                privateBtn.classList.remove('hidden');
            }
        }
    }

    function renderParticipantsList() {
        if (!participantList) return;

        const filteredParticipants = PARTICIPANT_NAMES.filter(name => name !== MY_USER_NAME);

        const participantsHTML = filteredParticipants.map(name => {
            const avatarSrc = USER_AVATARS[name] || 'images/avatars/generic_user.png';

            return `
                <li class="participant-item" data-name="${name}">
                    <div class="participant-info">
                        <img src="${avatarSrc}" alt="Avatar de ${name}" class="participant-avatar">
                        <span class="participant-name-text">${name}</span>
                    </div>
                    <span class="private-message-btn hidden" data-target="${name}">Mandar Mensagem Privada</span>
                </li>
            `;
        }).join('');

        participantList.innerHTML = participantsHTML;
    }

    function renderTopicsList() {
        if (!topicList) return;

        const topicsHTML = TOPIC_KEYS.map((key, index) => {
            const data = CHAT_DATA[key];
            if (!data) return '';

            const isActive = index === 0 ? 'active' : '';
            const metaParts = data.meta.split('•');
            const metaText = metaParts.length > 1 ? metaParts.slice(1).join('•').trim() : 'Sem meta';
            const topicTitle = data.topic === DEFAULT_TOPIC_KEY ? data.topic : data.topic.replace('#', '');

            return `
                <li class="topic-item ${isActive}" data-chat-key="${key}">
                    <span class="topic-title">${topicTitle}</span>
                    <span class="topic-meta">${metaText}</span>
                </li>
            `;
        }).join('');

        topicList.innerHTML = topicsHTML;
    }


    // =========================================================
    // 5. ESCUTADORES DE EVENTOS
    // =========================================================

    if (searchInput) {
        searchInput.addEventListener('keyup', filterParticipants);
    }

    const topicListElement = document.querySelector('.topic-list');

    if (topicListElement) {
        topicListElement.addEventListener('click', (e) => {
            const topicItem = e.target.closest('.topic-item');

            if (topicItem) {
                const chatKey = topicItem.dataset.chatKey;

                if (!chatKey) return;

                setActiveItem(topicItem);
                togglePrivateMessageButton(null, false);
                updateChatArea(chatKey);
            }
        });
    }

    if (participantsBoard) {
        participantsBoard.addEventListener('click', (e) => {
            const participantItem = e.target.closest('.participant-item');
            const privateBtn = e.target.closest('.private-message-btn');

            if (!participantItem) return;

            if (privateBtn) {
                e.stopPropagation();
                const targetName = privateBtn.dataset.target;

                setActiveItem(participantItem);
                togglePrivateMessageButton(null, false);
                updateChatArea(targetName);
                return;
            }

            const isActive = participantItem.classList.contains('active');
            const isButtonVisible = participantItem.querySelector('.private-message-btn:not(.hidden)');

            if (isActive && isButtonVisible) {
                togglePrivateMessageButton(participantItem, false);
                setActiveItem(null);
            } else {
                setActiveItem(participantItem);
                togglePrivateMessageButton(participantItem, true);
            }
        });
    }

    if (sendButton) {
        sendButton.addEventListener('click', () => {
            const messageText = messageInput.value.trim();
            const currentChatName = messagesContainer.dataset.currentChatKey;

            if (messageText && currentChatName && CHAT_DATA[currentChatName]) {

                // ✅ PONTO DE INTEGRAÇÃO CRÍTICO: 
                // AQUI o código deve enviar a mensagem para o backend via WebSockets ou API
                // Exemplo: sendMessage(currentChatName, MY_USER_NAME, messageText);

                // MOCK/SIMULAÇÃO para que a mensagem apareça imediatamente no frontend
                CHAT_DATA[currentChatName].messages.push({
                    type: 'outgoing',
                    author: MY_USER_NAME,
                    text: messageText
                });

                updateChatArea(currentChatName);
                messageInput.value = '';
            }
        });

        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendButton.click();
                }
            });
        }
    }


    // 6. FUNÇÃO DE AUTO-RESIZE DA TEXTAREA
    const textarea = document.getElementById('messageInput');

    if (textarea) {
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 2 + 'px';
        });
        textarea.dispatchEvent(new Event('input'));
    }


    // =========================================================
    // 7. INICIALIZAÇÃO
    // =========================================================

    initializeForumsAndParticipants();
    renderParticipantsList();
    renderTopicsList();

    const defaultTopicItem = document.querySelector('.topic-list .topic-item.active');

    if (defaultTopicItem) {
        const defaultTopicKey = defaultTopicItem.dataset.chatKey;

        setActiveItem(defaultTopicItem);
        updateChatArea(defaultTopicKey);
    } else {
        updateChatArea(DEFAULT_TOPIC_KEY);
    }
});