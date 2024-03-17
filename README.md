# Typescript—CDK—Assignment1

**Name:** Jia Yang

**Video demonstration:** https://youtu.be/vZ7YGYqeNV8

This repository contains an implementation of a serverless REST API for the AWS platform. The CDK framework is used to provision its infrastructure. The API's domain context is movie reviews.



## API endpoints.

My Web API supports the following endpoints:

- POST /movies/reviews - Add a movie review.

  ![1](https://github.com/Yolanda2002/ts-cdk-ca1/blob/main/pic/1.png)
  
- GET /movies/reviews - Get all the movie reviews.（I Added.）

  ![](https://github.com/Yolanda2002/ts-cdk-ca1/blob/main/pic/2.png)

- GET /movies/{movieId}/reviews - Get all the reviews for the specified movie.

  ![](https://github.com/Yolanda2002/ts-cdk-ca1/blob/main/pic/3.png)

- GET /movies/{movieId}/reviews?minRating=n - Get the reviews for the specified movie with a rating greater than the minRating.

   ![](https://github.com/Yolanda2002/ts-cdk-ca1/blob/main/pic/4.png)

- GET /movies/{movieId}/reviews/{reviewerName} - Get the review written by the named reviewer for the specified movie.

   ![](https://github.com/Yolanda2002/ts-cdk-ca1/blob/main/pic/5.png)

- GET /movies/{movieId}/reviews/{year} - Get the reviews written in a specific year for a specific movie.

  ![](https://github.com/Yolanda2002/ts-cdk-ca1/blob/main/pic/6.png)

- PUT /movies/{movieId}/reviews/{reviewerName} - Update the text of a review.

  ![](https://github.com/Yolanda2002/ts-cdk-ca1/blob/main/pic/7.png)

- POST /reviews/{reviewerName} - Add a review written by a specific reviewer. ( I added.)

![](https://github.com/Yolanda2002/ts-cdk-ca1/blob/main/pic/8.png)

- GET /reviews/{reviewerName} - Get all the reviews written by a specific reviewer.

![](https://github.com/Yolanda2002/ts-cdk-ca1/blob/main/pic/9.png)

- GET /reviews/{reviewerName}/{movieId}/translation?language=code - Get a translated version of a movie review using the movie ID and reviewer name as the identifier.

- All the API endpoints： 

![](https://github.com/Yolanda2002/ts-cdk-ca1/blob/main/pic/10.png)

![](https://github.com/Yolanda2002/ts-cdk-ca1/blob/main/pic/11.png)



## Independent learning (If relevant).

An important area of independent learning during the development of this project was the integration of the Amazon Translate service to enable the functionality for users to get translated versions of movie reviews. This requires an in-depth understanding of the AWS SDK for JavaScript in Node.js, specifically regarding the use of the Translate service. Understanding the proper configuration and setup of the AWS Translate client, handling request and response objects, and ensuring effective error handling are all part of the learning process.

In addition, I conducted research on best practices for building Lambda functions in AWS in order to ensure maintainability and performance of the application. For example, the util.ts file includes utility functions that are reused in different Lambda handlers to reduce code duplication and ease maintenance.

In the course of writing the code, I encountered situations where year and reviewer occupied a single port, so I added a new function to automatically determine the type and write code for the different types, thus distinguishing between the two.

In addition, I independently researched DynamoDB and its integration with AWS Lambda. A deep dive into DynamoDB's Global Secondary Index (GSI) was critical to achieving efficient querying capabilities. The implementations in getMovieById.ts and getMovieReviewsByMovie.ts demonstrate how to use the GSI to retrieve data based on non-primary key attributes.

To ensure the security and robustness of the application, security best practices in AWS Lambda and API Gateway were investigated. This involved properly setting up IAM roles and permissions, understanding the security implications of environment variables, and secure handling of sensitive information, as can be seen in the IAM role configuration in the rest-api-stack.ts file.

Last but not least, I learned to apply a form of AWS cloud monitoring, e.g. I can watch my specific logs via the CloudWatch option to further find out where the problem is and monitor every API call request. Such a setup would allow me to more effectively identify specific error messages for better resolution.

![](https://github.com/Yolanda2002/ts-cdk-ca1/blob/main/pic/12.png)

![](https://github.com/Yolanda2002/ts-cdk-ca1/blob/main/pic/13.png)