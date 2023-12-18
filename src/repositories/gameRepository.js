const redisInterface = require('@databases/redisInterface');
const Game = require('@models/game');


/**
 * GameRepository class for interacting with game data in DynamoDB and Redis.
 */
class GameRepository {

    constructor() {
    }

    /**
     * Fetches a game by ID from Redis.
     * @param {string} gameId - The ID of the game to fetch.
     * @returns {Promise<object>} The game data.
     * @throws {Error} If there is an error fetching the game.
     */
    async getGameById(gameId) {
        try {
            let gameState = await redisInterface.getHashField('game', gameId);

            if(!gameState){
                throw new Error("Game State for gameID " + gameId + " was not found");
            }
            
            return new Game(null, gameState);
        } catch (err) {
            console.error("Error getting game data from redis:", err);
            throw err;
        }
    }



    /**
     * Saves a game state to redis
     * @param {object} game - The game data to save.
     * @returns {Promise<object>} The saved game data.
     * @throws {Error} If there is an error saving the game or if required attributes are missing.
     */
    async saveGameState(game) {
        try {
            
            if (!(game instanceof Game)) {
                throw new Error("Invalid argument: 'game' must be an instance of Game");
            }

            await redisInterface.setHash('game', game.id, game.getGameState());
            return true;
        } catch (err) {
            console.error("Error saving or updating game state data in redis:", err);
            throw err;
        }
    }

    /**
     * Deletes a game from redis
     * @param {string} gameId - The ID of the game to delete.
     * @returns {Promise<object|boolean>} The deleted game data, or false if the game does not exist.
     * @throws {Error} If there is an error deleting the player.
     */
    async deleteGame(gameId) {
        try {

            let game = await this.getGameById(gameId);

            if(!game){
                return false;
            }

            await redisInterface.removeHashField('game', gameId);

            return game;
        } catch (err) {
            console.error("Error deleting game data:", err);
            throw err;
        }
    }


}

module.exports = new GameRepository();
