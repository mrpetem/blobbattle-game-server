const PlayerRepository = require('@repositories/playerRepository');
const dynamoDbInterface = require('@databases/dynamoDbInterface');
const redisInterface = require('@databases/redisInterface');

jest.mock('@databases/dynamoDbInterface');
jest.mock('@databases/redisInterface');

describe('PlayerRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getPlayerById', () => {
        it('should get player by id', async () => {
            const mockPlayer = { id: '1', username: 'test', publicId: 'publicId' };
            dynamoDbInterface.getItem.mockResolvedValue(mockPlayer);

            const player = await PlayerRepository.getPlayerById('1');

            expect(player).toEqual(mockPlayer);
            expect(dynamoDbInterface.getItem).toHaveBeenCalledWith({
                TableName: expect.any(String),
                Key: { 'id': '1' }
            });
        });
    });


    describe('getPlayerByPublicId', () => {
        it('should return player data when a valid publicId is provided', async () => {
            const mockPublicId = 'testPublicId';
            const mockPlayer = {
                id: 'testId',
                publicId: mockPublicId,
                username: 'testUsername'
            };

            // Mock the getPlayerIdsByPublicId and getPlayerById methods
            jest.spyOn(PlayerRepository, 'getPlayerIdsByPublicId').mockResolvedValue({ id: mockPlayer.id });
            jest.spyOn(PlayerRepository, 'getPlayerById').mockResolvedValue(mockPlayer);

            const player = await PlayerRepository.getPlayerByPublicId(mockPublicId);

            expect(player).toEqual(mockPlayer);
            expect(PlayerRepository.getPlayerIdsByPublicId).toHaveBeenCalledWith(mockPublicId);
            expect(PlayerRepository.getPlayerById).toHaveBeenCalledWith(mockPlayer.id);
        });

        it('should throw an error when an invalid publicId is provided', async () => {
            const mockPublicId = 'invalidPublicId';

            // Mock the getPlayerIdsByPublicId method to throw an error
            jest.spyOn(PlayerRepository, 'getPlayerIdsByPublicId').mockRejectedValue(new Error('Invalid publicId'));

            await expect(PlayerRepository.getPlayerByPublicId(mockPublicId)).rejects.toThrow('Invalid publicId');
            expect(PlayerRepository.getPlayerIdsByPublicId).toHaveBeenCalledWith(mockPublicId);
        });
    });


    describe('getPlayerBySocketId', () => {
        it('should return player data for a given socketId', async () => {
            const mockPlayer = { id: '1', publicId: 'public1', socketId: 'socket1' };
            jest.spyOn(PlayerRepository, 'getPlayerIdsBySocketId').mockResolvedValue({ id: '1' });
            jest.spyOn(PlayerRepository, 'getPlayerById').mockResolvedValue(mockPlayer);
        
            const socketId = 'socket1';
            const player = await PlayerRepository.getPlayerBySocketId(socketId);
        
            expect(player).toEqual(mockPlayer);
            expect(PlayerRepository.getPlayerIdsBySocketId).toHaveBeenCalledWith(socketId);
            expect(PlayerRepository.getPlayerById).toHaveBeenCalledWith('1');
        });
    
        it('should throw an error if there is a problem', async () => {
            const error = new Error('Error');
            jest.spyOn(PlayerRepository, 'getPlayerIdsBySocketId').mockRejectedValue(error);
        
            const socketId = 'socket1';
            await expect(PlayerRepository.getPlayerBySocketId(socketId)).rejects.toThrow(error);
            expect(PlayerRepository.getPlayerIdsBySocketId).toHaveBeenCalledWith(socketId);
        });
    });

    describe('savePlayer', () => {
        it('should save a player successfully', async () => {
            const player = {
                id: '1',
                publicId: 'publicId1',
                username: 'player1',
                points: 100,
                rank: 1,
                totalGames: 10,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            dynamoDbInterface.putItem.mockResolvedValue({});
            redisInterface.setHash.mockResolvedValue(true);

            const result = await PlayerRepository.savePlayer(player);

            expect(result).toEqual(player);
            expect(dynamoDbInterface.putItem).toHaveBeenCalledWith({
                TableName: process.env.DYNAMODB_TABLE_PREFIX + 'players',
                Item: player
            });
            expect(redisInterface.setHash).toHaveBeenCalledTimes(3);
        });

        it('should throw an error if required attributes are missing', async () => {
            const player = {
                id: '1',
                username: 'player1',
            };

            await expect(PlayerRepository.savePlayer(player)).rejects.toThrow("Attempt to save player without all required attributes: player.id, player.username, player.publicId");
        });
    });

    describe('deletePlayer', () => {
        it('should delete a player successfully', async () => {
            const playerId = '1';
            const player = {
                id: playerId,
                publicId: 'publicId1',
                username: 'player1',
                points: 100,
                rank: 1,
                totalGames: 10,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            PlayerRepository.getPlayerById = jest.fn().mockResolvedValue(player);
            dynamoDbInterface.deleteItem = jest.fn().mockResolvedValue({});
            redisInterface.removeHashField = jest.fn().mockResolvedValue(true);

            const result = await PlayerRepository.deletePlayer(playerId);

            expect(result).toEqual(player);
            expect(PlayerRepository.getPlayerById).toHaveBeenCalledWith(playerId);
            expect(dynamoDbInterface.deleteItem).toHaveBeenCalledWith({
                TableName: process.env.DYNAMODB_TABLE_PREFIX + 'players',
                Key: { id: playerId }
            });
            expect(redisInterface.removeHashField).toHaveBeenCalledTimes(3);
        });

        it('should return false if player does not exist', async () => {
            const playerId = '1';

            PlayerRepository.getPlayerById = jest.fn().mockResolvedValue(null);

            const result = await PlayerRepository.deletePlayer(playerId);

            expect(result).toEqual(false);
            expect(PlayerRepository.getPlayerById).toHaveBeenCalledWith(playerId);
        });
    });

    describe('storePlayerIds', () => {
        it('should store player IDs successfully', async () => {
            const player = {
                id: '1',
                publicId: 'publicId1',
                socketId: 'socketId1'
            };

            redisInterface.setHash.mockResolvedValue(true);

            const result = await PlayerRepository.storePlayerIds(player);

            expect(result).toEqual(true);
            expect(redisInterface.setHash).toHaveBeenCalledTimes(3);
        });
    });

    describe('deletePlayerIds', () => {
        it('should delete player IDs successfully', async () => {
            const player = {
                id: '1',
                publicId: 'publicId1',
                socketId: 'socketId1'
            };

            redisInterface.removeHashField.mockResolvedValue(true);

            const result = await PlayerRepository.deletePlayerIds(player);

            expect(result).toEqual(true);
            expect(redisInterface.removeHashField).toHaveBeenCalledTimes(3);
        });
    });
});