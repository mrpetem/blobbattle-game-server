// Services
const gameService = require('@services/gameService');
const playerService = require('@services/playerService');
const lobbyService = require('@services/lobbyService');

class MatchmakingService {

    constructor() {
        this.observers = {};
    }

    registerObservers(observers) {
        for (const [name, observer] of Object.entries(observers)) {
            this.observers[name] = observer;
        }
    }

    removeObserver(name) {
        if (this.observers[name]) {
            delete this.observers[name];
        } else {
            console.warn(`No observer found with name ${name}.`);
        }
    }

    async tryMatchmaking(attempts = 0) {
        try {
            await this.waitForLobbyUnlocked(attempts);
            const players = await lobbyService.getAvailablePlayers(4);
            return players.length === 4 ? await this.initializeGameIfReady(players) : false;
        } catch (err) {
            console.error(err);
            await lobbyService.lockLobby(false);
            throw err;
        }
    }

    async waitForLobbyUnlocked(attempts = 0, maxAttempts = 5) {
        while (attempts < maxAttempts) {
            const lobbyIsLocked = await lobbyService.isLobbyLocked();

            if (!lobbyIsLocked) {
                return; // Lobby is not locked, exit the retry loop
            }

            // Lobby is locked, wait for a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }

        // If this point is reached, the lobby has been locked for too long
        throw new Error("Lobby has been locked for too long.");
    }

    async initializeGameIfReady(players) {
        try {
            // Ensure we have the exact number of players needed for a game
            if (players.length !== 4) {
                return false;
            }

            // Lock the lobby to prevent other players from joining
            await lobbyService.lockLobby(true);

            // Create a new game with the selected players
            const game = await gameService.createNewGame(players);

            // Remove players from the lobby and emit a game readiness event
            for (const player of players) {
                await lobbyService.removePlayerFromLobbyByPlayerId(player.id);
                this.observers.onGameReadyCheck(player, game);
            }

            // Verify the players are ready to start the game
            return await this.verifyPlayersReadyToStartGame(game);
        } catch (err) {
            // In case of an error, unlock the lobby and rethrow the error
            await lobbyService.lockLobby(false);
            throw err;
        }
    }

    async verifyPlayersReadyToStartGame(game) {
        try {
            // Wait for a specified duration to allow players to confirm their readiness
            const waitDuration = 10000;
            const playersReady = await new Promise(resolve => {
                setTimeout(async () => {
                    if (await gameService.arePlayersReadyToStartGame(game.id)) {
                        resolve(true);
                    } else {
                        await this.handlePlayersNotReady(game);
                        resolve(false);
                    }
                }, waitDuration);
            });

            return playersReady;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async handlePlayersNotReady(game) {
        try {
            // Add all players back to the lobby and destroy the game instance
            for (let player of game.players) {
                player = await playerService.getPlayerByPublicId(player.publicId);
                await lobbyService.addPlayerToLobby(player);
            }

            await gameService.destroyGame(game.id);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async playerReadyForGame(socketId, playerId, publicId, gameId) {
        try {
            if (!await playerService.validatePlayerCredentials(socketId, playerId, publicId)) {

                // Get the players correct credentials and send back
                let player = await playerService.getPlayerBySocketId(socketId);
                this.observers.onInvalidCredentials({ invalidCredentials: {playerId, publicId }, validCredentials: player});

                return false;
            }

            if (!await gameService.verifyPlayerExistsInGame(gameId, publicId)) {
                this.observers.onInvalidCredentials({ invalidCredentials: { gameId }, validCredentials: {}});
                return false;
            }

            await gameService.playerIsReadyForGame(gameId, publicId);

            let gameStarted = await gameService.startGame(gameId);

            return gameStarted;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

}

module.exports = new MatchmakingService();