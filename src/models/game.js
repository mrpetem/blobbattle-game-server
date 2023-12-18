const { generateUUID, validateUUID } = require('../utils/utils');
const Abilities = require('@models/abilities');

class Game {
    
    constructor(players, initialState = null) {
        if (initialState) {
            Object.assign(this, initialState);
        } else {
            this.id = generateUUID();
            this.gameStarted = false;
            this.gameStartTime = new Date().toISOString();
            this.currentRound = 0;
            this.players = this.cleanSensitivePlayerData(players);
            this.currentPlayerTurn = 0; // Which player starts their attack first in a round
            this.map = Array(6).fill().map(() => Array(15).fill(null));
            
            this.randomizePlayerOrder();
            
            // Generate the initial game map with random abilities
            this.initGameMap();
        }
    }

    getGameState(){
        return {
            id: this.id,
            gameStarted: this.gameStarted,
            gameStartTime: this.gameStartTime,
            currentRound: this.currentRound,
            players: this.players,
            currentPlayerTurn: this.currentPlayerTurn,
            map: this.map
        };
    }

    cleanSensitivePlayerData(players) {
        try {
            return players.map(player => {
                const { socketId, id, ...cleanPlayer } = player;
                return cleanPlayer;
            });
        } catch(err) {
            console.error(err);
            throw err;
        }
    }

    randomizePlayerOrder() {
        try{
            // Logic to randomize the order of players
            this.players.sort(() => Math.random() - 0.5);
        }catch(err){
            console.error(err);
            throw err;
        }
    }
	
	initGameMap(){
		try{
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 15; col++) {
                    this.map[row][col] = Abilities.selectRandomAbility();
                }

                this.map[row] = this.validateMapRow(this.map[row]);
            }
        }catch(err){
            console.error(err);
            throw err;
        }
	}

    validateMapRow(mapRow,attempts=0){
        try{
            let totalAbilities = 0;
            let totalBlankSpaces = 0;
            
            if(attempts > 10){
                return mapRow;
            }

            for(const cell of mapRow){
                if(cell.length > 0){
                    totalAbilities++;
                }else if(cell == ''){
                    totalBlankSpaces++;
                }
            }

            if(totalAbilities < 4 || totalBlankSpaces < 2){

                attempts++;

                for(const [i,cell] of mapRow.entries()){
                    mapRow[i] = Abilities.selectRandomAbility();
                }
            }else{
                return mapRow;
            }

            return this.validateMapRow(mapRow,attempts);
        }catch(err){
            console.error(err);
            throw err;
        }
    }
	
    addNewMapRow() {
        try {
            // Remove the last row
            this.map.pop();

            // Create a new row
            let newRow = Array(15).fill(null);
            for (let col = 0; col < newRow.length; col++) {
                newRow[col] = Abilities.selectRandomAbility();
            }

            // Append the new row at the beginning
            this.map.unshift(newRow);

            this.map[0] = this.validateMapRow(this.map[0]);

            return this.map[0];
        } catch(err) {
            console.error(err);
            throw err;
        }
    }

    removeAbilityFromMap(row,column){
        try{

            for(let r = 0; r < 6; r++){
                for(let c = 0; c < 15; c++){
                    if(row == r && column == c){
                        this.map[r][c] = '';
                    }
                }
            }

            return true;
        }catch(err){
            console.error(err);
            throw err;
        }
    }

    newGameRound(){
        try {

            this.addNewMapRow();
            this.currentRound++;

            if(this.currentPlayerTurn < 4){
                this.currentPlayerTurn++;
            }else{
                this.currentPlayerTurn = 0;
            }

        } catch(err) {
            console.error(err);
            throw err;
        }
    }

}

module.exports = Game;