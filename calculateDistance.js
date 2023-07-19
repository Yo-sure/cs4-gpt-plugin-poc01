// LookupTable 생성을 위해 작성된 파일입니다.
/* eslint-disable */

const portCoordinates = {
  CNSHA: { lat: 31.2304, lon: 121.4737 },
  DEHAM: { lat: 53.5511, lon: 9.9937 },
  KRPUS: { lat: 35.1796, lon: 129.0756 },
  NLRTM: { lat: 51.9225, lon: 4.4791 },
  USLGB: { lat: 33.4520, lon: -118.1290 },
};

function calculateDistance(coord1, coord2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(coord2.lat - coord1.lat);
  const dLon = deg2rad(coord2.lon - coord1.lon);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(deg2rad(coord1.lat)) * Math.cos(deg2rad(coord2.lat))
        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

const distanceLookupTable = {};
Object.keys(portCoordinates).forEach((port1) => {
  distanceLookupTable[port1] = {};
  Object.keys(portCoordinates).forEach((port2) => {
    // eslint-disable-next-line max-len
    distanceLookupTable[port1][port2] = calculateDistance(portCoordinates[port1], portCoordinates[port2]);
  });
});

console.log(distanceLookupTable);
