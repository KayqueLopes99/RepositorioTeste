document.addEventListener('DOMContentLoaded', () => {

    // --- Ícones e Emojis ---
    const OCEAN_LIFE = ['🐠', '🦀', '🐢', '🐙', '⭐️', '🐬'];
    const POLLUTION = ['🧴', '🗑️', '🥤'];
    const ALL_PIECES = [...OCEAN_LIFE, ...POLLUTION];

    // --- Configurações do Jogo ---
    const BOARD_SIZE = 12;
    const STARTING_MOVES = 50;
    const STARTING_SHUFFLES = 3;

    // --- Variáveis de Estado do Jogo ---
    let board = [];
    let selectedPiece = null;
    let moves = STARTING_MOVES;
    let oceanCleanliness = 0;
    let shuffles = STARTING_SHUFFLES;
    let isProcessing = false;
    let gameState = 'start'; // 'start', 'playing', 'win', 'lose'

    // --- Elemento Principal da Aplicação ---
    const app = document.getElementById('app');
    app.className = 'game-background';

    // --- Funções de Lógica do Jogo ---
    const createBoard = () => {
        const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                let piece;
                do {
                    piece = ALL_PIECES[Math.floor(Math.random() * ALL_PIECES.length)];
                } while (
                    (c >= 2 && piece === newBoard[r][c - 1] && piece === newBoard[r][c - 2]) ||
                    (r >= 2 && piece === newBoard[r - 1][c] && piece === newBoard[r - 2][c])
                );
                newBoard[r][c] = piece;
            }
        }
        return newBoard;
    };

    const checkMatches = (currentBoard) => {
        const matches = new Set();
        // Checar linhas horizontais
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE - 2; c++) {
                if (currentBoard[r][c] && currentBoard[r][c] === currentBoard[r][c + 1] && currentBoard[r][c] === currentBoard[r][c + 2]) {
                    for (let i = 0; i < 3; i++) matches.add(`${r}-${c + i}`);
                }
            }
        }
        // Checar linhas verticais
        for (let r = 0; r < BOARD_SIZE - 2; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (currentBoard[r][c] && currentBoard[r][c] === currentBoard[r + 1][c] && currentBoard[r][c] === currentBoard[r + 2][c]) {
                    for (let i = 0; i < 3; i++) matches.add(`${r + i}-${c}`);
                }
            }
        }
        return Array.from(matches);
    };

    const processTurn = async (currentBoard) => {
        isProcessing = true;
        let boardToProcess = currentBoard.map(row => [...row]);

        while (true) {
            const matches = checkMatches(boardToProcess);
            if (matches.length === 0) break;

            let pollutionCleared = 0;
            let lifeCleared = 0;
            matches.forEach(coord => {
                const [r, c] = coord.split('-').map(Number);
                if (POLLUTION.includes(boardToProcess[r][c])) pollutionCleared++;
                else lifeCleared++;
            });
            
            oceanCleanliness = Math.min(100, oceanCleanliness + (pollutionCleared * 2) + (lifeCleared * 0.5));
            updateHUD();

            matches.forEach(coord => {
                const [r, c] = coord.split('-').map(Number);
                boardToProcess[r][c] = null;
            });
            board = [...boardToProcess];
            renderBoard();
            await new Promise(res => setTimeout(res, 300));

            // Queda das peças
            for (let c = 0; c < BOARD_SIZE; c++) {
                let emptyRow = BOARD_SIZE - 1;
                for (let r = BOARD_SIZE - 1; r >= 0; r--) {
                    if (boardToProcess[r][c]) {
                        if (r !== emptyRow) {
                            [boardToProcess[emptyRow][c], boardToProcess[r][c]] = [boardToProcess[r][c], null];
                        }
                        emptyRow--;
                    }
                }
            }
            board = [...boardToProcess];
            renderBoard();
            await new Promise(res => setTimeout(res, 200));

            // Preencher espaços vazios
            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    if (!boardToProcess[r][c]) {
                        boardToProcess[r][c] = ALL_PIECES[Math.floor(Math.random() * ALL_PIECES.length)];
                    }
                }
            }
            board = [...boardToProcess];
            renderBoard();
            await new Promise(res => setTimeout(res, 200));
        }
        isProcessing = false;
        checkGameState();
    };

    const handlePieceClick = async (r, c) => {
        if (isProcessing || gameState !== 'playing' || !board[r][c]) return;

        if (selectedPiece) {
            const [sr, sc] = selectedPiece;
            const isAdjacent = Math.abs(sr - r) + Math.abs(sc - c) === 1;
            
            // Remove a classe 'selected' da peça anterior
            const prevSelectedElement = document.querySelector(`.piece[data-r='${sr}'][data-c='${sc}']`);
            if (prevSelectedElement) prevSelectedElement.classList.remove('selected');

            selectedPiece = null;

            if (isAdjacent) {
                const newBoard = board.map(row => [...row]);
                [newBoard[sr][sc], newBoard[r][c]] = [newBoard[r][c], newBoard[sr][sc]];

                moves--;
                board = newBoard;
                renderBoard(); // Mostra a troca
                updateHUD();

                if (checkMatches(newBoard).length > 0) {
                    await processTurn(newBoard);
                } else {
                    // Se não houver combinação, desfaz a troca
                    await new Promise(res => setTimeout(res, 300));
                    [newBoard[sr][sc], newBoard[r][c]] = [newBoard[r][c], newBoard[sr][sc]]; // Troca de volta
                    board = newBoard;
                    renderBoard();
                }
            }
        } else {
            selectedPiece = [r, c];
            const currentSelectedElement = document.querySelector(`.piece[data-r='${r}'][data-c='${c}']`);
            if(currentSelectedElement) currentSelectedElement.classList.add('selected');
        }
    };
    
    const shuffleBoard = () => {
        if (isProcessing || gameState !== 'playing' || shuffles <= 0) return;
        shuffles--;
        moves--;
        board = createBoard();
        renderBoard();
        updateHUD();
    };

    const restartGame = () => {
        gameState = 'playing';
        moves = STARTING_MOVES;
        oceanCleanliness = 0;
        shuffles = STARTING_SHUFFLES;
        selectedPiece = null;
        isProcessing = false;
        board = createBoard();
        renderGameUI();
    };

    const checkGameState = () => {
        if (gameState !== 'playing') return;
        if (oceanCleanliness >= 100) {
            gameState = 'win';
            showGameEndModal('Parabéns!', 'Você limpou o oceano!');
        } else if (moves <= 0) {
            gameState = 'lose';
            showGameEndModal('Fim de Jogo!', 'Faltou pouco para limpar tudo.');
        }
    };

    // --- Funções de Renderização (Atualização do DOM) ---
    const renderBoard = () => {
        const boardElement = document.querySelector('.board');
        if (!boardElement) return;

        boardElement.innerHTML = '';
        board.forEach((row, r) => {
            row.forEach((piece, c) => {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'piece';
                pieceElement.dataset.r = r;
                pieceElement.dataset.c = c;
                pieceElement.innerHTML = `<span>${piece || ''}</span>`;
                
                if (selectedPiece && selectedPiece[0] === r && selectedPiece[1] === c) {
                    pieceElement.classList.add('selected');
                }

                pieceElement.addEventListener('click', () => handlePieceClick(r, c));
                boardElement.appendChild(pieceElement);
            });
        });
    };
    
    const updateHUD = () => {
        const movesSpan = document.getElementById('moves-count');
        const shuffleBtn = document.getElementById('shuffle-btn');
        const cleanlinessSpan = document.getElementById('cleanliness-percent');
        const progressBar = document.getElementById('progress-bar');

        if(movesSpan) movesSpan.textContent = moves;
        if(shuffleBtn) {
             shuffleBtn.textContent = `Trocar (${shuffles})`;
             shuffleBtn.disabled = isProcessing || shuffles <= 0 || gameState !== 'playing';
        }
        if(cleanlinessSpan) cleanlinessSpan.textContent = `${oceanCleanliness.toFixed(0)}%`;
        if(progressBar) progressBar.style.width = `${oceanCleanliness}%`;
    };

    const renderGameUI = () => {
        app.innerHTML = `
            <div class="game-area">
                <div class="hud">
                    <div class="hud-header">
                        <span>Movimentos: <span id="moves-count">${moves}</span></span>
                        <button id="shuffle-btn" class="button-shuffle">Trocar (${shuffles})</button>
                        <div class="hud-cleanliness">
                            <span>Limpeza: <span id="cleanliness-percent">${oceanCleanliness.toFixed(0)}%</span></span>
                            <button id="info-btn" class="info-button">
                                <svg style="height: 1.75rem; width: 1.75rem;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                    <div class="progress-bar-container">
                        <div id="progress-bar" class="progress-bar" style="width: ${oceanCleanliness}%"></div>
                    </div>
                </div>
                <main class="board" style="grid-template-columns: repeat(${BOARD_SIZE}, 1fr); grid-template-rows: repeat(${BOARD_SIZE}, 1fr);"></main>
            </div>
        `;
        renderBoard();
        
        document.getElementById('shuffle-btn').addEventListener('click', shuffleBoard);
        document.getElementById('info-btn').addEventListener('click', showInfoModal);
    };

    const showInfoModal = () => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">ODS 14: Vida na Água</h2>
                    <button class="modal-close-btn">&times;</button>
                </div>
                <p style="margin-bottom: 1rem;">Conservar e usar de forma sustentável os oceanos, os mares e os recursos marinhos.</p>
                <div class="instructions modal-instructions">
                    <h3 class="instructions-title">Como Jogar?</h3>
                    <ul class="instructions-list modal-list">
                        <li>Troque peças adjacentes para formar linhas de 3 ou mais.</li>
                        <li>Combine <b>poluição</b> (🧴, 🗑️) para limpar o oceano mais rápido.</li>
                        <li>Use o botão <b>Trocar</b> se não houver mais jogadas (custa 1 movimento).</li>
                        <li>Seu objetivo é alcançar <b>100% de limpeza</b> antes que os movimentos acabem!</li>
                    </ul>
                </div>
                <button class="button-modal">Continuar Jogo</button>
            </div>
        `;
        
        const closeModal = () => document.body.removeChild(modal);
        modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
        modal.querySelector('.button-modal').addEventListener('click', closeModal);
        document.body.appendChild(modal);
    };

    const showGameEndModal = (title, message) => {
        const boardElement = document.querySelector('.board');
        if (!boardElement) return;

        const overlay = document.createElement('div');
        overlay.className = 'game-end-overlay';
        overlay.innerHTML = `
            <h2>${title}</h2>
            <p>${message}</p>
            <button class="button-restart">Jogar Novamente</button>
        `;
        overlay.querySelector('.button-restart').addEventListener('click', restartGame);
        boardElement.appendChild(overlay);
    };

    const renderStartScreen = () => {
        app.innerHTML = `
            <div class="start-screen">
                <h1 class="title-main">Joguinho ODS 14</h1>
                <h2 class="subtitle">Limpeza do Oceano</h2>
                <div class="instructions">
                    <h3 class="instructions-title">Como Jogar?</h3>
                    <ul class="instructions-list">
                        <li>Troque peças adjacentes para formar linhas de 3 ou mais itens iguais.</li>
                        <li>O objetivo principal é combinar a <b>poluição</b> (🧴, 🗑️, 🥤).</li>
                        <li><b>Dica:</b> Combinar poluição limpa o oceano <b>muito mais rápido</b>!</li>
                        <li>Ficou sem jogadas? Use o botão <b>Trocar</b> para embaralhar o tabuleiro! (Custa um movimento).</li>
                        <li>Alcance <b>100% de limpeza</b> antes que os movimentos acabem!</li>
                    </ul>
                </div>
                <button id="start-btn" class="button-start">Começar a Limpeza!</button>
            </div>
        `;
        document.getElementById('start-btn').addEventListener('click', restartGame);
    };

    // --- Inicia o Jogo ---
    renderStartScreen();
});