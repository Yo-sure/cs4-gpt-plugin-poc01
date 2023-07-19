const DISTANCE_LOOKUP_TABLE = Object.freeze({
  CNSHA: {
    CNSHA: 0,
    DEHAM: 8522,
    KRPUS: 832,
    NLRTM: 8927,
    USLGB: 10487,
  },
  DEHAM: {
    CNSHA: 8522,
    DEHAM: 0,
    KRPUS: 8545,
    NLRTM: 412,
    USLGB: 9129,
  },
  KRPUS: {
    CNSHA: 832,
    DEHAM: 8545,
    KRPUS: 0,
    NLRTM: 8936,
    USLGB: 9667,
  },
  NLRTM: {
    CNSHA: 8927,
    DEHAM: 412,
    KRPUS: 8936,
    NLRTM: 0,
    USLGB: 9005,
  },
  USLGB: {
    CNSHA: 10487,
    DEHAM: 9129,
    KRPUS: 9667,
    NLRTM: 9005,
    USLGB: 0,
  },
});

const REQUIRED_FIELDS = new Set([
  'service',
  'originInfo.origin',
  'originInfo.departureRequestDate',
  'destinationInfo.destination',
  'cargoInfo.containerType',
  'cargoInfo.quantity',
  'cargoInfo.commodityType',
]);

const CONSTRAINTS = Object.freeze({
  service: ['air', 'ocean', 'express'],
  'originInfo.origin': ['CNSHA', 'DEHAM', 'KRPUS', 'NLRTM', 'USLGB'],
  'originInfo.originTruckingServiceYn': ['Y', 'N'],
  'destinationInfo.destination': ['CNSHA', 'DEHAM', 'KRPUS', 'NLRTM', 'USLGB'],
  'destinationInfo.destinationTruckingServiceYn': ['Y', 'N'],
  'cargoInfo.containerType': ['20FTNormalDry', '40FTNormalDry', '40FTHighCubic'],
  'cargoInfo.dangerousGoodsYn': ['Y', 'N'],
  'additionalOptions.labelingServiceYn': ['Y', 'N'],
  'additionalOptions.rePackingServiceYn': ['Y', 'N'],
});

const PROMOTION_CODE = Object.freeze({
  Tada: 200000,
  Neo: 1000000,
});

module.exports = {
  DISTANCE_LOOKUP_TABLE, REQUIRED_FIELDS, CONSTRAINTS, PROMOTION_CODE,
};
