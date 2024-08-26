// Added this code to lambda function that connected to sendmessage on websocket. 
// Make sure to configure to TABLE_NAME in environment variables. 

import { DynamoDBClient, ScanCommand, QueryCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });


export const handler = async (event) => {
    console.log("SendMessage");
    
    const apigatewayClient = new ApiGatewayManagementApiClient({
        region: process.env.AWS_REGION,
        endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`
    });

    const msg = JSON.parse(event.body).data;
    console.log("data", msg);

    const connectionId = event.requestContext.connectionId;
    console.log("connectionId", connectionId);

    const scanParams = {
        TableName: process.env.TABLE_NAME,
        ProjectionExpression: "roomId, connectionId",
        FilterExpression: "connectionId = :cid",
        ExpressionAttributeValues: {
            ":cid": { S: connectionId }
        }
    };

    let roomId;

    while (roomId === undefined) {
        try {
            const scanCommand = new ScanCommand(scanParams);
            const data = await ddbClient.send(scanCommand);

            console.log("Success");
            roomId = data.Items[0]?.roomId?.S;
        } catch (e) {
            console.error("Error", e);
        }
    }

    console.log("roomId", roomId);

    const queryParams = {
        TableName: process.env.TABLE_NAME,
        ProjectionExpression: "roomId, connectionId",
        KeyConditionExpression: "roomId = :rid",
        ExpressionAttributeValues: {
            ":rid": { S: roomId }
        }
    };

    let queryData;

    try {
        const queryCommand = new QueryCommand(queryParams);
        queryData = await ddbClient.send(queryCommand);
        console.log("Success");
    } catch (e) {
        console.error("Error", e);
    }

    const postCalls = queryData.Items.map(async ({ roomId, connectionId }) => {
        try {
            const postToConnectionCommand = new PostToConnectionCommand({
                ConnectionId: connectionId.S,
                Data: msg
            });
            await apigatewayClient.send(postToConnectionCommand);
        } catch (e) {
            if (e.$metadata.httpStatusCode === 410) {
                console.log(`Found stale connection, deleting ${connectionId.S}`);
                const deleteParams = {
                    TableName: process.env.TABLE_NAME,
                    Key: { roomId: { S: roomId.S }, connectionId: { S: connectionId.S } }
                };
                const deleteCommand = new DeleteItemCommand(deleteParams);
                await ddbClient.send(deleteCommand);
            } else {
                throw e;
            }
        }
    });

    try {
        await Promise.all(postCalls);
    } catch (e) {
        console.log("Error", e);
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify(""),
    };

    return response;
};
