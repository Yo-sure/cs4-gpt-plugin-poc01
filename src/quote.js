const AWS = require('aws-sdk');
const _ = require('lodash');
const {
  DISTANCE_LOOKUP_TABLE, REQUIRED_FIELDS, CONSTRAINTS, PROMOTION_CODE,
} = require('./constants-quote');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const calculateTotal = (obj) => Object.values(obj).reduce((sum, value) => sum + value, 0);

function calculateCharge(info, distance, cargoInfo) {
  if (info === 0) return 0;
  if (info.dangerousGoods && cargoInfo) return (info.baseCharges * cargoInfo.quantity) * 2 + (info.additionalCharges * cargoInfo.quantity) + (info.additionalCharges * distance * cargoInfo.containerType.substring(0, 2)) / 10;
  if (cargoInfo) return (info.baseCharges * cargoInfo.quantity) + (info.additionalCharges * cargoInfo.quantity) + (info.additionalCharges * distance * cargoInfo.containerType.substring(0, 2)) / 10;
  return info.baseCharges + (info.additionalCharges * distance) / 10;
}

function calculateWithTariff(requestBody, tariffInfo) {
  const {
    service, originInfo, destinationInfo, cargoInfo, promotionCode, additionalOptions,
  } = requestBody;

  // 운항거리를 가져옵니다.
  const distance = DISTANCE_LOOKUP_TABLE[originInfo.origin][destinationInfo.destination];

  // 각 요금을 계산합니다.
  // 1. internationalTransportationCost
  const freightChargeInfo = tariffInfo.find(
    (item) => item.tariffKey === 'freightCharge' && item.serviceType === service,
  );

  const internationalTransportationCost = {
    freightCharge: calculateCharge(freightChargeInfo, distance, cargoInfo),
    promotionDC: PROMOTION_CODE[promotionCode] ? PROMOTION_CODE[promotionCode] : 0,
  };
  internationalTransportationCost.transfortationSubTotal = internationalTransportationCost.freightCharge - internationalTransportationCost.promotionDC;
  if (internationalTransportationCost.transfortationSubTotal < 0) internationalTransportationCost.transfortationSubTotal = 0;

  // 2. originCost
  const originChargeInfo = tariffInfo.filter(
    (item) => item.serviceType === originInfo.origin,
  );
  const originWharfage = originChargeInfo.find((item) => item.tariffKey === 'wharfagePortCharge');
  const originTruck = originInfo.originTruckingServiceYn === 'Y' ? originChargeInfo.find((item) => item.tariffKey === 'truckFreightCharge') : 0;
  const originTerminal = originChargeInfo.find((item) => item.tariffKey === 'terminalHandlingCharge');
  const originHandling = originChargeInfo.find((item) => item.tariffKey === 'handlingFee');
  const originDocument = originChargeInfo.find((item) => item.tariffKey === 'documentCharge');
  const originAms = originChargeInfo.find((item) => item.tariffKey === 'amsCharge');
  const originSeal = (additionalOptions?.labelServiceYn === 'Y' || additionalOptions?.repackingServiceYn === 'Y') ? originChargeInfo.find((item) => item.tariffKey === 'containerSealCharge') : 0;

  if (cargoInfo.dangerousGoodsYn === 'Y') originHandling.dangerousGoods = true;

  const originCost = {
    wharfagePortCharge: calculateCharge(originWharfage, distance, cargoInfo),
    truckFreightCharge: calculateCharge(originTruck, distance, cargoInfo),
    terminalHandlingCharge: calculateCharge(originTerminal, distance, cargoInfo),
    handlingFee: calculateCharge(originHandling, distance, cargoInfo),
    documentCharge: calculateCharge(originDocument, distance),
    amsCharge: calculateCharge(originAms, distance),
    containerSealCharge: calculateCharge(originSeal, distance, cargoInfo),
  };

  originCost.originSubTotal = calculateTotal(originCost);

  // 3. destinationCost
  const destinationChargeInfo = tariffInfo.filter(
    (item) => item.serviceType === destinationInfo.destination,
  );

  const destinationWharfage = destinationChargeInfo.find((item) => item.tariffKey === 'wharfagePortCharge');
  const destinationTruck = destinationInfo.destinationTruckingServiceYn === 'Y' ? destinationChargeInfo.find((item) => item.tariffKey === 'truckFreightCharge') : 0;
  const destinationTerminal = destinationChargeInfo.find((item) => item.tariffKey === 'terminalHandlingCharge');
  const destinationHandling = destinationChargeInfo.find((item) => item.tariffKey === 'handlingFee');
  const destinationDocument = destinationChargeInfo.find((item) => item.tariffKey === 'documentCharge');
  const destinationAms = destinationChargeInfo.find((item) => item.tariffKey === 'amsCharge');

  const destinationCost = {
    wharfagePortCharge: calculateCharge(destinationWharfage, distance, cargoInfo),
    truckFreightCharge: calculateCharge(destinationTruck, distance, cargoInfo),
    terminalHandlingCharge: calculateCharge(destinationTerminal, distance, cargoInfo),
    handlingFee: calculateCharge(destinationHandling, distance, cargoInfo),
    documentCharge: calculateCharge(destinationDocument, distance),
    amsCharge: calculateCharge(destinationAms, distance),
  };

  destinationCost.destinationSubTotal = calculateTotal(destinationCost);

  // 총 요금을 계산합니다.
  const totalSum = internationalTransportationCost.transfortationSubTotal + originCost.originSubTotal + destinationCost.destinationSubTotal;

  // 요금 정보를 반환합니다.
  return {
    internationalTransportationCost,
    originCost,
    destinationCost,
    totalSum,
  };
}

