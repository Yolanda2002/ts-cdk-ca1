import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    // 检查 event.body 是否存在，如果不存在或不能解析为 JSON，返回错误
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Request body is missing" }),
        };
    }

    let updatedContent;
    try {
        const body = JSON.parse(event.body);
        updatedContent = body.content;
    } catch {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Request body must be valid JSON" }),
        };
    }
    const movieId = event.pathParameters?.movieId;
    const reviewerName = event.pathParameters?.reviewerName;

    if (!movieId || !reviewerName || !updatedContent) {
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Review updated" }),
        };
    }

    try {
        const response = await ddbDocClient.send(new UpdateCommand({
            TableName: process.env.MOVIE_REVIEWS_TABLE,
            Key: {
                MovieId: parseInt(movieId),
                ReviewerName: reviewerName,
            },
            UpdateExpression: "set Content = :content",
            ExpressionAttributeValues: {
                ":content": updatedContent,
            },
            ReturnValues: "UPDATED_NEW"
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Review updated", updatedAttributes: response.Attributes }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};
