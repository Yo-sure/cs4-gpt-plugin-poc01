const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const lambda = new AWS.Lambda();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function saveQuoteToDynamoDB(quote) {
  const quoteId = uuidv4();
  const params = {
    TableName: process.env.QUOTE_TABLE_NAME,
    Item: {
      quoteId,
      ...quote,
    },
  };

  try {
    await dynamoDB.put(params).promise();
    return quoteId;
  } catch (error) {
    console.error('Error saving quote to DynamoDB:', error);
    throw error;
  }
}

exports.handler = async (event) => {
  const { body } = event;
  let requestBody = JSON.parse(body);
  if (requestBody) requestBody.isGPT = true;
  else requestBody = { isGPT: true };

  const params = {
    FunctionName: 'cs4-gpt-plugin-poc01-dev-get-quote',
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: JSON.stringify(requestBody),
  };

  try {
    const response = await lambda.invoke(params).promise();
    const { Payload } = response;
    const responseData = JSON.parse(Payload);
    if (responseData.statusCode === 200) {
      const responseDataBody = JSON.parse(responseData.body);

      const responseForGPT = { ...responseDataBody.quote };
      responseForGPT.additionalInfo = {};
      responseForGPT.additionalInfo.currency = 'Won';
      responseForGPT.additionalInfo.expectedDepartureDate = requestBody && requestBody.originInfo?.departureRequestDate;
      responseForGPT.additionalInfo.expectedLeadTime = Math.floor(responseDataBody.distance / 100);
      responseForGPT.additionalInfo.totalCharge = responseForGPT.totalSum;
      delete responseForGPT.totalSum;

      const quoteId = await saveQuoteToDynamoDB(responseForGPT);
      responseForGPT.additionalInfo.quoteId = quoteId;
      responseForGPT.additionalInfo.quoteLinkUrl = `https://cellosquare.com/quote/${quoteId}`;
      return {
        statusCode: 200,
        body: JSON.stringify(responseForGPT),
      };
    }
    return responseData;
  } catch (error) {
    console.error('Error calling get-quote API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error calling get-quote API' }),
    };
  }
};
