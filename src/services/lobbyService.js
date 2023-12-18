const { v4: uuidv4 } = require('uuid');
const redisInterface = require('@databases/redisInterface');

class Lobby {
	
    constructor() {
    }
	
	async lockLobby(lock=false){
		try{
			
			if(lock){
				await redisInterface.setHash('lobby', 'locked', true);
			}else{
				await redisInterface.setHash('lobby', 'locked', false);
			}
			
			return true;
		}catch(err){
			console.error(err);
			return false;
		}
	}
	
	async isLobbyLocked(){
		try{
			return await redisInterface.getHashField('lobby', 'locked');
		}catch(err){
			console.error(err);
			throw err;
		}
	}
	
	async addPlayerToLobby(player) {
		try{
			await redisInterface.setHash('lobby', `${player.id}`, player);
			return true;
		}catch(err){
			console.error(err);
			return false;
		}
    }

	async addPlayersToLobby(players){
		try{
			
			for(const player of players){
				await this.addPlayerToLobby(player);
			}
			
			return true;
		}catch(err){
			console.error(err);
			return false;
		}
	}
	
	async getAvailablePlayers(totalPlayersNeeded=0) {
		try {
			let playersHash = await redisInterface.getHashAllFields('lobby');

			if (!playersHash) {
				return []; // Return an empty array if no players found
			}
	
			let playersArray = [];
			
			// Iterate over the hash fields and parse each value as JSON
			for (const playerId in playersHash) {

				if(Object.prototype.hasOwnProperty.call(playersHash, playerId) && playerId !== 'locked'){

					if(totalPlayersNeeded != 0 && playersArray.length == totalPlayersNeeded){
						break;
					}

					try {
						let playerData = JSON.parse(playersHash[playerId]);
						playersArray.push(playerData);
					} catch (parseError) {
						console.error(`Error parsing player data for ${playerId}:`, parseError);
					}
					
				}
			}
	
			return playersArray;
		} catch (err) {
			console.error('Error in getAvailablePlayers:', err);
			return false;
		}
	}
	
	async removePlayerFromLobbyByPlayerId(playerId) {
        await redisInterface.removeHashField('lobby', `${playerId}`);
    }

	async removePlayersFromLobby(playerIds) {
        for (const id of playerIds) {
            await this.removePlayerFromLobbyByPlayerId(id);
        }
    }
	
}

module.exports = new Lobby();
