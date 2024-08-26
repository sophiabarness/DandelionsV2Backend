// Added this code to lambda function that connected to database api.
// Make sure to configure to TABLE_NAME in environment variables.

import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
    console.log("eventblahblahblah");
    console.log(event);
    const roomId = event.queryStringParameters.roomId; // Retrieve the roomId from query parameters

    const params = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "roomId = :roomId",
        ExpressionAttributeValues: {
            ":roomId": { S: roomId }
        },
        ProjectionExpression: "roomId", // Only retrieve the partition key
        Limit: 1 // We only need to know if at least one item exists
    };

    try {
        const command = new QueryCommand(params);
        const { Items } = await client.send(command);
        
        const exists = Items.length > 0; // Check if any item exists
        return {
            statusCode: 200,
            body: JSON.stringify({ exists })
        };
    } catch (err) {
        console.error("Error checking roomId", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error checking roomId" })
        };
    }
};
