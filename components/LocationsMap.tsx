import React, { useEffect, useRef, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { ArrowRight, MapPin, DollarSign } from 'lucide-react';
import { JobPosting } from '../types';
import { jobService } from '../services/jobService';
import ApplicationModal from './ApplicationModal';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const NA_COUNTRY_IDS = new Set(['124', '840', '484']); // Canada, USA, Mexico

const HQ = { lat: 43.6532, lng: -79.3832 }; // Toronto

// Hand-curated geocoder for the cities we actually recruit in. Add a new one
// with a single line. Keys are "city,provincecode" (lowercase).
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'toronto,on': { lat: 43.6532, lng: -79.3832 },
  'ajax,on': { lat: 43.8509, lng: -79.0204 },
  'brampton,on': { lat: 43.7315, lng: -79.7624 },
  'burlington,on': { lat: 43.3255, lng: -79.799 },
  'cambridge,on': { lat: 43.3601, lng: -80.3127 },
  'concord,on': { lat: 43.8, lng: -79.4833 },
  'goderich,on': { lat: 43.7501, lng: -81.7165 },
  'hamilton,on': { lat: 43.2557, lng: -79.8711 },
  'kitchener,on': { lat: 43.4516, lng: -80.4925 },
  'london,on': { lat: 42.9849, lng: -81.2453 },
  'mississauga,on': { lat: 43.589, lng: -79.6441 },
  'oakville,on': { lat: 43.4675, lng: -79.6877 },
  'ottawa,on': { lat: 45.4215, lng: -75.6972 },
  'calgary,ab': { lat: 51.0447, lng: -114.0719 },
  'edmonton,ab': { lat: 53.5461, lng: -113.4938 },
  'laval,qc': { lat: 45.6066, lng: -73.7124 },
  'vancouver,bc': { lat: 49.2827, lng: -123.1207 },
  'saskatoon,sk': { lat: 52.1332, lng: -106.67 },
  'winnipeg,mb': { lat: 49.8951, lng: -97.1384 },
  'truro,ns': { lat: 45.3667, lng: -63.2667 },
};

const PROVINCE_CODES: Record<string, string> = {
  alberta: 'AB', 'british columbia': 'BC', manitoba: 'MB', 'new brunswick': 'NB',
  'newfoundland and labrador': 'NL', newfoundland: 'NL', 'nova scotia': 'NS',
  ontario: 'ON', 'prince edward island': 'PE', quebec: 'QC', 'québec': 'QC',
  saskatchewan: 'SK', 'northwest territories': 'NT', nunavut: 'NU', yukon: 'YT',
  ab: 'AB', bc: 'BC', mb: 'MB', nb: 'NB', nl: 'NL', ns: 'NS', on: 'ON',
  pe: 'PE', qc: 'QC', sk: 'SK', nt: 'NT', nu: 'NU', yt: 'YT',
};

const regionCode = (region: string): string => {
  const r = region.trim().toLowerCase();
  return PROVINCE_CODES[r] || region.trim().slice(0, 2).toUpperCase();
};

// Parse "City, Province" (or multi-city "A, B, Province") into a geocoder key.
const normalizeLocation = (raw: string): string | null => {
  if (!raw) return null;
  const cleaned = raw.replace(/remote\s*\/\s*/i, '').trim();
  const parts = cleaned.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const city = parts[0].toLowerCase();
  const code = regionCode(parts[parts.length - 1]).toLowerCase();
  return `${city},${code}`;
};

type JobPin = { lat: number; lng: number; key: string; label: string; jobs: JobPosting[] };

const groupJobsByCity = (jobs: JobPosting[]): JobPin[] => {
  const buckets = new Map<string, JobPin>();
  for (const job of jobs) {
    const key = normalizeLocation(job.location);
    if (!key) continue;
    const coords = CITY_COORDS[key];
    if (!coords) continue;
    const existing = buckets.get(key);
    if (existing) {
      existing.jobs.push(job);
    } else {
      const parts = job.location.replace(/remote\s*\/\s*/i, '').split(',').map((p) => p.trim());
      buckets.set(key, {
        ...coords,
        key,
        label: `${parts[0]}, ${regionCode(parts[parts.length - 1])}`,
        jobs: [job],
      });
    }
  }
  return Array.from(buckets.values());
};

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 700;

