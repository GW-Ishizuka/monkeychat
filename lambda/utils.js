// utils.js
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const apigw = new AWS.ApiGatewayManagementApi({
  endpoint: process.env.APIG_ENDPOINT // "abcdef.execute-api.region.amazonaws.com/production"
});

module.exports = { ddb, apigw };