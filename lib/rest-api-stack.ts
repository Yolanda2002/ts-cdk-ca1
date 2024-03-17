// 定义cdk，每个表是什么资源，什么时候丢弃，初始化数据库内的数据，创建网关，定义API及其名称
import * as cdk from "aws-cdk-lib";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as custom from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { generateBatch } from "../shared/util";
import { movies, movieCasts, movieReviews } from "../seed/movies";
import * as apig from "aws-cdk-lib/aws-apigateway";
import * as iam from 'aws-cdk-lib/aws-iam';

//定义cdk类来创建api
export class RestAPIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Tables 创建cdk中使用的表格
    const moviesTable = new dynamodb.Table(this, "MoviesTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Movies",
    });

    const movieCastsTable = new dynamodb.Table(this, "MovieCastTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "movieId", type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: "actorName", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "MovieCast",
    });

    movieCastsTable.addLocalSecondaryIndex({
      indexName: "roleIx",
      sortKey: { name: "roleName", type: dynamodb.AttributeType.STRING },
    });

    // 我新加的MovieReviews表
    const movieReviewsTable = new dynamodb.Table(this, 'MovieReviewsTable', {
      partitionKey: { name: 'MovieId', type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: 'ReviewDate', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: 'MovieReviews',
    });

    movieReviewsTable.addGlobalSecondaryIndex({
      indexName: 'ReviewerNameIndex', // 给新索引一个唯一的名称
      partitionKey: { name: 'MovieId', type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: 'ReviewerName', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });
    movieReviewsTable.addGlobalSecondaryIndex({
      indexName: 'ReviewDateIndex', // 新索引的名称
      partitionKey: { name: 'MovieId', type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: 'ReviewDate', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL, // 选择 INCLUDE 如果不需要所有的属性
    });

    movieReviewsTable.addGlobalSecondaryIndex({
      indexName: 'OnlyReviewerNameIndex',
      partitionKey: { name: 'ReviewerName', type: dynamodb.AttributeType.STRING }, // 使用 ReviewerName 作为 GSI 的分区键
      projectionType: dynamodb.ProjectionType.ALL,
    });


    // Functions 
    const getMovieByIdFn = new lambdanode.NodejsFunction(
      this,
      "GetMovieByIdFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: `${__dirname}/../lambdas/getMovieById.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: moviesTable.tableName,
          REGION: 'eu-west-1',
        },
      }
    );

    // 具体的getmoviesfunction
    const getAllMoviesFn = new lambdanode.NodejsFunction(
      this,
      "GetAllMoviesFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: `${__dirname}/../lambdas/getAllMovies.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: moviesTable.tableName,
          REGION: 'eu-west-1',
        },
      }
    );

    new custom.AwsCustomResource(this, "moviesddbInitData", {
      onCreate: {
        service: "DynamoDB",
        action: "batchWriteItem",
        parameters: {
          RequestItems: {
            [moviesTable.tableName]: generateBatch(movies),
            [movieCastsTable.tableName]: generateBatch(movieCasts),
            [movieCastsTable.tableName]: generateBatch(movieReviews) // Added
          },
        },
        physicalResourceId: custom.PhysicalResourceId.of("moviesddbInitData"), //.of(Date.now().toString()),
      },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [moviesTable.tableArn, movieCastsTable.tableArn, movieReviewsTable.tableArn],  // Includes movie cast and movie reviews
      }),
    });

    const newMovieFn = new lambdanode.NodejsFunction(this, "AddMovieFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: `${__dirname}/../lambdas/addMovie.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: moviesTable.tableName,
        REGION: "eu-west-1",
      },
    });

    const deleteMovieFn = new lambdanode.NodejsFunction(this, "DeleteMovieFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: `${__dirname}/../lambdas/deleteMovie.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: moviesTable.tableName,
        REGION: "eu-west-1",
      },
    });

    const getMovieCastMembersFn = new lambdanode.NodejsFunction(
      this,
      "GetCastMemberFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: `${__dirname}/../lambdas/getMovieCastMember.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: movieCastsTable.tableName,
          REGION: "eu-west-1",
        },
      }
    );

    //API作业1方法
    const addMovieReviewFn = new lambdanode.NodejsFunction(this, "AddMovieReviewFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: `${__dirname}/../lambdas/addMovieReview.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: movieReviewsTable.tableName, // 从CDK环境变量中引用评论表名称
        REGION: "eu-west-1",
      },
    });

    const getMovieReviewsFn = new lambdanode.NodejsFunction(this, "GetMovieReviewsFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `${__dirname}/../lambdas/getAllMovieReviews.ts`,
      environment: {
        TABLE_NAME: movieReviewsTable.tableName,
        REGION: "eu-west-1",
      },
    });

    const getMovieReviewsByMovieIdFn = new lambdanode.NodejsFunction(this, "GetMovieReviewsByMovieIdFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `${__dirname}/../lambdas/getMovieReviewsByMovieId.ts`,
      environment: {
        MOVIE_REVIEWS_TABLE: movieReviewsTable.tableName,
        REGION: "eu-west-1",
      },
    });

    const getMovieReviewsByMovieIdAndMinRatingFn = new lambdanode.NodejsFunction(this, "GetMovieReviewsByMovieIdAndMinRatingFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `${__dirname}/../lambdas/getMovieReviewsByMovieIdAndMinRating.ts`,
      environment: {
        MOVIE_REVIEWS_TABLE: movieReviewsTable.tableName,
        REGION: "eu-west-1",
      },
    });

    const getMovieReviewByReviewerFn = new lambdanode.NodejsFunction(this, "GetMovieReviewByReviewerFunction", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `${__dirname}/../lambdas/getMovieReviewByReviewer.ts`,
      environment: {
        MOVIE_REVIEWS_TABLE: movieReviewsTable.tableName,
        REGION: "eu-west-1",
      },
    });

    const updateMovieReviewFn = new lambdanode.NodejsFunction(this, "UpdateMovieReviewFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `${__dirname}/../lambdas/updateMovieReview.ts`,
      environment: {
        MOVIE_REVIEWS_TABLE: movieReviewsTable.tableName,
        REGION: "eu-west-1",
      },
    });

    const getReviewsByReviewerFn = new lambdanode.NodejsFunction(this, "GetReviewsByReviewerFunction", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `${__dirname}/../lambdas/getReviewsByReviewer.ts`,
      environment: {
        MOVIE_REVIEWS_TABLE: movieReviewsTable.tableName,
        REGION: "eu-west-1",
      },
    });

    const addReviewByReviewerFn = new lambdanode.NodejsFunction(this, "AddReviewByReviewerFunction", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `${__dirname}/../lambdas/addReviewByReviewer.ts`,
      environment: {
        MOVIE_REVIEWS_TABLE: movieReviewsTable.tableName,
        REGION: "eu-west-1",
      },
    });

    const getReviewByIdAndReviewerFn = new lambdanode.NodejsFunction(this, "GetReviewByIdAndReviewerFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `${__dirname}/../lambdas/getReviewByIdAndReviewer.ts`,
      environment: {
        MOVIE_REVIEWS_TABLE: movieReviewsTable.tableName,
        REGION: "eu-west-1",
      },
    });


    const translateFn = new lambdanode.NodejsFunction(this, "Translate", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `${__dirname}/../lambdas/translate.ts`,
      environment: {
        MOVIE_REVIEWS_TABLE: movieReviewsTable.tableName,
        REGION: "eu-west-1",
      },
    });

    const translatePolicy = new iam.PolicyStatement({
      actions: ["translate:TranslateText"],
      resources: ["*"],
    });
    translateFn.addToRolePolicy(translatePolicy);

    // Permissions 
    moviesTable.grantReadData(getMovieByIdFn)
    moviesTable.grantReadData(getAllMoviesFn)
    moviesTable.grantReadWriteData(newMovieFn)
    moviesTable.grantReadWriteData(deleteMovieFn)
    movieCastsTable.grantReadData(getMovieCastMembersFn);
    movieCastsTable.grantReadData(getMovieByIdFn)
    movieReviewsTable.grantWriteData(addMovieReviewFn);
    movieReviewsTable.grantReadData(getMovieReviewsFn);
    movieReviewsTable.grantReadData(getMovieReviewsByMovieIdFn);
    movieReviewsTable.grantReadData(getMovieReviewsByMovieIdAndMinRatingFn);
    movieReviewsTable.grantReadData(getMovieReviewByReviewerFn);
    movieReviewsTable.grantReadWriteData(updateMovieReviewFn);
    movieReviewsTable.grantReadData(getReviewsByReviewerFn);
    movieReviewsTable.grantWriteData(addReviewByReviewerFn);


    // REST API 添加API
    const api = new apig.RestApi(this, "RestAPI", {
      description: "demo api",
      deployOptions: {
        stageName: "dev",
      },
      defaultCorsPreflightOptions: {
        allowHeaders: ["Content-Type", "X-Amz-Date"],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
        allowCredentials: true,
        allowOrigins: ["*"],
      },
    });

    // /movies
    const moviesEndpoint = api.root.addResource("movies");
    moviesEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getAllMoviesFn, { proxy: true })
    );

    // /movies/{movieId}
    const movieEndpoint = moviesEndpoint.addResource("{movieId}");
    movieEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getMovieByIdFn, { proxy: true })
    );

    moviesEndpoint.addMethod(
      "POST",
      new apig.LambdaIntegration(newMovieFn, { proxy: true })
    );

    movieEndpoint.addMethod(
      "DELETE",
      new apig.LambdaIntegration(deleteMovieFn, { proxy: true })
    )

    // /movies/cast
    const movieCastEndpoint = moviesEndpoint.addResource("cast");
    movieCastEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getMovieCastMembersFn, { proxy: true })
    );


    // /movies/review
    const reviewsEndpoint = moviesEndpoint.addResource("reviews");
    reviewsEndpoint.addMethod(
      "POST",
      new apig.LambdaIntegration(addMovieReviewFn, { proxy: true })
    );

    reviewsEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getMovieReviewsFn, { proxy: true }));

    // /movies/{movieId}/reviews
    // /movies/{movieId}/reviews?minRating=n
    const movieReviewsSubEndpoint = movieEndpoint.addResource("reviews");
    movieReviewsSubEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getMovieReviewsByMovieIdFn, { proxy: true }));

    // /movies/{movieId}/reviews/{reviewerName}
    // /movies/{movieId}/reviews/{year}
    const reviewByReviewerEndpoint = movieReviewsSubEndpoint.addResource('{secondaryParam}');
    reviewByReviewerEndpoint.addMethod(
      'GET',
      new apig.LambdaIntegration(getMovieReviewByReviewerFn, { proxy: true })
    );
    reviewByReviewerEndpoint.addMethod(
      "PUT",
      new apig.LambdaIntegration(updateMovieReviewFn)
    );

    // /reviews/{reviewerName}
    const reviewsByReviewerEndpoint = api.root.addResource('reviews').addResource('{reviewerName}');
    reviewsByReviewerEndpoint.addMethod(
      'GET',
      new apig.LambdaIntegration(getReviewsByReviewerFn, { proxy: true })
    );
    reviewsByReviewerEndpoint.addMethod(
      'POST',
      new apig.LambdaIntegration(addReviewByReviewerFn, { proxy: true })
    );


    const reviewByIdAndReviewer = reviewsByReviewerEndpoint.addResource('{movieId}');
    reviewByIdAndReviewer.addMethod('GET', new apig.LambdaIntegration(getReviewByIdAndReviewerFn));

    const translateReview = reviewByIdAndReviewer.addResource('translation');
    translateReview.addMethod('GET', new apig.LambdaIntegration(translateFn));

  }
}