export default function LocationsMap() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [applyingTo, setApplyingTo] = useState<JobPosting | null>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    jobService.getJobsByDomain().then(setJobs);
  }, []);

  const pins = groupJobsByCity(jobs);
  const totalShown = pins.reduce((sum, p) => sum + p.jobs.length, 0);
  const unmapped = Math.max(0, jobs.length - totalShown);
  const hoveredPin = pins.find((p) => p.key === hoveredKey) || null;

  const handlePinEnter = (key: string) => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setHoveredKey(key);
  };

  const handlePinLeave = () => {
    closeTimer.current = window.setTimeout(() => setHoveredKey(null), 200);
  };

  return (
    <section className="relative bg-[#070b12] border-y border-white/5 overflow-hidden h-[70vh] min-h-[520px]">
      <div className="absolute inset-0">
        <ComposableMap
          projection="geoAlbers"
          projectionConfig={{ scale: 900, center: [-3, 42] }}
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: Array<{ rsmKey: string; id?: string }> }) =>
              geographies
                .filter((geo) => geo.id && NA_COUNTRY_IDS.has(geo.id))
                .map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#0E141E"
                    stroke="#1f2a38"
                    strokeWidth={0.6}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: '#0E141E' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
            }
          </Geographies>

          {/* HQ marker */}
          <Marker coordinates={[HQ.lng, HQ.lat]}>
            <rect x={-3.5} y={-3.5} width={7} height={7} fill="#5B6C7F" stroke="#9FA8B5" strokeWidth={1} />
          </Marker>

          {pins.map((pin) => {
            const isHovered = hoveredKey === pin.key;
            return (
              <Marker
                key={pin.key}
                coordinates={[pin.lng, pin.lat]}
                onMouseEnter={() => handlePinEnter(pin.key)}
                onMouseLeave={handlePinLeave}
                onClick={() => handlePinEnter(pin.key)}
                style={{
                  default: { cursor: 'pointer' },
                  hover: { cursor: 'pointer' },
                  pressed: { cursor: 'pointer' },
                }}
              >
                <circle r={14} fill="#9FA8B5" fillOpacity={isHovered ? 0.45 : 0.18} />
                <circle r={isHovered ? 7 : 6} fill="#FFFFFF" stroke="#9FA8B5" strokeWidth={isHovered ? 2 : 1.5} />
                {pin.jobs.length > 1 && (
                  <text
                    textAnchor="middle"
                    y={2.5}
                    fontSize={8}
                    fontWeight={700}
                    fill="#0E141E"
                    style={{ fontFamily: 'system-ui, sans-serif', pointerEvents: 'none' }}
                  >
                    {pin.jobs.length}
                  </text>
                )}
              </Marker>
            );
          })}

          {/* Hover popup via foreignObject (same projection as pins). */}
          {hoveredPin && (
            <Marker coordinates={[hoveredPin.lng, hoveredPin.lat]}>
              <foreignObject
                x={-140}
                y={-(Math.min(hoveredPin.jobs.length, 3) * 56 + 60)}
                width={280}
                height={Math.min(hoveredPin.jobs.length, 3) * 56 + 56}
                style={{ overflow: 'visible' }}
              >
                <div
                  onMouseEnter={() => handlePinEnter(hoveredPin.key)}
                  onMouseLeave={handlePinLeave}
                  className="bg-brand-dark/95 backdrop-blur-md border border-white/10 rounded-sm p-3 shadow-2xl text-white"
                  style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                >
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                    <MapPin size={11} className="text-brand-silver" strokeWidth={1.5} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                      {hoveredPin.label}
                    </span>
                    <span className="ml-auto text-[10px] text-white/40 font-mono">
                      {hoveredPin.jobs.length} {hoveredPin.jobs.length === 1 ? 'role' : 'roles'}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[156px] overflow-y-auto">
                    {hoveredPin.jobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="group">
                        <div className="text-xs font-medium text-white leading-tight line-clamp-2">
                          {job.title}
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-1.5">
                          <span className="text-[10px] text-white/40 font-light flex items-center gap-1 min-w-0">
                            {job.salary ? (
                              <>
                                <DollarSign size={10} strokeWidth={1.5} className="text-brand-silver flex-shrink-0" />
                                <span className="truncate">{job.salary}</span>
                              </>
                            ) : (
                              <span className="text-white/30">View details</span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setApplyingTo(job);
                            }}
                            className="inline-flex items-center gap-1 bg-white text-brand-dark hover:bg-brand-silver px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-[0.15em] transition-colors flex-shrink-0"
                          >
                            Apply
                            <ArrowRight size={9} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {hoveredPin.jobs.length > 3 && (
                      <div className="text-[9px] text-white/40 uppercase tracking-[0.2em] text-center pt-1">
                        +{hoveredPin.jobs.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </foreignObject>
            </Marker>
          )}
        </ComposableMap>

        {/* Vignettes: push the map back, content forward */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/60 via-transparent to-transparent pointer-events-none"></div>
      </div>

      {/* Headline overlay (top-left) */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-16 md:pt-24 pointer-events-none">
        <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight leading-[1.05] max-w-2xl drop-shadow-2xl">
          Based in Toronto.
          <br />
          Recruiting across Canada.
        </h2>
        <p className="mt-3 text-white/40 text-[10px] font-light uppercase tracking-[0.3em]">
          Hover a pin to view roles
        </p>
      </div>

      {/* Active searches footer (bottom-left) */}
      <div className="absolute bottom-0 left-0 z-10 w-full pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-8">
          <div className="inline-block bg-brand-dark/80 backdrop-blur-md border border-white/10 rounded-sm px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-silver mb-1">Active searches</p>
            <p className="text-sm text-white font-light">
              {totalShown} {totalShown === 1 ? 'role' : 'roles'} across {pins.length} {pins.length === 1 ? 'city' : 'cities'}
              {unmapped > 0 && <span className="text-white/40"> · +{unmapped} other</span>}
            </p>
          </div>
        </div>
      </div>

      {applyingTo && (
        <ApplicationModal job={applyingTo} isOpen={!!applyingTo} onClose={() => setApplyingTo(null)} />
      )}
    </section>
  );
}
