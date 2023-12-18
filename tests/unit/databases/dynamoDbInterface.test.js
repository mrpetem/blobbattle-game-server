const DynamoDBInterface = require("@databases/dynamoDbInterface");
const tableName = process.env.DYNAMODB_TABLE_PREFIX + 'players';

describe('DynamoDBInterface Integration Tests', () => {
    const testItemId = 'testItem1';

    afterAll(async () => {
        // Clean up: delete the test item after all tests are done
        const deletePayload = {
            TableName: tableName,
            Key: { id: testItemId }
        };
        await DynamoDBInterface.deleteItem(deletePayload);
    });

    test('putItem inserts a new item into DynamoDB', async () => {
        const putPayload = {
            TableName: tableName,
            Item: { id: testItemId, data: 'testData' }
        };
        await DynamoDBInterface.putItem(putPayload);

        // Additional assertions can be made here if needed
    });

    test('getItem retrieves the correct item from DynamoDB', async () => {
        const getPayload = {
            TableName: tableName,
            Key: { id: testItemId }
        };
        const result = await DynamoDBInterface.getItem(getPayload);

        expect(result).toBeDefined();
        expect(result.id).toBe(testItemId);
        expect(result.data).toBe('testData');
    });

    test('deleteItem removes the item from DynamoDB', async () => {
        const deletePayload = {
            TableName: tableName,
            Key: { id: testItemId }
        };
        await DynamoDBInterface.deleteItem(deletePayload);

        // Verify that the item was deleted
        const getResult = await DynamoDBInterface.getItem({
            TableName: tableName,
            Key: { id: testItemId }
        });
        expect(getResult).toBeUndefined();
    });
});
