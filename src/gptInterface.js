const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();

exports.handler = async (event) => {
  const { body } = event;
  const requestBody = JSON.parse(body);
  requestBody.isGPT = true;

  const params = {
    FunctionName: 'cs4-gpt-plugin-poc01-dev-get-quote',
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: JSON.stringify(requestBody),
  };

  try {
    const response = await lambda.invoke(params).promise();
    const responseData = response;
    const { Payload } = responseData;

    return JSON.parse(Payload);
  } catch (error) {
    console.error('Error calling get-quote API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error calling get-quote API' }),
    };
  }
};
