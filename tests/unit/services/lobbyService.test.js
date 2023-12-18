const lobbyService = require('@services/lobbyService');
const redisInterface = require('@databases/redisInterface');

describe('Lobby Model Tests', () => {

    const testPlayers = [
        { id: 'playerId1', username: 'playerUsername1', socketId: 'playerSocketId1' },
        { id: 'playerId2', username: 'playerUsername2', socketId: 'playerSocketId2' },
        { id: 'playerId3', username: 'playerUsername3', socketId: 'playerSocketId3' }
    ];

    afterAll(async () => {
        // Ensure the lobby is unlocked after all tests
        await lobbyService.lockLobby(false);

        // Clean up: Remove test players from the lobby
        await Promise.all(testPlayers.map(player => {
            return redisInterface.removeHashField('lobby', `${player.id}`);
        }));

        await redisInterface.disconnect();
    });

    test('lockLobby locks the lobby', async () => {
        const result = await lobbyService.lockLobby(true);
        expect(result).toBe(true);

        const isLocked = await lobbyService.isLobbyLocked();
        expect(isLocked).toBe(true);
    });

    test('lockLobby unlocks the lobby', async () => {
        const result = await lobbyService.lockLobby(false);
        expect(result).toBe(true);

        const isLocked = await lobbyService.isLobbyLocked();
        expect(isLocked).toBe(false);
    });


    test('addPlayersToLobby adds players to the lobby', async () => {
        const result = await lobbyService.addPlayersToLobby(testPlayers);
        expect(result).toBe(true);
    
        const availablePlayers = await lobbyService.getAvailablePlayers();
    
        expect(availablePlayers).toBeDefined();
    
        // Check if all test players are in the available players list
        testPlayers.forEach(testPlayer => {
            const matchingPlayer = availablePlayers.find(player => player.id === testPlayer.id);
            expect(matchingPlayer).toBeDefined();
            expect(matchingPlayer).toEqual(testPlayer);
        });
    });
    

    test('removePlayerFromLobbyByPlayerId removes a player from the lobby', async () => {
        // Add a test player to the lobby
        const testPlayer = testPlayers[0];
        await lobbyService.addPlayerToLobby(testPlayer);
    
        // Remove the test player from the lobby
        await lobbyService.removePlayerFromLobbyByPlayerId(testPlayer.id);
    
        // Check that the player is no longer in the lobby
        const availablePlayers = await lobbyService.getAvailablePlayers();
        const matchingPlayer = availablePlayers.find(player => player.id === testPlayer.id);
        expect(matchingPlayer).toBeUndefined();
    });
    
    test('removePlayersFromLobby removes multiple players from the lobby', async () => {
        // Add test players to the lobby
        await lobbyService.addPlayersToLobby(testPlayers);
    
        // Remove the test players from the lobby
        const playerIds = testPlayers.map(player => player.id);
        await lobbyService.removePlayersFromLobby(playerIds);
    
        // Check that the players are no longer in the lobby
        const availablePlayers = await lobbyService.getAvailablePlayers();
        testPlayers.forEach(testPlayer => {
            const matchingPlayer = availablePlayers.find(player => player.id === testPlayer.id);
            expect(matchingPlayer).toBeUndefined();
        });
    });
});
