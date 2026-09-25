import React, { useEffect, useRef } from 'react';
import { MapPin, AlertTriangle, Building2, MousePointer2 } from 'lucide-react';
import { CaseDetail } from '../../types';
import * as d3 from 'd3-geo';

/* ─────────────────────────────────────────────────────────────────────────────
   Realistic 3D Geo-Financial Globe  –  powered by globe.gl + Three.js
   ───────────────────────────────────────────────────────────────────────────── */

interface GlobePoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  color: string;
  type: string;
  subtitle: string;
}

interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
}

const RealisticGlobe: React.FC<{
  points: GlobePoint[];
  arcs: GlobeArc[];
  focusLat: number;
  focusLng: number;
}> = ({ points, arcs, focusLat, focusLng }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let globe: any = null;
    let disposed = false;

    const initGlobe = async () => {
      const GlobeModule = await import('globe.gl');
      const Globe = GlobeModule.default;

      if (disposed || !containerRef.current) return;

      // Clear previous instances
      containerRef.current.innerHTML = '';

      // Generate graticule (lat/lng grid)
      const graticule = d3.geoGraticule10();
      const graticuleLines = graticule.coordinates.map((coords: any) => ({
        coords: coords,
      }));

      globe = Globe()(containerRef.current)
        .backgroundColor('rgba(5, 10, 20, 1)')
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        // Atmosphere styling
        .showAtmosphere(true)
        .atmosphereColor('#1e40af') // Deep blue atmosphere
        .atmosphereAltitude(0.15)
        
        // Initial camera
        .pointOfView({ lat: focusLat, lng: focusLng, altitude: 2.5 }, 0)
        
        // Graticules (lat/lon grid)
        .pathsData(graticuleLines)
        .pathPoints('coords')
        .pathPointLat(p => p[1])
        .pathPointLng(p => p[0])
        .pathColor(() => 'rgba(56, 189, 248, 0.15)') // subtle blue-gray
        .pathDashLength(0.01)
        .pathDashGap(0.005)
        .pathStroke(0.5)

        // Data points (solid core)
        .pointsData(points)
        .pointLat('lat')
        .pointLng('lng')
        .pointColor('color')
        .pointAltitude(0.01)
        .pointRadius(0.3) // Small, precise dots
        .pointResolution(32)
        .pointLabel((d: any) => `
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 8px 12px; font-family: sans-serif; backdrop-filter: blur(4px);">
            <div style="color: ${d.color}; font-size: 11px; font-weight: 700; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px;">${d.type}</div>
            <div style="color: #f8fafc; font-size: 13px; font-weight: 500;">${d.label}</div>
            <div style="color: #94a3b8; font-size: 11px; margin-top: 2px;">${d.subtitle}</div>
          </div>
        `)

        // Pulsing rings around points
        .ringsData(points)
        .ringLat('lat')
        .ringLng('lng')
        .ringColor('color')
        .ringMaxRadius(3)
        .ringPropagationSpeed(1.5)
        .ringRepeatPeriod(1000)

        // Curved routing arc
        .arcsData(arcs)
        .arcStartLat('startLat')
        .arcStartLng('startLng')
        .arcEndLat('endLat')
        .arcEndLng('endLng')
        .arcColor('color')
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashInitialGap(() => Math.random())
        .arcDashAnimateTime(2000)
        .arcStroke(0.5)
        .arcAltitudeAutoScale(0.3)

        // Interaction
        .enablePointerInteraction(true);

      // Extract country borders from GeoJSON to overlay subtle country boundaries
      try {
        const res = await fetch('https://unpkg.com/world-atlas@2/countries-110m.json');
        const worldData = await res.json();
        const topojson = await import('topojson-client');
        const countries = topojson.feature(worldData, worldData.objects.countries);
        
        if (!disposed && globe) {
          globe.polygonsData((countries as any).features)
            .polygonCapColor(() => 'rgba(0,0,0,0)')
            .polygonSideColor(() => 'rgba(0,0,0,0)')
            .polygonStrokeColor(() => 'rgba(56, 189, 248, 0.15)'); // subtle cool blue borders
        }
      } catch (err) {
        console.error("Failed to load country boundaries:", err);
      }

      // Configure Controls
      const controls = globe.controls();
      if (controls) {
        controls.enableZoom = true;
        controls.zoomSpeed = 0.8;
        controls.autoRotate = false; // User controls rotation entirely
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 120;
        controls.maxDistance = 400; // Prevent zooming out too far
      }

      // Responsive resizing
      const resize = () => {
        if (containerRef.current && globe) {
          globe.width(containerRef.current.clientWidth);
          globe.height(containerRef.current.clientHeight);
        }
      };
      resize();
      window.addEventListener('resize', resize);

      // Enhance lighting
      const scene = globe.scene();
      if (scene) {
        const THREE = await import('three');
        
        // Brighter ambient light to reveal Earth texture
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);
        
        // Directional light for shadows/depth
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 3, 5);
        scene.add(dirLight);
      }

      globeRef.current = globe;

      // Smooth camera pan to target on load
      setTimeout(() => {
        if (!disposed && globe) {
          // Adjust altitude based on distance between points
          globe.pointOfView({ lat: focusLat, lng: focusLng, altitude: 1.6 }, 2000);
        }
      }, 300);

      return () => {
        window.removeEventListener('resize', resize);
      };
    };

    initGlobe();

    return () => {
      disposed = true;
      if (globeRef.current) {
        const el = containerRef.current;
        if (el) el.innerHTML = '';
        globeRef.current = null;
      }
    };
  }, [points, arcs, focusLat, focusLng]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#050a14',
        cursor: 'grab',
      }}
    />
  );
};

