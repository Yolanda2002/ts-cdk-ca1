## Typescript—CDK—Assignment1

**Name:** Jia Yang

**Video demonstration:** https://youtu.be/vZ7YGYqeNV8

This repository contains an implementation of a serverless REST API for the AWS platform. The CDK framework is used to provision its infrastructure. The API's domain context is movie reviews.



### API endpoints.

My Web API supports the following endpoints:

- POST /movies/reviews - Add a movie review.

  ![image-20240313234325650](C:\Users\Yolanda Y\Desktop\md文件\Typora图片路径\image-20240313234325650.png)
  

- GET /movies/reviews - Get all the movie reviews.（I Added.)

  ![image-20240314220347477](C:\Users\Yolanda Y\Desktop\md文件\Typora图片路径\image-20240314220347477.png)

- GET /movies/{movieId}/reviews - Get all the reviews for the specified movie.

  ![image-20240314224126408](C:\Users\Yolanda Y\Desktop\md文件\Typora图片路径\image-20240314224126408.png)

- GET /movies/{movieId}/reviews?minRating=n - Get the reviews for the specified movie with a rating greater than the minRating.

  ![image-20240314233137008](C:\Users\Yolanda Y\Desktop\md文件\Typora图片路径\image-20240314233137008.png)

- GET /movies/{movieId}/reviews/{reviewerName} - Get the review written by the named reviewer for the specified movie.

  ![image-20240315213547662](C:\Users\Yolanda Y\Desktop\md文件\Typora图片路径\image-20240315213547662.png)

- GET /movies/{movieId}/reviews/{year} - Get the reviews written in a specific year for a specific movie.

  ![image-20240316231934191](C:\Users\Yolanda Y\Desktop\md文件\Typora图片路径\image-20240316231934191.png)

- PUT /movies/{movieId}/reviews/{reviewerName} - Update the text of a review.

  ![image-20240315220021653](C:\Users\Yolanda Y\Desktop\md文件\Typora图片路径\image-20240315220021653.png)

- POST /reviews/{reviewerName} - Add a review written by a specific reviewer. ( I added.)

  ![image-20240316210004140](C:\Users\Yolanda Y\Desktop\md文件\Typora图片路径\image-20240316210004140.png)

- GET /reviews/{reviewerName} - Get all the reviews written by a specific reviewer.

  ![image-20240316213705681](C:\Users\Yolanda Y\Desktop\md文件\Typora图片路径\image-20240316213705681.png)

- GET /reviews/{reviewerName}/{movieId}/translation?language=code - Get a translated version of a movie review using the movie ID and reviewer name as the identifier.

- All the API endpoints： 

  ![image-20240317002633758](C:\Users\Yolanda Y\Desktop\md文件\Typora图片路径\image-20240317002633758.png)

  ![image-20240317002704607](C:\Users\Yolanda Y\Desktop\md文件\Typora图片路径\image-20240317002704607.png)



### Independent learning (If relevant).

An important area of independent learning during the development of this project was the integration of the Amazon Translate service to enable the functionality for users to get translated versions of movie reviews. This requires an in-depth understanding of the AWS SDK for JavaScript in Node.js, specifically regarding the use of the Translate service. Understanding the proper configuration and setup of the AWS Translate client, handling request and response objects, and ensuring effective error handling are all part of the learning process.

In addition, I conducted research on best practices for building Lambda functions in AWS in order to ensure maintainability and performance of the application. For example, the util.ts file includes utility functions that are reused in different Lambda handlers to reduce code duplication and ease maintenance.

In the course of writing the code, I encountered situations where year and reviewer occupied a single port, so I added a new function to automatically determine the type and write code for the different types, thus distinguishing between the two.

In addition, I independently researched DynamoDB and its integration with AWS Lambda. A deep dive into DynamoDB's Global Secondary Index (GSI) was critical to achieving efficient querying capabilities. The implementations in getMovieById.ts and getMovieReviewsByMovie.ts demonstrate how to use the GSI to retrieve data based on non-primary key attributes.

To ensure the security and robustness of the application, security best practices in AWS Lambda and API Gateway were investigated. This involved properly setting up IAM roles and permissions, understanding the security implications of environment variables, and secure handling of sensitive information, as can be seen in the IAM role configuration in the rest-api-stack.ts file.

Last but not least, I learned to apply a form of AWS cloud monitoring, e.g. I can watch my specific logs via the CloudWatch option to further find out where the problem is and monitor every API call request. Such a setup would allow me to more effectively identify specific error messages for better resolution.

![image-20240317004722545](C:\Users\Yolanda Y\Desktop\md文件\Typora图片路径\image-20240317004722545.png)

![image-20240317004747698](C:\Users\Yolanda Y\Desktop\md文件\Typora图片路径\image-20240317004747698.png)