import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const reviewerName = event.pathParameters?.reviewerName;

  if (!reviewerName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Reviewer name is required" }),
    };
  }

  try {
    const response = await ddbDocClient.send(new QueryCommand({
      TableName: process.env.MOVIE_REVIEWS_TABLE,
      IndexName: 'OnlyReviewerNameIndex',
      KeyConditionExpression: 'ReviewerName = :reviewerName',
      ExpressionAttributeValues: {
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
