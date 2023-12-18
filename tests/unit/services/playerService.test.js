const playerService = require('@services/playerService');
const PlayerRepository = require('@repositories/playerRepository');
const Player = require('@models/player');
const util = require('@utils/utils');

jest.mock('@repositories/playerRepository');
jest.mock('@models/player');

describe('playerService', () => {

    beforeEach(() => {
        jest.spyOn(util, 'validateUUID');
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe('loadPlayer', () => {
        it('should create a new player if the player does not exist', async () => {
            const playerId = util.generateUUID();
            const socketId = util.generateUUID();
            const username = 'test-user';

            PlayerRepository.getPlayerById.mockResolvedValue(null);

            const result = await playerService.loadPlayer(playerId, socketId, username);

            expect(util.validateUUID).toHaveBeenCalledWith(playerId);
            expect(PlayerRepository.getPlayerById).toHaveBeenCalledWith(playerId);
            expect(Player).toHaveBeenCalledWith(socketId, username);
            expect(PlayerRepository.savePlayer).toHaveBeenCalledWith(expect.any(Player));
            expect(result).toEqual(expect.any(Player));
        });

        it('should return the existing player if the player already exists', async () => {
            const playerId = util.generateUUID();
            const socketId = util.generateUUID();
            const publicId = util.generateUUID();
            const username = 'test-user';
            const existingPlayer = { playerId, socketId, username, publicId };

            PlayerRepository.getPlayerById.mockResolvedValue(existingPlayer);

            const result = await playerService.loadPlayer(playerId, socketId, username);

            expect(util.validateUUID).toHaveBeenCalledWith(playerId);
            expect(PlayerRepository.getPlayerById).toHaveBeenCalledWith(playerId);
            expect(Player).not.toHaveBeenCalled();
            expect(PlayerRepository.savePlayer).not.toHaveBeenCalled();
            expect(result).toEqual(existingPlayer);
        });

        it('should throw an error if something goes wrong', async () => {
            const playerId = util.generateUUID();
            const socketId = util.generateUUID();
            const username = 'test-user';
            const error = new Error('Test error');

            PlayerRepository.getPlayerById.mockRejectedValue(error);

            await expect(playerService.loadPlayer(playerId, socketId, username)).rejects.toThrow(error);

            expect(util.validateUUID).toHaveBeenCalledWith(playerId);
            expect(PlayerRepository.getPlayerById).toHaveBeenCalledWith(playerId);
        });
    });


    describe('getPlayer', () => {
        it('should return the player if the player exists', async () => {
            const playerId = util.generateUUID();
            const existingPlayer = { id: playerId, socketId: 'socketId', username: 'test-user' };

            // Mock the getPlayerById method to return the existing player
            PlayerRepository.getPlayerById.mockResolvedValue(existingPlayer);

            const result = await playerService.getPlayer(playerId);

            expect(PlayerRepository.getPlayerById).toHaveBeenCalledWith(playerId);
            expect(result).toEqual(existingPlayer);
        });

        it('should throw an error if the player does not exist', async () => {
            const playerId = util.generateUUID();

            // Mock the getPlayerById method to throw an error
            PlayerRepository.getPlayerById.mockRejectedValue(new Error('Player not found'));

            await expect(playerService.getPlayer(playerId)).rejects.toThrow('Player not found');
            expect(PlayerRepository.getPlayerById).toHaveBeenCalledWith(playerId);
        });
    });

    describe('updatePlayer', () => {
        it('should update the player and return the updated player', async () => {
            const player = { id: util.generateUUID(), socketId: util.generateUUID(), username: 'test-user' };

            PlayerRepository.savePlayer.mockResolvedValue(player);

            const result = await playerService.updatePlayer(player);

            expect(PlayerRepository.savePlayer).toHaveBeenCalledWith(player);
            expect(result).toEqual(player);
        });
    });

    describe('deletePlayer', () => {
        it('should delete the player and return true', async () => {
            const playerId = util.generateUUID();

            PlayerRepository.deletePlayer.mockResolvedValue(true);

            const result = await playerService.deletePlayer(playerId);

            expect(PlayerRepository.deletePlayer).toHaveBeenCalledWith(playerId);
            expect(result).toBe(true);
        });
    });

    describe('validatePlayerCredentials', () => {
        it('should return true if the credentials are valid', async () => {
            const socketId = util.generateUUID();
            const playerId = util.generateUUID();
            const publicId = util.generateUUID();
            const player = { id: playerId, socketId: socketId, publicId: publicId };

            PlayerRepository.getPlayerBySocketId.mockResolvedValue(player);

            const result = await playerService.validatePlayerCredentials(socketId, playerId, publicId);

            expect(PlayerRepository.getPlayerBySocketId).toHaveBeenCalledWith(socketId);
            expect(result).toBe(true);
        });

        it('should return false if the credentials are not valid', async () => {
            const socketId = util.generateUUID();
            const playerId = util.generateUUID();
            const publicId = util.generateUUID();
            const player = { id: 'wrongPlayerId', socketId: socketId, publicId: 'wrongPublicId' };

            PlayerRepository.getPlayerBySocketId.mockResolvedValue(player);

            const result = await playerService.validatePlayerCredentials(socketId, playerId, publicId);

            expect(PlayerRepository.getPlayerBySocketId).toHaveBeenCalledWith(socketId);
            expect(result).toBe(false);
        });
    });

    describe('playerDisconnected', () => {
        it('should delete the player and return true', async () => {
            const playerId = util.generateUUID();
            const socketId = util.generateUUID();
            const player = { id: playerId, socketId: socketId };

            PlayerRepository.getPlayerIdsBySocketId.mockResolvedValue(player);
            PlayerRepository.deletePlayerIds.mockResolvedValue(true);

            const result = await playerService.playerDisconnected(socketId);

            expect(PlayerRepository.getPlayerIdsBySocketId).toHaveBeenCalledWith(socketId);
            expect(PlayerRepository.deletePlayerIds).toHaveBeenCalledWith(player);
            expect(result).toBe(true);
        });
    });

    describe('updateSocketId', () => {
        it('should update the player\'s socketId and return true', async () => {
            const playerId = util.generateUUID();
            const socketId = util.generateUUID();
            const player = { id: playerId, socketId: util.generateUUID() };

            PlayerRepository.savePlayer.mockResolvedValue(true);

            const result = await playerService.updateSocketId(player, socketId);

            expect(player.socketId).toBe(socketId);
            expect(PlayerRepository.savePlayer).toHaveBeenCalledWith(player);
            expect(result).toBe(true);
        });
    });
});