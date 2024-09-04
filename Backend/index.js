const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const uuid = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// In-memory game state
const games = new Map();
const players = new Map();

// Sample card data (expand this as needed)
const cardData = [
    { id: 1, name: "Cosmic Cadet", attack: 1, defense: 2 },
    { id: 2, name: "Asteroid Miner", attack: 2, defense: 3 },
    { id: 3, name: "Quantum Physicist", attack: 2, defense: 4 },
    // Add more cards...
];

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('register', (username) => {
        const playerId = uuid.v4();
        players.set(playerId, { id: playerId, username, socket });
        socket.emit('registered', { playerId, username });
    });

    socket.on('create_game', () => {
        const gameId = uuid.v4();
        games.set(gameId, { 
            id: gameId, 
            players: [], 
            state: 'waiting',
            currentTurn: null,
            board: {}
        });
        socket.emit('game_created', gameId);
    });

    socket.on('join_game', ({ gameId, playerId }) => {
        const game = games.get(gameId);
        const player = players.get(playerId);
        if (game && player && game.players.length < 2) {
            game.players.push(player);
            if (game.players.length === 2) {
                game.state = 'playing';
                game.currentTurn = game.players[0].id;
                io.to(gameId).emit('game_started', { 
                    gameState: game,
                    hands: {
                        [game.players[0].id]: dealInitialHand(),
                        [game.players[1].id]: dealInitialHand()
                    }
                });
            }
            socket.join(gameId);
            io.to(gameId).emit('player_joined', { username: player.username, playerId: player.id });
        }
    });

    socket.on('play_card', ({ gameId, playerId, cardId, position }) => {
        const game = games.get(gameId);
        if (game && game.currentTurn === playerId) {
            // Implement card playing logic here
            game.board[position] = cardId;
            game.currentTurn = game.players.find(p => p.id !== playerId).id;
            io.to(gameId).emit('card_played', { playerId, cardId, position });
            io.to(gameId).emit('turn_changed', game.currentTurn);
        }
    });

    socket.on('end_turn', ({ gameId, playerId }) => {
        const game = games.get(gameId);
        if (game && game.currentTurn === playerId) {
            game.currentTurn = game.players.find(p => p.id !== playerId).id;
            io.to(gameId).emit('turn_changed', game.currentTurn);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        // Implement logic to handle player disconnection
    });
});

function dealInitialHand() {
    // Simple logic to deal a random initial hand
    return cardData.sort(() => 0.5 - Math.random()).slice(0, 5);
}

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
