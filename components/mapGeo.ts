// Where a job's location goes on the map. Shared verbatim by the technical,
// corporate and supply chain sites (components/mapGeo.ts in each repo).
//
// Tyler 11/13: "why aren't there pins for every role on the websites?" Each
// map used to look a city up in its own short hand-made table and silently
// skip any job whose city was missing (Halifax, Regina, Granby, Dartmouth,
// Moncton, ...), and turned a full state or province name into its first two
// letters ("Texas" -> TE, "Pennsylvania" -> PE, "Maine" -> MA). Now: a known
// city pins on the city; an unknown one falls back to its province or state;
// a bare region or country ("Ontario", "Remote (US)") pins on that. Only a
// location with no place in it at all ("Remote") gets no pin.

export type Place = { key: string; label: string; lat: number; lng: number; region: string | null };

type LL = { lat: number; lng: number };

export const CITY_COORDS: Record<string, LL> = {
  // Ontario
  'toronto,on': { lat: 43.6532, lng: -79.3832 },
  'etobicoke,on': { lat: 43.6205, lng: -79.5132 },
  'mississauga,on': { lat: 43.589, lng: -79.6441 },
  'brampton,on': { lat: 43.7315, lng: -79.7624 },
  'bolton,on': { lat: 43.8742, lng: -79.7339 },
  'concord,on': { lat: 43.8, lng: -79.4833 },
  'newmarket,on': { lat: 44.0592, lng: -79.4613 },
  'richmond hill,on': { lat: 43.8828, lng: -79.4403 },
  'ajax,on': { lat: 43.8509, lng: -79.0204 },
  'oakville,on': { lat: 43.4675, lng: -79.6877 },
  'burlington,on': { lat: 43.3255, lng: -79.799 },
  'hamilton,on': { lat: 43.2557, lng: -79.8711 },
  'brantford,on': { lat: 43.1394, lng: -80.2644 },
  'cambridge,on': { lat: 43.3601, lng: -80.3127 },
  'kitchener,on': { lat: 43.4516, lng: -80.4925 },
  'guelph,on': { lat: 43.5448, lng: -80.2482 },
  'orangeville,on': { lat: 43.9197, lng: -80.0943 },
  'barrie,on': { lat: 44.3894, lng: -79.6903 },
  'midhurst,on': { lat: 44.4419, lng: -79.7192 },
  'peterborough,on': { lat: 44.3091, lng: -78.3197 },
  'port hope,on': { lat: 43.9512, lng: -78.293 },
  'cobourg,on': { lat: 43.9593, lng: -78.1677 },
  'ottawa,on': { lat: 45.4215, lng: -75.6972 },
  'london,on': { lat: 42.9849, lng: -81.2453 },
  'goderich,on': { lat: 43.7501, lng: -81.7165 },
  'sarnia,on': { lat: 42.9745, lng: -82.4066 },
  'chatham,on': { lat: 42.4048, lng: -82.191 },
  'windsor,on': { lat: 42.3149, lng: -83.0364 },
  'maidstone,on': { lat: 42.2333, lng: -82.8833 },
  // Quebec
  'montreal,qc': { lat: 45.5019, lng: -73.5674 },
  'lachine,qc': { lat: 45.4351, lng: -73.6776 },
  'laval,qc': { lat: 45.6066, lng: -73.7124 },
  'boisbriand,qc': { lat: 45.6128, lng: -73.8392 },
  'granby,qc': { lat: 45.4001, lng: -72.7333 },
  'south shore montreal,qc': { lat: 45.5312, lng: -73.5181 }, // Rive-Sud / Longueuil
  'quebec city,qc': { lat: 46.8139, lng: -71.208 },
  // Atlantic
  'halifax,ns': { lat: 44.6488, lng: -63.5752 },
  'dartmouth,ns': { lat: 44.6713, lng: -63.5772 },
  'truro,ns': { lat: 45.3667, lng: -63.2667 },
  'moncton,nb': { lat: 46.0878, lng: -64.7782 },
  'saint john,nb': { lat: 45.2733, lng: -66.0633 },
  "st. john's,nl": { lat: 47.5615, lng: -52.7126 },
  "st john's,nl": { lat: 47.5615, lng: -52.7126 },
  // West
  'winnipeg,mb': { lat: 49.8951, lng: -97.1384 },
  'regina,sk': { lat: 50.4452, lng: -104.6189 },
  'saskatoon,sk': { lat: 52.1332, lng: -106.67 },
  'calgary,ab': { lat: 51.0447, lng: -114.0719 },
  'edmonton,ab': { lat: 53.5461, lng: -113.4938 },
  'vancouver,bc': { lat: 49.2827, lng: -123.1207 },
  'delta,bc': { lat: 49.0847, lng: -123.0587 },
  'surrey,bc': { lat: 49.1913, lng: -122.849 },
  // US
  'new york,ny': { lat: 40.7128, lng: -74.006 },
  'buffalo,ny': { lat: 42.8864, lng: -78.8784 },
  'boston,ma': { lat: 42.3601, lng: -71.0589 },
  'auburn,me': { lat: 44.0979, lng: -70.2312 },
  'carlisle,pa': { lat: 40.2017, lng: -77.1997 },
  'york,pa': { lat: 39.9626, lng: -76.7277 },
  'kutztown,pa': { lat: 40.5173, lng: -75.7774 },
  'chicago,il': { lat: 41.8781, lng: -87.6298 },
  'detroit,mi': { lat: 42.3314, lng: -83.0458 },
  'columbus,oh': { lat: 39.9612, lng: -82.9988 },
  'cincinnati,oh': { lat: 39.1031, lng: -84.512 },
  'monroe,oh': { lat: 39.4392, lng: -84.3622 },
  'amherst,wi': { lat: 44.4508, lng: -89.2829 },
  'minneapolis,mn': { lat: 44.9778, lng: -93.265 },
  'charlotte,nc': { lat: 35.2271, lng: -80.8431 },
  'greensboro,nc': { lat: 36.0726, lng: -79.792 },
  'atlanta,ga': { lat: 33.749, lng: -84.388 },
  'alpharetta,ga': { lat: 34.0754, lng: -84.2941 },
  'nashville,tn': { lat: 36.1627, lng: -86.7816 },
  'memphis,tn': { lat: 35.1495, lng: -90.049 },
  'chattanooga,tn': { lat: 35.0456, lng: -85.3097 },
  'miami,fl': { lat: 25.7617, lng: -80.1918 },
  'tampa,fl': { lat: 27.9506, lng: -82.4572 },
  'dallas,tx': { lat: 32.7767, lng: -96.797 },
  'houston,tx': { lat: 29.7604, lng: -95.3698 },
  'denver,co': { lat: 39.7392, lng: -104.9903 },
  'phoenix,az': { lat: 33.4484, lng: -112.074 },
  'los angeles,ca': { lat: 34.0522, lng: -118.2437 },
  'northern los angeles,ca': { lat: 34.2381, lng: -118.5301 }, // San Fernando Valley
  'seattle,wa': { lat: 47.6062, lng: -122.3321 },
};

