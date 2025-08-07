const { ddb, apigw } = require('./utils');

exports.handler = async event => {
  try {
    // console.log("SendMessageFunction invoked");
    const { message, username } = JSON.parse(event.body);

    // DynamoDBスキャン
    const conns = await ddb.scan({ TableName: process.env.TABLE_NAME }).promise();

    // 各接続にメッセージを送信
    const postCalls = conns.Items.map(async ({ connectionId }) => {
      try {
        await apigw.postToConnection({
          ConnectionId: connectionId,
          Data: JSON.stringify({ username, message })
        }).promise();
      } catch (err) {
        if (err.statusCode === 410) {
          // console.log(`Stale connection, deleting ${connectionId}`);
          await ddb.delete({ TableName: process.env.TABLE_NAME, Key: { connectionId } }).promise();
        } else {
          console.error(`Failed to post to connection ${connectionId}`, err);
          throw err; // ←ここで例外を再スロー
        }
      }
    });

    await Promise.all(postCalls);
    return { statusCode: 200 };
  } catch (err) {
    console.error("Error in SendMessageFunction", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" })
    };
  }
};
