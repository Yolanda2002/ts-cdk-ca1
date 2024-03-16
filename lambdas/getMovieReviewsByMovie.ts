import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

// 初始化 DynamoDB Document Client
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const movieId = event.pathParameters?.movieId;
  const reviewerName = event.pathParameters?.reviewerName;

  if (!movieId || !reviewerName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing movieId or reviewerName" }),
    };
  }

  const params = {
    TableName: process.env.REVIEWS_TABLE_NAME,
    IndexName: "ReviewerNameIndex", 
    KeyConditionExpression: "MovieId = :movieId and ReviewerName = :reviewerName",
    ExpressionAttributeValues: {
      ":movieId": movieId,
      ":reviewerName": reviewerName
    }
  };
  

  try {
    const data = await ddbDocClient.send(new QueryCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ reviews: data.Items }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