// Province / state names and codes -> code, and a point for each (the main
// population centre, so a fallback pin lands where the jobs usually are).
const REGIONS: Record<string, { name: string; lat: number; lng: number }> = {
  AB: { name: 'Alberta', lat: 52.3, lng: -113.8 }, BC: { name: 'British Columbia', lat: 49.7, lng: -123.1 },
  MB: { name: 'Manitoba', lat: 50.4, lng: -97.6 }, NB: { name: 'New Brunswick', lat: 46.2, lng: -65.8 },
  NL: { name: 'Newfoundland and Labrador', lat: 48.5, lng: -55.5 }, NS: { name: 'Nova Scotia', lat: 44.9, lng: -63.6 },
  ON: { name: 'Ontario', lat: 43.9, lng: -79.6 }, PE: { name: 'Prince Edward Island', lat: 46.3, lng: -63.2 },
  QC: { name: 'Quebec', lat: 45.9, lng: -72.9 }, SK: { name: 'Saskatchewan', lat: 51.3, lng: -105.6 },
  NT: { name: 'Northwest Territories', lat: 62.45, lng: -114.4 }, NU: { name: 'Nunavut', lat: 63.75, lng: -68.5 },
  YT: { name: 'Yukon', lat: 60.72, lng: -135.05 },
  AL: { name: 'Alabama', lat: 32.8, lng: -86.8 }, AK: { name: 'Alaska', lat: 61.2, lng: -149.9 },
  AZ: { name: 'Arizona', lat: 33.5, lng: -112.1 }, AR: { name: 'Arkansas', lat: 34.8, lng: -92.3 },
  CA: { name: 'California', lat: 36.1, lng: -119.7 }, CO: { name: 'Colorado', lat: 39.7, lng: -105.0 },
  CT: { name: 'Connecticut', lat: 41.6, lng: -72.7 }, DE: { name: 'Delaware', lat: 39.2, lng: -75.5 },
  DC: { name: 'District of Columbia', lat: 38.9, lng: -77.0 }, FL: { name: 'Florida', lat: 28.1, lng: -81.6 },
  GA: { name: 'Georgia', lat: 33.7, lng: -84.4 }, HI: { name: 'Hawaii', lat: 21.3, lng: -157.8 },
  ID: { name: 'Idaho', lat: 43.6, lng: -116.2 }, IL: { name: 'Illinois', lat: 41.6, lng: -88.5 },
  IN: { name: 'Indiana', lat: 39.8, lng: -86.2 }, IA: { name: 'Iowa', lat: 41.9, lng: -93.4 },
  KS: { name: 'Kansas', lat: 38.5, lng: -97.5 }, KY: { name: 'Kentucky', lat: 37.8, lng: -85.0 },
  LA: { name: 'Louisiana', lat: 30.6, lng: -91.5 }, ME: { name: 'Maine', lat: 44.3, lng: -69.8 },
  MD: { name: 'Maryland', lat: 39.1, lng: -76.8 }, MA: { name: 'Massachusetts', lat: 42.3, lng: -71.4 },
  MI: { name: 'Michigan', lat: 42.7, lng: -84.0 }, MN: { name: 'Minnesota', lat: 45.0, lng: -93.5 },
  MS: { name: 'Mississippi', lat: 32.7, lng: -89.7 }, MO: { name: 'Missouri', lat: 38.6, lng: -92.2 },
  MT: { name: 'Montana', lat: 46.9, lng: -110.4 }, NE: { name: 'Nebraska', lat: 41.1, lng: -97.0 },
  NV: { name: 'Nevada', lat: 37.2, lng: -116.4 }, NH: { name: 'New Hampshire', lat: 43.2, lng: -71.5 },
  NJ: { name: 'New Jersey', lat: 40.3, lng: -74.5 }, NM: { name: 'New Mexico', lat: 34.8, lng: -106.2 },
  NY: { name: 'New York', lat: 42.2, lng: -74.9 }, NC: { name: 'North Carolina', lat: 35.6, lng: -79.4 },
  ND: { name: 'North Dakota', lat: 47.5, lng: -100.5 }, OH: { name: 'Ohio', lat: 40.3, lng: -82.8 },
  OK: { name: 'Oklahoma', lat: 35.6, lng: -97.0 }, OR: { name: 'Oregon', lat: 44.6, lng: -122.6 },
  PA: { name: 'Pennsylvania', lat: 40.6, lng: -77.2 }, RI: { name: 'Rhode Island', lat: 41.7, lng: -71.5 },
  SC: { name: 'South Carolina', lat: 33.9, lng: -80.9 }, SD: { name: 'South Dakota', lat: 44.3, lng: -99.4 },
  TN: { name: 'Tennessee', lat: 35.9, lng: -86.4 }, TX: { name: 'Texas', lat: 31.1, lng: -97.6 },
  UT: { name: 'Utah', lat: 40.4, lng: -111.9 }, VT: { name: 'Vermont', lat: 44.0, lng: -72.7 },
  VA: { name: 'Virginia', lat: 37.8, lng: -78.2 }, WA: { name: 'Washington', lat: 47.4, lng: -121.5 },
  WV: { name: 'West Virginia', lat: 38.5, lng: -80.9 }, WI: { name: 'Wisconsin', lat: 44.3, lng: -89.6 },
  WY: { name: 'Wyoming', lat: 42.8, lng: -107.3 },
};

