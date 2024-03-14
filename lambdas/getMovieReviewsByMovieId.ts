//第三个端口
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const movieId = event.pathParameters?.movieId;

    if (!movieId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Movie ID is required" }),
      };
    }

    const commandOutput = await ddbDocClient.send(
      new QueryCommand({
        TableName: process.env.MOVIE_REVIEWS_TABLE,
        KeyConditionExpression: "MovieId = :movieId",
        ExpressionAttributeValues: {
          ":movieId": parseInt(movieId),
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ data: commandOutput.Items }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};


