import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'bestsellers',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      PRODUCTS_TABLE: 'ProductsTable-${sls:stage}',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:PutItem',
              'dynamodb:GetItem',
              'dynamodb:Scan',
              'dynamodb:Query',
            ],
            Resource: [
              { 'Fn::GetAtt': ['ProductsTable', 'Arn'] }
            ],
          },
        ],
      },
    },
  },

  resources: {
    Resources: {
      ProductsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'ProductsTable-${sls:stage}',
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' }
          ],
          KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }
          ],
          BillingMode: 'PAY_PER_REQUEST',
        },
      },
    },
  },

  functions: {
    getProducts: {
      handler: `src/functions/getProducts/handler.main`,
      events: [
        {
          http: {
            method: 'get',
            path: 'products',
            cors: true,
          },
        },
      ],
    },
  }
}

module.exports = serverlessConfiguration;