const dynamoDbInterface = require('@databases/dynamoDbInterface');
const redisInterface = require('@databases/redisInterface');

const PlayersTableName = process.env.DYNAMODB_TABLE_PREFIX + 'players';

/**
 * PlayerRepository class for interacting with player data in DynamoDB and Redis.
 */
class PlayerRepository {

    constructor() {
    }

    /**
     * Fetches a player by their ID from DynamoDB.
     * @param {string} playerId - The ID of the player to fetch.
     * @returns {Promise<object>} The player data.
     * @throws {Error} If there is an error fetching the player.
     */
    async getPlayerById(playerId) {
        try {
            const params = {
                TableName: PlayersTableName,
                Key: { id: playerId }
            };

            const data = await dynamoDbInterface.getItem(params);
            return data;
        } catch (err) {
            console.error("Error getting player data from DynamoDB:", err);
            throw err;
        }
    }

    /**
     * Fetches a player by their public ID from DynamoDB.
     * @param {string} publicId - The public ID of the player to fetch.
     * @returns {Promise<object>} The player data.
     * @throws {Error} If there is an error fetching the player.
     */
    async getPlayerByPublicId(publicId) {
        try {
            let playerIds = await this.getPlayerIdsByPublicId(publicId);

            if(!playerIds){
                return false;
            }
            
            return await this.getPlayerById(playerIds.id);
        } catch (err) {
            console.error("Error getting getPlayerByPublicId:", err);
            throw err;
        }
    }

    async getPlayerBySocketId(socketId) {
        try {
            let playerIds = await this.getPlayerIdsBySocketId(socketId);
            
            if(!playerIds){
                return false;
            }

            return await this.getPlayerById(playerIds.id);
        } catch (err) {
            console.error("Error getting getPlayerByPublicId:", err);
            throw err;
        }
    }

    /**
     * Saves a player to DynamoDB and stores their IDs in Redis.
     * @param {object} player - The player data to save.
     * @returns {Promise<object>} The saved player data.
     * @throws {Error} If there is an error saving the player or if required attributes are missing.
     */
    async savePlayer(player) {
        try {

            const saveThesePropertiesOnly = ['id', 'publicId', 'username', 'points', 'rank', 'totalGames', 'createdAt', 'updatedAt'];
    
            if (!player || !player.id || !player.publicId || !player.username) {
                throw new Error("Attempt to save player without all required attributes: player.id, player.username, player.publicId");
            }
    
            player.updatedAt = new Date().toISOString();
    
            const filteredPlayer = {};
            saveThesePropertiesOnly.forEach(prop => {
                if (player.hasOwnProperty(prop)) {
                    filteredPlayer[prop] = player[prop];
                }
            });

            const params = {
                TableName: PlayersTableName,
                Item: player
            };

            await dynamoDbInterface.putItem(params);

            await this.storePlayerIds(player);

            return player;
        } catch (err) {
            console.error("Error saving or updating player data in DynamoDB:", err);
            throw err;
        }
    }

    /**
     * Deletes a player from DynamoDB and removes their IDs from Redis.
     * @param {string} playerId - The ID of the player to delete.
     * @returns {Promise<object|boolean>} The deleted player data, or false if the player does not exist.
     * @throws {Error} If there is an error deleting the player.
     */
    async deletePlayer(playerId) {
        try {

            let player = await this.getPlayerById(playerId);

            if(!player){
                return false;
            }

            await this.deletePlayerIds(player);

            const params = {
                TableName: PlayersTableName,
                Key: { id: playerId }
            };

            await dynamoDbInterface.deleteItem(params);

            return player;
        } catch (err) {
            console.error("Error deleting player data:", err);
            throw err;
        }
    }

    /**
     * Stores a player's IDs in Redis.
     * @param {object} player - The player data.
     * @returns {Promise<boolean>} True if the IDs were stored successfully.
     * @throws {Error} If there is an error storing the IDs.
     */
    async storePlayerIds(player){
        try {
            await redisInterface.setHash('getPlayerByPlayerId', player.id, { id: player.id, publicId: player.publicId, socketId: player.socketId });
            await redisInterface.setHash('getPlayerBySocketId', player.socketId, { id: player.id, publicId: player.publicId, socketId: player.socketId });
            await redisInterface.setHash('getPlayerByPublicId', player.publicId, { id: player.id, publicId: player.publicId, socketId: player.socketId });
            return true;
        } catch (err) {
            console.error("Error getting player data:", err);
            throw err;
        }
    }

    /**
     * Removes a player's IDs from Redis.
     * @param {object} player - The player data.
     * @returns {Promise<boolean>} True if the IDs were removed successfully.
     * @throws {Error} If there is an error removing the IDs.
     */
    async deletePlayerIds(player){
        try {
            await this.removePlayerIdsByPlayerId(player.id);
            await this.removePlayerIdsBySocketId(player.socketId);
            await this.removePlayerIdsByPublicId(player.publicId);
            return true;
        } catch (err) {
            console.error("Error getting player data:", err);
            throw err;
        }
    }

    async getPlayerIdsByPlayerId(playerId){
        return await redisInterface.getHashField('getPlayerByPlayerId', playerId);
    }
    
    async getPlayerIdsBySocketId(socketId){
        return await redisInterface.getHashField('getPlayerBySocketId', socketId);
    }

    async getPlayerIdsByPublicId(publicId){
        return await redisInterface.getHashField('getPlayerByPublicId', publicId);
    }

    async removePlayerIdsByPlayerId(playerId) {
        await redisInterface.removeHashField('getPlayerByPlayerId', playerId);
    }

    async removePlayerIdsBySocketId(socketId) {
        await redisInterface.removeHashField('getPlayerBySocketId', socketId);
    }

    async removePlayerIdsByPublicId(publicId) {
        await redisInterface.removeHashField('getPlayerByPublicId', publicId);
    }
}

module.exports = new PlayerRepository();