const REGION_BY_NAME: Record<string, string> = Object.keys(REGIONS).reduce((m, code) => {
  m[REGIONS[code].name.toLowerCase()] = code;
  return m;
}, { 'québec': 'QC', newfoundland: 'NL', 'washington state': 'WA' } as Record<string, string>);

const COUNTRIES = {
  US: { key: 'country:us', label: 'United States', lat: 39.5, lng: -95.0 },
  CA: { key: 'country:ca', label: 'Canada', ...REGIONS.ON },
};

export const regionCode = (text: string): string | null => {
  const t = text.trim().toLowerCase().replace(/\.$/, '');
  if (REGION_BY_NAME[t]) return REGION_BY_NAME[t];
  const up = t.toUpperCase();
  return REGIONS[up] ? up : null;
};

// overrides: exact location strings a site pins on a chosen city key
// ("Remote (US)" -> Chicago), checked before anything else.
export const placeLocation = (
  raw: string,
  overrides: Record<string, { key: string; label: string }> = {},
): Place | null => {
  if (!raw) return null;
  const exact = overrides[raw.trim()];
  if (exact && CITY_COORDS[exact.key]) {
    const code = exact.key.split(',')[1]?.toUpperCase() || null;
    return { key: exact.key, label: exact.label, ...CITY_COORDS[exact.key], region: code };
  }
  if (/\bGTA\b|greater toronto/i.test(raw)) {
    return { key: 'toronto,on', label: 'Toronto, ON', ...CITY_COORDS['toronto,on'], region: 'ON' };
  }
  const base = raw
    .replace(/\([^)]*\)/g, ' ')            // "(Hybrid)", "(Remote)", "(On-site)"
    .split(/\s+or\s+/i)[0]                  // "Carlisle, PA or Columbus, OH" -> Carlisle
    .replace(/^\s*remote\s*\/\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  const parts = base.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const code = regionCode(parts[parts.length - 1]);
    const city = parts[0].split('/')[0].trim();   // "Truro/Dartmouth" -> Truro
    if (code) {
      const key = `${city.toLowerCase()},${code.toLowerCase()}`;
      if (CITY_COORDS[key]) return { key, label: `${city}, ${code}`, ...CITY_COORDS[key], region: code };
      const r = REGIONS[code];
      return { key: `region:${code}`, label: r.name, lat: r.lat, lng: r.lng, region: code };
    }
  }
  // One word or phrase: a province / state ("Ontario", "Michigan (Remote)").
  const lone = regionCode(parts[0] || base);
  if (lone) return { key: `region:${lone}`, label: REGIONS[lone].name, lat: REGIONS[lone].lat, lng: REGIONS[lone].lng, region: lone };
  if (/\b(usa?|united states|u\.s\.)\b/i.test(raw)) return { ...COUNTRIES.US, region: null };
  if (/\bcanada\b/i.test(raw)) return { ...COUNTRIES.CA, region: null };
  return null;
};
