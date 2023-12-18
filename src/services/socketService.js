const playerService = require('@services/playerService');
const matchmakingService = require('@services/matchmakingService');
const lobbyService = require('@services/lobbyService');
const gameService = require('@services/gameService');

class SocketService {

    constructor(io) {
        this.io = io;
        this.registerObservers();
        this.setupSocketListeners();
    }

    registerObservers() {

        const matchmakingObservers = {
            onGameReadyCheck: this.onGameReadyCheck.bind(this),
            onInvalidCredentials: this.onInvalidCredentials.bind(this)
        };

        const gameObservers = {
             onGameStart: this.onGameStart.bind(this),
             onRoundStart: this.onRoundStart.bind(this),
             onGameEnd: this.onGameEnd.bind(this)
        };

        matchmakingService.registerObservers(matchmakingObservers);
        gameService.registerObservers(gameObservers);
    }

    setupSocketListeners() {
        this.io.on('connection', (socket) => {
            socket.on('joinLobby', (...args) => this.joinLobby(socket)(...args));
            socket.on('joinGame', (...args) => this.joinGame(socket)(...args));
            socket.on('disconnect', (...args) => this.disconnect(socket)(...args));
            socket.on('selectPosition', (...args) => this.selectPosition(socket)(...args));
            socket.on('animationsCompleted', (...args) => this.animationsCompleted(socket)(...args));
        });
    }

    joinLobby(socket) {
        return async (id, username) => {
            try {
                const player = await playerService.loadPlayer(id, socket.id, username);
                const joined = await lobbyService.addPlayerToLobby(player);
                
                if (joined) {
                    socket.emit('lobbyJoined', { status: 'success', player });
                } else {
                    socket.emit('lobbyJoined', { status: 'error', retry: true });
                }
        
                await matchmakingService.tryMatchmaking();
            } catch (err) {
                console.error(err);
                socket.emit('lobbyJoined', { status: 'fatal_error', retry: false });
            }
        };
    }

	joinGame(socket) {
        return async (playerId, publicId, gameId) => {
            try {
                await matchmakingService.playerReadyForGame(socket.id, playerId, publicId, gameId);
            } catch (err) {
                console.error(err);
                socket.emit('joinGame', { status: 'fatal_error', retry: false });
            }
        };
    }

    disconnect(socket) {
        return async () => {
            try {
                console.log("socket id:",socket.id);

                let player = await playerService.getPlayerBySocketId(socket.id);
                
                if (player && player.id) {
                    await lobbyService.removePlayerFromLobbyByPlayerId(player.id);
                    await playerService.playerDisconnected(socket.id);
                    await gameService.playerDisconnected(player.id);

                    await matchmakingService.tryMatchmaking();
                }
                
                return true;
            } catch (err) {
                console.error(err);
            }
        };
    }

    selectPosition(socket) {
        return async (playerId, gameId, position) => {
            try {
                // await gameService.playerSelectedPosition(playerId, gameId, position);
            } catch (err) {
                console.error(err);
                socket.emit('selectPosition', { status: 'error', message: 'Error processing your position' });
            }
        };
    }

    animationsCompleted(socket) {
        return async (playerId, gameId) => {
            try {
                // await gameService.animationsCompleted(playerId, gameId);
            } catch (err) {
                console.error(err);
                socket.emit('animationsCompleted', { status: 'error', message: 'Error processing animation completion' });
            }
        };
    }

    // Communication Observers
    onGameReadyCheck(player, game) {
        this.io.to(player.socketId).emit('gameReadyCheck', { playerId: player.id, gameId: game.id });
    }

    onInvalidCredentials(response) {
        this.io.to(response.player.socketId).emit('invalidCredentials', response);
    }

	onGameStart(player, game) {
        this.io.to(player.socketId).emit('gameStart', game);
    }

	onRoundStart(player, game) {
		this.io.to(player.socketId).emit('roundStart', game);
    }

    onGameEnd(player, game) {
		this.io.to(player.socketId).emit('gameEnd', game);
    }

}

module.exports = SocketService;