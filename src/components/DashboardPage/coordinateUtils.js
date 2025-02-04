import proj4 from "proj4";

export const convertToUTM = (lat, lng) => {
  const utmZone = Math.floor((lng + 180) / 6) + 1;
  const utmProj = `+proj=utm +zone=${utmZone} +datum=WGS84 +units=m +no_defs`;
  const [easting, northing] = proj4("EPSG:4326", utmProj, [lng, lat]);
  return { easting: easting.toFixed(2), northing: northing.toFixed(2), zone: utmZone };
}; 