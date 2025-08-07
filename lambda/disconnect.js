// disconnect.js
const { ddb } = require('./utils');
exports.handler = async event => {
  const connectionId = event.requestContext.connectionId;
  await ddb.delete({
    TableName: process.env.TABLE_NAME,
    Key: { connectionId }
  }).promise();
  return { statusCode: 200 };
};