import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const movieId = event.pathParameters?.movieId;
  const minRating = event.queryStringParameters?.minRating;

  if (!movieId || !minRating) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "MovieId and minRating are required" }),
    };
  }

  try {
    const response = await ddbDocClient.send(new QueryCommand({
      TableName: process.env.MOVIE_REVIEWS_TABLE,
      KeyConditionExpression: "MovieId = :movieId",
      FilterExpression: "Rating >= :minRating",
      ExpressionAttributeValues: {
        ":movieId": parseInt(movieId),
        ":minRating": parseInt(minRating),
      },
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ reviews: response.Items }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
