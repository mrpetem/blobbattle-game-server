// Models
const Player = require('@models/player');

// Repositories
const PlayerRepository = require('@repositories/playerRepository.js');

// Utils
const util = require('@utils/utils.js');


class PlayerService {
	
	constructor() {
        this.playerRepository = PlayerRepository;
    }
	
	
	async loadPlayer(playerId, socketId, username) {
        try {

            let player;

			if(playerId && util.validateUUID(playerId)){
			    player = await this.playerRepository.getPlayerById(playerId);
            }
            
            // This is a new player
            if (!player) {
				player = new Player(socketId, username);
                await this.playerRepository.savePlayer(player);
            }
            
            // This is an existing player
            else{

                if(player.socketId != socketId){
                    player.socketId = socketId;
                }

                if(player.username != username){
                    player.username = util.cleanUsername(username);
                }

                await this.playerRepository.savePlayer(player);
            }
            
            return player;
        } catch (err) {
            console.error("Error creating new player:", err);
            throw err;
        }
    }


	async getPlayerBySocketId(socketId) {
        try {
			return await this.playerRepository.getPlayerBySocketId(socketId);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }


	async getPlayerByPublicId(publicId) {
        try {
			return await this.playerRepository.getPlayerByPublicId(publicId);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }


	async getPlayer(playerId) {
        try {
            return await this.playerRepository.getPlayerById(playerId);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }


	async updatePlayer(player) {
        try {
            return await this.playerRepository.savePlayer(player);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }


	async deletePlayer(playerId) {
        try {
            return await this.playerRepository.deletePlayer(playerId);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }


	async validatePlayerCredentials(socketId, playerId, publicId){
		try{
			let player = await this.playerRepository.getPlayerBySocketId(socketId);

            if(!player || player.id != playerId || player.publicId != publicId){
                return false;
            }
			
			return true;
		}catch(err){
			console.error(err);
			throw err;
		}
	}

	
	async playerDisconnected(socketId){
		try{
			let player = await this.playerRepository.getPlayerIdsBySocketId(socketId);
			await this.playerRepository.deletePlayerIds(player);

			return true;
		}catch(err){
			console.error(err);
			throw err;
		}
	}
	
	
	
	async updateSocketId(player,socketId) {
		try{
			player.socketId = socketId;
			await this.playerRepository.savePlayer(player);
			return true;
		}catch(err){
			console.error(err);
			throw err;
		}
    }
	
}

module.exports = new PlayerService();