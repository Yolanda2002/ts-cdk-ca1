import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const movieId = event.pathParameters?.movieId;
  const reviewerName = event.pathParameters?.reviewerName;

  if (!movieId || !reviewerName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "MovieId and ReviewerName are required" }),
    };
  }

  try {
    const response = await ddbDocClient.send(new QueryCommand({
      TableName: process.env.MOVIE_REVIEWS_TABLE,
      IndexName: 'ReviewerNameIndex',
      KeyConditionExpression: 'MovieId = :movieId and ReviewerName = :reviewerName',
      ExpressionAttributeValues: {
        ":movieId": parseInt(movieId),
        ":reviewerName": reviewerName,
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
