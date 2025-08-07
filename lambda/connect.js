// connect.js
const { ddb } = require('./utils');
exports.handler = async event => {
  const connectionId = event.requestContext.connectionId;
  await ddb.put({
    TableName: process.env.TABLE_NAME,
    Item: { connectionId }
  }).promise();
  return { statusCode: 200 };
};
