import React, { useEffect, useRef, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { geoAlbers } from 'd3-geo';
import { ArrowRight, MapPin, DollarSign, X } from 'lucide-react';
import { JobPosting } from '../types';
import { jobService } from '../services/jobService';
import ApplicationModal from './ApplicationModal';
import JobDetailDrawer from './JobDetailDrawer';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const NA_COUNTRY_IDS = new Set(['124', '840', '484']); // Canada, USA, Mexico

const HQ = { lat: 43.6532, lng: -79.3832 }; // Toronto

// Certus emblem (navy disc + white mark) — used as the GTA / Toronto hub marker.
const CERTUS_LOGO = 'https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png';

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
  // US — higher-level / executive search roles
  'chicago,il': { lat: 41.8781, lng: -87.6298 },
  'seattle,wa': { lat: 47.6062, lng: -122.3321 },
  'columbus,oh': { lat: 39.9612, lng: -82.9988 },
  'boston,ma': { lat: 42.3601, lng: -71.0589 },
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

// The whole Greater Toronto Area collapses into a single Toronto hub pin.
const GTA_KEYS = new Set([
  'toronto,on', 'mississauga,on', 'brampton,on', 'oakville,on',
  'burlington,on', 'ajax,on', 'concord,on',
]);
const GTA_PIN = { key: 'gta', label: 'Greater Toronto Area', ...HQ };

const groupJobsByCity = (jobs: JobPosting[]): JobPin[] => {
  const buckets = new Map<string, JobPin>();
  for (const job of jobs) {
    const norm = normalizeLocation(job.location);
    if (!norm) continue;
    const isGta = GTA_KEYS.has(norm);
    const key = isGta ? GTA_PIN.key : norm;
    const coords = isGta ? { lat: GTA_PIN.lat, lng: GTA_PIN.lng } : CITY_COORDS[norm];
    if (!coords) continue;
    const existing = buckets.get(key);
    if (existing) {
      existing.jobs.push(job);
    } else {
      const parts = job.location.replace(/remote\s*\/\s*/i, '').split(',').map((p) => p.trim());
      buckets.set(key, {
        ...coords,
        key,
        label: isGta ? GTA_PIN.label : `${parts[0]}, ${regionCode(parts[parts.length - 1])}`,
        jobs: [job],
      });
    }
  }
  return Array.from(buckets.values());
};

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 700;
const MAP_SCALE = 900;
const MAP_CENTER: [number, number] = [-3, 42]; // Canada-framed

// Mirror of react-simple-maps' internal projection so we can compute a pin's
// on-map pixel position and flip its hover popup downward when there's no room above.
const projection = geoAlbers()
  .scale(MAP_SCALE)
  .translate([SVG_WIDTH / 2, SVG_HEIGHT / 2])
  .center(MAP_CENTER);

export default function LocationsMap() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [pinnedKey, setPinnedKey] = useState<string | null>(null);
  const [applyingTo, setApplyingTo] = useState<JobPosting | null>(null);
  const [viewingJob, setViewingJob] = useState<JobPosting | null>(null);
  const closeTimer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    jobService.getJobsByDomain().then(setJobs);
  }, []);

  // Prefetch the map geography ourselves so we get a definite "ready" signal:
  // the map only mounts (and fades in) once the topojson is in hand, so the
  // countries never pop in abruptly after the page has already loaded.
  useEffect(() => {
    let alive = true;
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((d) => { if (alive) setGeoData(d); })
      .catch(() => { if (alive) setGeoData(GEO_URL); }); // fall back to URL on error
    return () => { alive = false; };
  }, []);

  // Track the section's pixel size so we can place the hover popup as a
  // top-layer HTML overlay (above the headline copy), aligned to the map
  // projection. Mirrors react-simple-maps' preserveAspectRatio="xMidYMid meet".
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pins = groupJobsByCity(jobs);
  // A pin click "locks" the popup open (sticky); hover only previews. The active
  // popup is the pinned one if present, otherwise whatever is hovered.
  const activeKey = pinnedKey ?? hoveredKey;
  const activePin = pins.find((p) => p.key === activeKey) || null;

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const handlePinEnter = (key: string) => {
    clearCloseTimer();
    setHoveredKey(key);
  };

  // Forgiving close: skipped entirely while a popup is pinned, and given a long
  // grace period otherwise so crossing the gap from the pin to the box is fine.
  const handlePinLeave = () => {
    if (pinnedKey) return;
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => setHoveredKey(null), 500);
  };

  const togglePin = (key: string) => {
    clearCloseTimer();
    setPinnedKey((cur) => (cur === key ? null : key));
    setHoveredKey(key);
  };

  const closePopup = () => {
    clearCloseTimer();
    setPinnedKey(null);
    setHoveredKey(null);
  };

  return (
    <section
      ref={containerRef}
      onClick={() => { if (pinnedKey) closePopup(); }}
      className="relative bg-[#070b12] border-y border-white/5 overflow-hidden h-[70vh] min-h-[520px]"
    >
      {/* Full-bleed map — mounts and fades in once the geography data is ready,
          so the countries don't pop in abruptly after the page has loaded. */}
      {geoData && (
      <div className="absolute inset-0 animate-[mapFadeIn_1.5s_ease-out_forwards]">
        <ComposableMap
          projection="geoAlbers"
          projectionConfig={{ scale: MAP_SCALE, center: MAP_CENTER }}
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <filter id="pinGlow" x="-300%" y="-300%" width="700%" height="700%">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
          </defs>
          <Geographies geography={geoData}>
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

          {/* Active-search pins (rendered first so popup overlays them) */}
          {pins.map((pin) => {
            const isActive = activeKey === pin.key;
            // The GTA / Toronto hub renders as the Certus emblem (navy disc + white
            // mark) — no border, ~15% larger than a standard dot.
            const logoSize = isActive ? 20 : 17;
            return (
              <Marker
                key={pin.key}
                coordinates={[pin.lng, pin.lat]}
                onMouseEnter={() => handlePinEnter(pin.key)}
                onMouseLeave={handlePinLeave}
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); togglePin(pin.key); }}
                style={{
                  default: { cursor: 'pointer' },
                  hover: { cursor: 'pointer' },
                  pressed: { cursor: 'pointer' },
                }}
              >
                {pin.key === 'gta' ? (
                  <image
                    href={CERTUS_LOGO}
                    x={-logoSize / 2}
                    y={-logoSize / 2}
                    width={logoSize}
                    height={logoSize}
                    style={{ transition: 'width 0.15s ease, height 0.15s ease' }}
                  />
                ) : (
                  <>
                    {/* White glow */}
                    <circle
                      r={isActive ? 9 : 7}
                      fill="#FFFFFF"
                      opacity={isActive ? 0.6 : 0.4}
                      filter="url(#pinGlow)"
                    />
                    {/* Certus-blue center with a crisp white outline */}
                    <circle
                      r={isActive ? 6 : 5}
                      fill="#0d2444"
                      stroke="#FFFFFF"
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                  </>
                )}
              </Marker>
            );
          })}

          {/* Hover popup is rendered as a top-layer HTML overlay (below),
              so it can paint above the headline copy and bottom gradient. */}
        </ComposableMap>

        {/* Subtle left vignette to push the map back, content forward */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/60 via-transparent to-transparent pointer-events-none"></div>
        {/* Soft, tall multi-stop fade at the bottom — the very bottom edge melts
            into the hero below */}
        <div className="absolute inset-x-0 bottom-0 h-40 md:h-56 bg-gradient-to-t from-brand-dark via-brand-dark/55 to-transparent pointer-events-none"></div>
      </div>
      )}

      {/* Headline overlay — anchored bottom-right, aligned to the content gutter */}
      <div className="absolute inset-x-0 bottom-0 z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-12 md:pb-16 pointer-events-none">
        <div className="ml-auto max-w-xl text-right">
          <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight leading-[1.05] drop-shadow-2xl">
            Recruiting Across North America
          </h2>
          <p className="mt-4 text-white/40 text-[10px] font-light uppercase tracking-[0.3em]">
            Hover or click a pin to view roles
          </p>
        </div>
      </div>

      {/* Roles popup — top-layer HTML overlay (z-30) so it sits over the headline
          copy. Hover previews it; clicking a pin locks it open (sticky). */}
      {activePin && size.w > 0 && (() => {
        const vb = projection([activePin.lng, activePin.lat]);
        if (!vb) return null;
        const scale = Math.min(size.w / SVG_WIDTH, size.h / SVG_HEIGHT);
        const offX = (size.w - SVG_WIDTH * scale) / 2;
        const offY = (size.h - SVG_HEIGHT * scale) / 2;
        const px = offX + vb[0] * scale;
        const py = offY + vb[1] * scale;
        const BOX_W = 280;
        const boxH = Math.min(activePin.jobs.length, 3) * 92 + 56;
        const HEADER_SAFE = 72; // keep the box clear of the overlaid header
        const openAbove = py - boxH - 16 > HEADER_SAFE;
        const top = openAbove ? py - boxH - 10 : py + 14;
        const left = Math.max(8, Math.min(px - BOX_W / 2, size.w - BOX_W - 8));
        return (
          <div className="absolute inset-0 z-30 pointer-events-none">
            <div
              onMouseEnter={clearCloseTimer}
              onMouseLeave={handlePinLeave}
              onClick={(e) => e.stopPropagation()}
              style={{ left, top, width: BOX_W, fontFamily: 'Outfit, system-ui, sans-serif' }}
              className="absolute pointer-events-auto bg-brand-dark/95 backdrop-blur-md border border-white/10 rounded-sm p-3 shadow-2xl text-white"
            >
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                <MapPin size={11} className="text-brand-silver flex-shrink-0" strokeWidth={1.5} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 truncate">
                  {activePin.label}
                </span>
                <span className="ml-auto text-[10px] text-white/40 font-light tracking-wide flex-shrink-0">
                  {activePin.jobs.length} {activePin.jobs.length === 1 ? 'role' : 'roles'}
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); closePopup(); }}
                  aria-label="Close"
                  className="-mr-1 ml-0.5 text-white/40 hover:text-white transition-colors flex-shrink-0"
                >
                  <X size={13} strokeWidth={2} />
                </button>
              </div>
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto">
                {activePin.jobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="group border-b border-white/5 last:border-0 pb-2.5 last:pb-0">
                    <div className="text-xs font-medium text-white leading-tight line-clamp-2">
                      {job.title}
                    </div>
                    {job.summary && (
                      <p className="text-[10px] text-white/45 font-light leading-snug mt-1 line-clamp-2">
                        {job.summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <span className="text-[10px] text-white/40 font-light flex items-center gap-1 min-w-0">
                        {job.salary && (
                          <>
                            <DollarSign size={10} strokeWidth={1.5} className="text-brand-silver flex-shrink-0" />
                            <span className="truncate">{job.salary}</span>
                          </>
                        )}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingJob(job);
                          }}
                          className="inline-flex items-center gap-1 border border-white/25 text-white/80 hover:border-white hover:text-white px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-[0.15em] transition-colors"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setApplyingTo(job);
                          }}
                          className="inline-flex items-center gap-1 bg-white text-brand-dark hover:bg-brand-silver px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-[0.15em] transition-colors"
                        >
                          Apply
                          <ArrowRight size={9} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {activePin.jobs.length > 3 && (
                  <div className="text-[9px] text-white/40 uppercase tracking-[0.2em] text-center pt-1">
                    +{activePin.jobs.length - 3} more
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes mapFadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {applyingTo && (
        <ApplicationModal job={applyingTo} isOpen={!!applyingTo} onClose={() => setApplyingTo(null)} />
      )}

      <JobDetailDrawer
        job={viewingJob}
        isOpen={!!viewingJob}
        onClose={() => setViewingJob(null)}
      />
    </section>
  );
}
