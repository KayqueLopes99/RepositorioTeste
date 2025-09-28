import React, { useState, useCallback, useEffect } from 'react';

// --- Ícones e Emojis ---
const OCEAN_LIFE = ['🐠', '🦀', '🐢', '🐙', '⭐️', '🐬'];
const POLLUTION = ['🧴', '🗑️', '🥤'];
const ALL_PIECES = [...OCEAN_LIFE, ...POLLUTION];

// --- Configurações do Jogo ---
const BOARD_SIZE = 12;
const STARTING_MOVES = 50;
const STARTING_SHUFFLES = 3;

// --- Componentes da UI ---
const InfoIcon = () => (
    <svg style={{ height: '1.75rem', width: '1.75rem' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>
);

const StartScreen = ({ onStart }) => (
    <div className="start-screen">
        <h1 className="title-main">Joguinho ODS 14</h1>
        <h2 className="subtitle">Limpeza do Oceano</h2>
        <div className="instructions">
            <h3 className="instructions-title">Como Jogar?</h3>
            <ul className="instructions-list">
                <li>Troque peças adjacentes para formar linhas de 3 ou mais itens iguais.</li>
                <li>O objetivo principal é combinar a <b>poluição</b> (🧴, 🗑️, 🥤).</li>
                <li><b>Dica:</b> Combinar poluição limpa o oceano <b>muito mais rápido</b>!</li>
                <li>Ficou sem jogadas? Use o botão <b>Trocar</b> para embaralhar o tabuleiro! (Custa um movimento).</li>
                <li>Alcance <b>100% de limpeza</b> antes que os movimentos acabem!</li>
            </ul>
        </div>
        <button onClick={onStart} className="button-start">
            Começar a Limpeza!
        </button>
    </div>
);

const InfoModal = ({ onClose }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <div className="modal-header">
                <h2 className="modal-title">ODS 14: Vida na Água</h2>
                <button onClick={onClose} className="modal-close-btn">&times;</button>
            </div>
            <p style={{ marginBottom: '1rem' }}>Conservar e usar de forma sustentável os oceanos, os mares e os recursos marinhos.</p>
            <div className="instructions modal-instructions">
                <h3 className="instructions-title">Como Jogar?</h3>
                <ul className="instructions-list modal-list">
                    <li>Troque peças adjacentes para formar linhas de 3 ou mais.</li>
                    <li>Combine <b>poluição</b> (🧴, 🗑️) para limpar o oceano mais rápido.</li>
                    <li>Use o botão <b>Trocar</b> se não houver mais jogadas (custa 1 movimento).</li>
                    <li>Seu objetivo é alcançar <b>100% de limpeza</b> antes que os movimentos acabem!</li>
                </ul>
            </div>
            <button onClick={onClose} className="button-modal">Continuar Jogo</button>
        </div>
    </div>
);

const GameEndModal = ({ title, message, onRestart }) => (
     <div className="game-end-overlay">
      <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{title}</h2>
      <p style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>{message}</p>
      <button onClick={onRestart} className="button-restart">Jogar Novamente</button>
    </div>
);

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

export default function App() {
    const [board, setBoard] = useState(createBoard);
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [moves, setMoves] = useState(STARTING_MOVES);
    const [oceanCleanliness, setOceanCleanliness] = useState(0);
    const [shuffles, setShuffles] = useState(STARTING_SHUFFLES);
    const [showInfo, setShowInfo] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [gameState, setGameState] = useState('start');

    useEffect(() => {
        if (gameState !== 'playing') return;
        if (oceanCleanliness >= 100) {
            setGameState('win');
        } else if (moves <= 0 && !isProcessing) {
            setGameState('lose');
        }
    }, [oceanCleanliness, moves, gameState, isProcessing]);

    const checkMatches = useCallback((currentBoard) => {
        const matches = new Set();
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE - 2; c++) {
                if (currentBoard[r][c] && currentBoard[r][c] === currentBoard[r][c + 1] && currentBoard[r][c] === currentBoard[r][c + 2]) {
                    for(let i=0; i<3; i++) matches.add(`${r}-${c+i}`);
                }
            }
        }
        for (let r = 0; r < BOARD_SIZE - 2; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (currentBoard[r][c] && currentBoard[r][c] === currentBoard[r + 1][c] && currentBoard[r][c] === currentBoard[r + 2][c]) {
                   for(let i=0; i<3; i++) matches.add(`${r+i}-${c}`);
                }
            }
        }
        return Array.from(matches);
    }, []);

    const processTurn = useCallback(async (currentBoard) => {
        setIsProcessing(true);
        let boardToProcess = currentBoard.map(row => [...row]);

        while (true) {
            const matches = checkMatches(boardToProcess);
            if (matches.length === 0) break;

            let pollutionCleared = 0;
            let lifeCleared = 0;
            matches.forEach(coord => {
                const [r, c] = coord.split('-').map(Number);
                 if(POLLUTION.includes(boardToProcess[r][c])) pollutionCleared++;
                 else lifeCleared++;
            });
            setOceanCleanliness(prev => Math.min(100, prev + (pollutionCleared * 2) + (lifeCleared * 0.5)));

            matches.forEach(coord => {
                const [r, c] = coord.split('-').map(Number);
                boardToProcess[r][c] = null;
            });
            setBoard([...boardToProcess]);
            await new Promise(res => setTimeout(res, 300));

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
            setBoard([...boardToProcess]);
            await new Promise(res => setTimeout(res, 200));

            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    if (!boardToProcess[r][c]) {
                        boardToProcess[r][c] = ALL_PIECES[Math.floor(Math.random() * ALL_PIECES.length)];
                    }
                }
            }
            setBoard([...boardToProcess]);
            await new Promise(res => setTimeout(res, 200));
        }
        setIsProcessing(false);
    }, [checkMatches]);

    const handlePieceClick = async (r, c) => {
        if (isProcessing || gameState !== 'playing' || !board[r][c]) return;

        if (selectedPiece) {
            const [sr, sc] = selectedPiece;
            setSelectedPiece(null);

            const isAdjacent = Math.abs(sr - r) + Math.abs(sc - c) === 1;

            if (isAdjacent) {
                const newBoard = board.map(row => [...row]);
                [newBoard[sr][sc], newBoard[r][c]] = [newBoard[r][c], newBoard[sr][sc]];
                
                setMoves(m => m - 1);
                setBoard(newBoard);

                if (checkMatches(newBoard).length > 0) {
                    await processTurn(newBoard);
                } else {
                    await new Promise(res => setTimeout(res, 300));
                    setBoard(board);
                }
            }
        } else {
            setSelectedPiece([r, c]);
        }
    };
    
    const shuffleBoard = useCallback(() => {
        if (isProcessing || gameState !== 'playing' || shuffles <= 0) return;
        setShuffles(s => s - 1);
        setMoves(m => m - 1);
        setBoard(createBoard());
    }, [isProcessing, gameState, shuffles]);

    const restartGame = useCallback(() => {
        setGameState('playing');
        setBoard(createBoard());
        setMoves(STARTING_MOVES);
        setOceanCleanliness(0);
        setSelectedPiece(null);
        setIsProcessing(false);
        setShuffles(STARTING_SHUFFLES);
    }, []);

    const startGame = () => restartGame();
    
    // **AJUSTE PRINCIPAL:** Adicionada a propriedade 'width' para garantir que o contêiner ocupe a tela inteira.
    const gameContainerStyle = {
      width: '100vw',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      overflow: 'hidden',
    };

    const boardStyle = {
      display: 'grid',
      gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
      gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
      gap: '4px',
      padding: '8px',
      backgroundColor: 'rgba(30, 64, 175, 0.5)',
      borderRadius: '1rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      width: '90vmin',
      height: '90vmin',
      maxWidth: '500px',
      maxHeight: '500px',
      position: 'relative'
    };

    const pieceStyle = (r, c) => ({
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 'clamp(1rem, 4vmin, 2rem)',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'transform 0.2s ease-out, background-color 0.2s',
      backgroundColor: selectedPiece && selectedPiece[0] === r && selectedPiece[1] === c ? 'rgba(251, 191, 36, 0.5)' : 'transparent'
    });
    
    return (
        <div style={gameContainerStyle} className="game-background">
            <GameStyles /> 
            {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
            
            {gameState === 'start' && <StartScreen onStart={startGame} />}

            {gameState !== 'start' &&
                <div className="game-area">
                    <div className="hud">
                        <div className="hud-header">
                            <span>Movimentos: {moves}</span>
                            <button
                                onClick={shuffleBoard}
                                disabled={isProcessing || shuffles <= 0 || gameState !== 'playing'}
                                className="button-shuffle"
                            >
                                Trocar ({shuffles})
                            </button>
                            <div className="hud-cleanliness">
                               <span>Limpeza: {oceanCleanliness.toFixed(0)}%</span>
                               <button onClick={() => setShowInfo(true)} className="info-button">
                                    <InfoIcon />
                               </button>
                            </div>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${oceanCleanliness}%` }}></div>
                        </div>
                    </div>

                    <main style={boardStyle}>
                        {board.map((row, r) => row.map((piece, c) => (
                            <div key={`${r}-${c}`} 
                                 onClick={() => handlePieceClick(r, c)}
                                 style={pieceStyle(r, c)}
                                 className="piece"
                            >
                                <span>{piece}</span>
                            </div>
                        )))}
                        
                        {gameState === 'win' && <GameEndModal title="Parabéns!" message="Você limpou o oceano!" onRestart={restartGame} />}
                        {gameState === 'lose' && <GameEndModal title="Fim de Jogo!" message="Faltou pouco para limpar tudo." onRestart={restartGame} />}
                    </main>
                </div>
            }
        </div>
    );
}

const GameStyles = () => (
  <style>{`
    @keyframes fadeIn { 
      from { opacity: 0; transform: scale(0.95); } 
      to { opacity: 1; transform: scale(1); } 
    }
    
    .game-background {
      background-image: linear-gradient(to bottom, #22d3ee, #1e3a8a);
      font-family: sans-serif;
    }

    .start-screen {
      width: 100%;
      max-width: 32rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: white;
      text-align: center;
      padding: 2rem;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      border-radius: 1rem;
      animation: fadeIn 0.5s ease-out forwards;
    }
    .title-main {
        font-size: 2.25rem;
        font-weight: bold;
        color: #67e8f9;
        margin-bottom: 0.5rem;
    }
    .subtitle {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
    }
    .instructions {
        background-color: rgba(207, 250, 254, 0.2);
        border-left: 4px solid #22d3ee;
        padding: 1rem;
        border-top-right-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        text-align: left;
        margin-bottom: 2rem;
    }
    .instructions-title {
        font-weight: bold;
        font-size: 1.25rem;
        margin-bottom: 0.5rem;
    }
    .instructions-list {
        list-style-position: inside;
        list-style-type: disc;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .button-start {
        width: 100%;
        background-color: #f59e0b;
        color: white;
        font-weight: bold;
        padding: 1rem 2rem;
        border-radius: 0.75rem;
        transition: background-color 0.2s, transform 0.2s;
        font-size: 1.5rem;
        border: none;
        cursor: pointer;
    }
    .button-start:hover {
        background-color: #d97706;
        transform: scale(1.05);
    }

    .modal-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 50;
        padding: 1rem;
    }
    .modal-content {
        background-color: white;
        border-radius: 1rem;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
        padding: 1.5rem;
        max-width: 42rem;
        width: 100%;
        color: #374151;
        animation: fadeIn 0.3s ease-out forwards;
    }
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    .modal-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: #0891b2;
    }
    .modal-close-btn {
        color: #6b7280;
        font-size: 2rem;
        background: none;
        border: none;
        cursor: pointer;
    }
    .modal-instructions {
      border-color: #0891b2;
      background-color: #f0f9ff;
    }
    .modal-list { gap: 0.25rem; }
    .button-modal {
      margin-top: 1.5rem;
      width: 100%;
      background-color: #0891b2;
      color: white;
      font-weight: bold;
      padding: 0.75rem;
      border-radius: 0.5rem;
      transition: background-color 0.2s;
      border: none;
      cursor: pointer;
    }
    .button-modal:hover { background-color: #0e7490; }

    .game-end-overlay {
        position: absolute;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        animation: fadeIn 0.5s ease-out forwards;
        z-index: 20;
    }
    .button-restart {
        background-color: #f59e0b;
        color: white;
        font-weight: bold;
        padding: 0.75rem 2rem;
        border-radius: 0.75rem;
        transition: background-color 0.2s;
        border: none;
        cursor: pointer;
    }
    .button-restart:hover { background-color: #d97706; }
    
    .game-area {
        width: 100%;
        max-width: 42rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        animation: fadeIn 0.5s ease-out forwards;
    }
    .hud {
        width: 100%;
        padding: 1rem;
        background-color: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(8px);
        border-radius: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
        margin-bottom: 1rem;
        color: white;
    }
    .hud-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        font-weight: bold;
        font-size: 1.125rem;
    }
    .button-shuffle {
        background-color: #a855f7;
        color: white;
        font-weight: bold;
        padding: 0.25rem 0.75rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06);
        transition: all 0.2s;
        font-size: 0.875rem;
        border: none;
        cursor: pointer;
    }
    .button-shuffle:hover { background-color: #9333ea; }
    .button-shuffle:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
    .hud-cleanliness {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .info-button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      transition: color 0.2s;
    }
    .info-button:hover { color: #a5f3fc; }

    .progress-bar-container {
        width: 100%;
        background-color: rgba(156, 163, 175, 0.5);
        border-radius: 9999px;
        height: 1.25rem;
    }
    .progress-bar {
        background-image: linear-gradient(to right, #34d399, #14b8a6);
        height: 1.25rem;
        border-radius: 9999px;
        transition: width 0.5s ease-in-out;
    }
    
    .piece:hover {
      transform: scale(1.25);
    }
  `}</style>
);

