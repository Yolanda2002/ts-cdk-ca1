import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const movieId = event.pathParameters?.movieId;
  const secondaryParam = event.pathParameters?.secondaryParam; // 这里可以是 year 或 reviewerName

  if (!movieId || !secondaryParam) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Movie ID and secondary parameter are required" }),
    };
  }

  // 检查 secondaryParam 是不是一个年份（4位数字）
  if (/^\d{4}$/.test(secondaryParam)) {
    // 如果是年份，调用 getReviewsForMovieByYear 函数
    return getReviewsForMovieByYear(movieId, secondaryParam);
  } else {
    // 如果不是年份，调用 getReviewsForMovieByReviewerName 函数
    return getReviewsForMovieByReviewerName(movieId, secondaryParam);
  }
};

async function getReviewsForMovieByYear(movieId, year) {
    try {
      const startOfYear = `${year}-01-01`;
      const endOfYear = `${year}-12-31`;
      const commandOutput = await ddbDocClient.send(
        new QueryCommand({
          TableName: process.env.MOVIE_REVIEWS_TABLE,
          IndexName: 'ReviewDateIndex',
          KeyConditionExpression: "MovieId = :movieId AND ReviewDate BETWEEN :startOfYear AND :endOfYear",
          ExpressionAttributeValues: {
            ":movieId": parseInt(movieId), 
            ":startOfYear": startOfYear,
            ":endOfYear": endOfYear,
          },
        })
      );
      return {
        statusCode: 200,
        body: JSON.stringify({ reviews: commandOutput.Items }),
      };
    } catch (error) {
      console.error("Error details:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal server error 1", error: error.toString() }),
      };
    }
  }
  
async function getReviewsForMovieByReviewerName(movieId, reviewerName) {
  try {
    const commandOutput = await ddbDocClient.send(
      new QueryCommand({
        TableName: process.env.MOVIE_REVIEWS_TABLE,
        IndexName: 'ReviewerNameIndex', // 使用适合的 GSI
        KeyConditionExpression: "ReviewerName = :reviewerName AND MovieId = :movieId",
        ExpressionAttributeValues: {
          ":reviewerName": reviewerName,
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
}
