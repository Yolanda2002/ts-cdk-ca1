import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { MovieReview } from "../shared/types"; 

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const reviewerName = event.pathParameters?.reviewerName;
    const body: Omit<MovieReview, 'ReviewerName'> = event.body ? JSON.parse(event.body) : undefined;

    if (!reviewerName || !body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Reviewer name and review body are required" }),
        };
    }

    try {
        await ddbDocClient.send(new PutCommand({
            TableName: process.env.MOVIE_REVIEWS_TABLE,
            Item: {
                ...body,
                ReviewerName: reviewerName, // 从路径参数中获取审阅者名称
            },
        }));

        return {
            statusCode: 201,
            body: JSON.stringify({ message: "Review added successfully" }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error }),
        };
    }
};