/* ── Main View ─────────────────────────────────────────────────────────────── */
interface GeoFinancialMapViewProps { caseDetail: CaseDetail; }

export const GeoFinancialMapView: React.FC<GeoFinancialMapViewProps> = ({ caseDetail }) => {
  const geo = caseDetail.geo_financial;

  const points: GlobePoint[] = geo ? [
    { 
      id: 'bank',
      lat: geo.lat, 
      lng: geo.lng, 
      label: geo.bank_name,
      subtitle: `${geo.ifsc_code} · ${geo.branch_name}, ${geo.branch_city}`,
      type: 'Bank Branch',
      color: '#10b981', // green
    },
    { 
      id: 'server',
      lat: geo.ip_lat, 
      lng: geo.ip_lng, 
      label: geo.ip_geolocation,
      subtitle: `${geo.ip_lat.toFixed(4)}°, ${geo.ip_lng.toFixed(4)}°`,
      type: 'Server / IP',
      color: '#ef4444', // red
    },
  ] : [];

  const arcs: GlobeArc[] = geo ? [
    {
      startLat: geo.ip_lat,
      startLng: geo.ip_lng,
      endLat: geo.lat,
      endLng: geo.lng,
      color: '#06b6d4', // cyan
    },
  ] : [];

  const focusLat = geo ? (geo.lat + geo.ip_lat) / 2 : 20;
  const focusLng = geo ? (geo.lng + geo.ip_lng) / 2 : 60;

  return (
    <div className="page space-y-7 anim-fade-up">

      {/* ── Page header ── */}
      <div className="section-header">
        <div className="section-icon" style={{ background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.25)' }}>
          <MapPin className="w-4 h-4" style={{ color:'var(--green)' }} />
        </div>
        <div>
          <h1 className="t-title">Geo-Financial Intelligence</h1>
          <p className="t-body mt-0.5">
            Bank IFSC branch coordinates contrasted with technical server IP geolocations.
          </p>
        </div>
      </div>

      {!geo ? (
        <div
          className="apple-card p-16 flex flex-col items-center justify-center gap-4 text-center"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background:'var(--bg-04)', border:'1px solid var(--border-default)' }}
          >
            <MapPin className="w-6 h-6" style={{ color:'var(--text-tertiary)' }} />
          </div>
          <p className="t-heading">No Financial Entities Found</p>
          <p className="t-body max-w-sm">No bank account details or financial payout indicators were extracted from this case.</p>
        </div>
      ) : (
        <>
          {/* ── Disclaimer banner ── */}
          <div
            className="flex items-start gap-4 p-4 rounded-2xl"
            style={{ background:'var(--amber-dim)', border:'1px solid var(--amber-border)' }}
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color:'var(--amber)' }} />
            <div>
              <p className="font-semibold text-sm mb-1" style={{ color:'var(--amber)' }}>
                Forensic Uncertainty &amp; Attribution Limit
              </p>
              <p className="t-body leading-relaxed">{geo.uncertainty_disclaimer}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ── 3D Globe (left 2/3) ── */}
            <div
              className="lg:col-span-2 rounded-2xl overflow-hidden relative"
              style={{
                height: 520,
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <RealisticGlobe
                points={points}
                arcs={arcs}
                focusLat={focusLat}
                focusLng={focusLng}
              />

              {/* Professional Legend Overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  background: 'rgba(5, 10, 20, 0.75)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  zIndex: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#f1f5f9', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Bank Branch</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#f1f5f9', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Server / IP</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 14, height: 2, background: '#06b6d4', border: '1px dashed #000' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#94a3b8' }}>Observed Routing Relationship</span>
                </div>
              </div>

              {/* User Guidance Overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  background: 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '4px',
                  zIndex: 10,
                  opacity: 0.6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MousePointer2 className="w-3.5 h-3.5" style={{ color: '#cbd5e1' }} />
                  <span style={{ fontSize: '0.65rem', color: '#cbd5e1', fontWeight: 500 }}>Drag to rotate</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.65rem', color: '#cbd5e1', fontWeight: 500 }}>Scroll to zoom</span>
                </div>
              </div>
            </div>

            {/* ── Financial details (right 1/3) ── */}
            <div className="apple-card p-6 space-y-5">
              <div className="flex items-center gap-2 pb-4" style={{ borderBottom:'1px solid var(--border-subtle)' }}>
                <div className="section-icon w-8 h-8" style={{ background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.25)' }}>
                  <Building2 className="w-3.5 h-3.5" style={{ color:'var(--green)' }} />
                </div>
                <p className="t-heading">Extracted Details</p>
              </div>

              {[
                { label:'Beneficiary Name',    value: geo.beneficiary_name,      large: true  },
                { label:'Bank & IFSC Branch',  value: geo.bank_name,             sub: `IFSC: ${geo.ifsc_code} · ${geo.branch_name}` },
                { label:'Requested Payout',    value: geo.amount_requested,      accent: 'var(--green)', large: true },
                { label:'Masked Account',      value: geo.account_number_masked, mono: true   },
              ].map(({ label, value, sub, accent, large, mono }) => (
                <div key={label}>
                  <p className="t-label mb-1">{label}</p>
                  <p
                    style={{
                      fontSize: large ? '1rem' : '0.875rem',
                      fontFamily: mono ? 'monospace' : 'inherit',
                      fontWeight: large ? 600 : 400,
                      color: accent || 'var(--text-primary)',
                      letterSpacing: large ? '-0.02em' : 'normal',
                    }}
                  >
                    {value}
                  </p>
                  {sub && <p className="t-caption mt-0.5 font-mono" style={{ fontSize:'0.7rem' }}>{sub}</p>}
                </div>
              ))}

              {/* Mismatch badge */}
              <div className="pt-4" style={{ borderTop:'1px solid var(--border-subtle)' }}>
                <p className="t-label mb-2">Location Mismatch</p>
                <span
                  className="pill pill-amber"
                  style={{ fontSize:'0.65rem' }}
                >
                  Cross-Region Mismatch Detected
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