async function getTariffInfo() {
  const params = {
    TableName: process.env.TARIFF_TABLE_NAME,
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    return data.Items;
  } catch (error) {
    console.error(error);
    return {
      hasError: true,
    };
  }
}

async function calculateQuote(requestBody) {
  // 요금 정보를 가져옵니다.
  const tariffInfo = await getTariffInfo();
  if (tariffInfo.hasError) throw new Error('DB select Failed!');

  // 요금을 계산합니다.
  const quote = calculateWithTariff(requestBody, tariffInfo);
  return quote;
}

function validateConstraints(body) {
  const constraintViolations = [];

  Object.keys(CONSTRAINTS).forEach((fieldPath) => {
    const value = _.get(body, fieldPath);
    const constraints = CONSTRAINTS[fieldPath];

    if (value !== undefined && constraints && !constraints.includes(value)) {
      // 값이 제약사항을 위반하는 경우, 제약사항 위반 목록에 추가합니다.
      constraintViolations.push({
        field: fieldPath,
        validValues: constraints,
      });
    }
  });

  return constraintViolations;
}

function validateRequiredFields(body) {
  const missingFields = [];

  REQUIRED_FIELDS.forEach((field) => {
    const value = _.get(body, field);

    if (value === undefined || value === '') {
      // 필수 필드가 누락되었거나 빈 문자열인 경우, 누락된 필드 목록에 추가합니다.
      missingFields.push({
        field,
        validValues: CONSTRAINTS[field] || 'Any non-empty value',
      });
    }
  });

  return missingFields;
}

module.exports.handler = async (event) => {
  let requestBody;
  if (event.isGPT) {
    requestBody = event;
  } else {
    requestBody = JSON.parse(event.body);
  }

  // 필수 필드 중 누락된 것을 찾습니다.
  const requiredFieldEmpty = validateRequiredFields(requestBody);

  // 제약사항을 위반하는 필드를 찾습니다.
  const constraintViolations = validateConstraints(requestBody);

  let response = {};
  // 만약 누락된 값이 있다면 응답을 반환합니다.
  if (requiredFieldEmpty.length > 0) {
    response = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Provide additional required values and try again.',
        additionalInfo: {
          requiredFieldEmpty,
        },
      }),
    };
  } else if (constraintViolations.length > 0) {
    // 만약 제약사항을 위반하는 값이 있다면 응답을 반환합니다.
    response = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Some fields violate constraints. Please correct them and try again.',
        additionalInfo: {
          constraintViolations,
        },
      }),
    };
  } else if (requiredFieldEmpty.length === 0 && constraintViolations.length === 0) {
    // 누락된 필수값이 없다면, 견적을 계산하여 반환합니다.
    const quote = await calculateQuote(requestBody);
    try {
      response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Quote created successfully',
          quote,
          distance: DISTANCE_LOOKUP_TABLE[requestBody.originInfo.origin][requestBody.destinationInfo.destination],
        }),
      };
    } catch (err) {
      response = {
        statusCode: 500,
        body: JSON.stringify({
          message: 'An error occurred while calculating the quote.',
          error: err.message,
        }),
      };
    }
  }

  return response;
};
