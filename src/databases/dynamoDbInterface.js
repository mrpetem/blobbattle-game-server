const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

class DynamoDBInterface {



    constructor() {
        const client = new DynamoDBClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });

        this.docClient = DynamoDBDocumentClient.from(client);
    }



    async getItem(payload) {
        try {
            const command = new GetCommand(payload);
            const data = await this.docClient.send(command);
            return data.Item;
        } catch (err) {
            console.error("DynamoDbInterface getItem error: ", err);
            throw err;
        }
    }



    async putItem(payload) {
        try {
            const command = new PutCommand(payload);
            return await this.docClient.send(command);
        } catch (err) {
            console.error("DynamoDbInterface putItem error: ", err);
            throw err;
        }
    }



    async deleteItem(payload) {
        try {
            const command = new DeleteCommand(payload);
            return await this.docClient.send(command);
        } catch (err) {
            console.error("DynamoDbInterface deleteItem error: ", err);
            throw err;
        }
    }



}

module.exports = new DynamoDBInterface();
