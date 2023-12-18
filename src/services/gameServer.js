const EventEmitter = require('events');

class GameServer extends EventEmitter {
	

    constructor(gameId, gameState, PlayerService){
        super();
        this.gameId = gameId;
        this.gameState = gameState;
        this.playerService = PlayerService;
    }
	
    async startGame() {
        try{
            this.gameState.gameStarted = true;
            this.gameState.gameStartTime = new Date().toISOString();

            this.emit('onGameStart',this.gameState);

            return true;
        }catch(err){
            console.error(err);
            throw err;
        }
    }
    
    startRound() {
        this.gameState.newGameRound();
        this.emit('onRoundStart',this.gameState);
    }
    
    fatalError(info){
        return true;
    }
}

module.exports = GameServer;
