const GameRepository = require('@repositories/gameRepository');
const Game = require('@models/game');
const GameServer = require('@services/gameServer');
const PlayerService = require('@services/playerService');


class GameService {
	

    constructor(){
        this.observers = {};
    }

    // Method to add multiple observers
    registerObservers(observers) {
        for (const [name, observer] of Object.entries(observers)) {
            this.observers[name] = observer;
        }
    }

    // Method to remove an observer by name
    removeObserver(name) {
        if (this.observers[name]) {
            delete this.observers[name];
        } else {
            console.warn(`No observer found with name ${name}.`);
        }
    }
	
    async createNewGame(players) {
        try{
            let game = new Game(players);
            return await GameRepository.saveGameState(game);
        }catch(err){
            console.error(err);
            throw err;
        }
    }
	
    async getGameState(gameId) {
        try{
            return await GameRepository.getGameById(gameId);
        }catch(err){
            console.error(err);
            throw err;
        }
    }

    async saveGameState(game) {
        try{
            return await GameRepository.saveGameState(game);
        }catch(err){
            console.error(err);
            throw err;
        }
    }

    async startGame(gameId) {
        try {
            let gameState = await this.getGameState(gameId);
            for (let player of gameState.players) {
                if (!player.ready) {
                    return false;
                }
            }
    
            const gameServer = new GameServer(gameId, gameState, PlayerService);
    
            const handleGameStateChange = async (updatedState, eventType) => {
                try {
                    await this.saveGameState(updatedState);
                    for (let player of updatedState.players) {
                        player = await PlayerService.getPlayerByPublicId(player.publicId);
                        this.observers[eventType](player, updatedState);
                    }
                } catch (err) {
                    console.error(err);
                    gameServer.fatalError({ type: 'FAILED_EVENT' });
                }
            };
    
            gameServer.on('onGameStart', (updatedState) => handleGameStateChange(updatedState, 'onGameStart'));
            gameServer.on('onRoundStart', (updatedState) => handleGameStateChange(updatedState, 'onRoundStart'));
            gameServer.on('onGameEnd', (updatedState) => handleGameStateChange(updatedState, 'onGameEnd'));
    
            return await gameServer.startGame();
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async destroyGame(gameId) {
        try{
            await GameRepository.deleteGame(gameId);
            return true;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }



    async playerDisconnected(playerId) {
        return true;
    }



    async playerIsReadyForGame(gameId, publicId) {
        try {
            let gameState = await this.getGameState(gameId);
    
            // Find the player and update their readiness
            let playerFound = false;
            for (let player of gameState.players) {
                if (player.publicId === publicId) {
                    player.ready = true;
                    playerFound = true;
                    break; // Exit the loop once the player is found and updated
                }
            }
    
            if (!playerFound) {
                return false; // Player with the given publicId not found
            }
    
            // Update game state
            await this.saveGameState(gameState);
            return true;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    

    async arePlayersReadyToStartGame(gameId){
        try {
            let gameState = await this.getGameState(gameId);
    
            for (let player of gameState.players) {
                if (!player.ready) {
                    return false;
                }
            }
    
            return true;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }


    async verifyPlayerExistsInGame(gameId, publicId) {
        try{
            const gameState = await this.getGameState(gameId);
        
            // Check if gameState.players is an array and has elements
            if (!Array.isArray(gameState.players) || gameState.players.length === 0) {
                return false;
            }
        
            // Find the player with the matching publicId in the array
            const playerExists = gameState.players.some(player => player.publicId === publicId);
        
            return playerExists;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }


    
}

module.exports = new GameService();
