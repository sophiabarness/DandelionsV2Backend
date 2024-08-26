// Added this code to lambda function that connected to entergame on websocket. 
// Make sure to configure to TABLE_NAME in environment variables. 

import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const roomId = JSON.parse(event.body).data;

  console.log("EnterRoom", connectionId, roomId);

  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      roomId: { S: roomId },
      connectionId: { S: connectionId }
    }
  };

  try {
    const command = new PutItemCommand(params);
    await client.send(command);
    console.log("Success");
  } catch (err) {
    console.error("Error", err);
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify(""),
  };

  return response;
};