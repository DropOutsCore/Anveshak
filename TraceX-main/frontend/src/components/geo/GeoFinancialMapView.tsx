import React, { useEffect, useRef, useCallback } from 'react';
import { MapPin, AlertTriangle, Building2 } from 'lucide-react';
import { CaseDetail } from '../../types';

/* ─────────────────────────────────────────────────────────────────────────────
   Holographic 3D Globe  –  powered by globe.gl + Three.js
   ───────────────────────────────────────────────────────────────────────────── */

interface GlobePoint {
  lat: number;
  lng: number;
  label: string;
  color: string;
  size: number;
}

interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
}

/* ── 3D Globe wrapper ────────────────────────────────────────────────────── */
const HolographicGlobe: React.FC<{
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

      // Clear any previous globe
      containerRef.current.innerHTML = '';

      globe = Globe()(containerRef.current)
        .backgroundColor('rgba(0,0,0,0)')
        .showAtmosphere(true)
        .atmosphereColor('#06b6d4')
        .atmosphereAltitude(0.18)
        .globeImageUrl('')
        .showGlobe(true)
        .pointOfView({ lat: focusLat, lng: focusLng, altitude: 2.2 }, 0)
        // ── Globe material: dark translucent sphere ──
        .globeMaterial((() => {
          const THREE = (window as any).__THREE_IMPORT__;
          if (THREE) {
            return new THREE.MeshPhongMaterial({
              color: '#050a14',
              transparent: true,
              opacity: 0.85,
              shininess: 25,
            });
          }
          return undefined;
        })())
        // ── Hex polygons (country outlines) ──
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.62)
        .hexPolygonColor(() => 'rgba(6, 182, 212, 0.12)')
        // ── Points (markers) ──
        .pointsData(points)
        .pointLat('lat')
        .pointLng('lng')
        .pointColor('color')
        .pointAltitude(0.015)
        .pointRadius('size')
        .pointLabel('label')
        // ── Arcs (animated beams) ──
        .arcsData(arcs)
        .arcStartLat('startLat')
        .arcStartLng('startLng')
        .arcEndLat('endLat')
        .arcEndLng('endLng')
        .arcColor('color')
        .arcDashLength(0.4)
        .arcDashGap(0.15)
        .arcDashAnimateTime(2200)
        .arcStroke(0.6)
        .arcAltitudeAutoScale(0.4)
        // ── Auto-rotate ──
        .enablePointerInteraction(true);

      // Load country polygons for hex grid
      try {
        const res = await fetch('https://unpkg.com/world-atlas@2/countries-110m.json');
        const worldData = await res.json();
        const topojson = await import('https://cdn.jsdelivr.net/npm/topojson-client@3/+esm' as any);
        const countries = topojson.feature(worldData, worldData.objects.countries);
        if (!disposed && globe) {
          globe.hexPolygonsData(countries.features);
        }
      } catch {
        // Hex polygons are optional; globe still works without them
      }

      // Configure controls
      const controls = globe.controls();
      if (controls) {
        controls.enableZoom = true;
        controls.zoomSpeed = 0.8;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.4;
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.minDistance = 120;
        controls.maxDistance = 600;
      }

      // Size globe to container
      const resize = () => {
        if (containerRef.current && globe) {
          globe.width(containerRef.current.clientWidth);
          globe.height(containerRef.current.clientHeight);
        }
      };
      resize();
      window.addEventListener('resize', resize);

      // Modify the renderer for glow
      const renderer = globe.renderer();
      if (renderer) {
        renderer.setClearColor(0x000000, 0);
      }

      // Add ambient + directional lights for holographic feel
      const scene = globe.scene();
      if (scene) {
        const THREE_LIB = await import('three');
        // Dim ambient
        const ambient = new THREE_LIB.AmbientLight(0x06b6d4, 0.3);
        scene.add(ambient);
        // Directional from upper-right
        const dir = new THREE_LIB.DirectionalLight(0x06b6d4, 0.5);
        dir.position.set(5, 3, 5);
        scene.add(dir);
        // Subtle point light for neon glow
        const point = new THREE_LIB.PointLight(0xa855f7, 0.4, 500);
        point.position.set(-3, 2, 4);
        scene.add(point);

        // Make globe material more holographic
        const globeMesh = scene.children.find((c: any) => c.type === 'Mesh' && c.geometry?.type === 'SphereGeometry');
        if (globeMesh && (globeMesh as any).material) {
          (globeMesh as any).material.color.setHex(0x050a14);
          (globeMesh as any).material.transparent = true;
          (globeMesh as any).material.opacity = 0.88;
          (globeMesh as any).material.emissive = new THREE_LIB.Color(0x06b6d4);
          (globeMesh as any).material.emissiveIntensity = 0.03;
        }
      }

      globeRef.current = globe;

      // Smooth fly-in
      setTimeout(() => {
        if (!disposed && globe) {
          globe.pointOfView({ lat: focusLat, lng: focusLng, altitude: 1.8 }, 1500);
        }
      }, 500);

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
        background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.04) 0%, rgba(5,10,20,0.98) 70%)',
        borderRadius: 16,
        overflow: 'hidden',
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
    { lat: geo.lat, lng: geo.lng, label: `🏦 ${geo.bank_name} · ${geo.branch_name}`, color: '#34d399', size: 0.55 },
    { lat: geo.ip_lat, lng: geo.ip_lng, label: `🔴 Server IP · ${geo.ip_geolocation}`, color: '#f87171', size: 0.55 },
  ] : [];

  const arcs: GlobeArc[] = geo ? [
    {
      startLat: geo.ip_lat,
      startLng: geo.ip_lng,
      endLat: geo.lat,
      endLng: geo.lng,
      color: '#06b6d4',
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
                border: '1px solid rgba(6,182,212,0.2)',
                boxShadow: '0 0 40px rgba(6,182,212,0.08), 0 8px 32px rgba(0,0,0,0.5)',
                background: '#050a14',
              }}
            >
              <HolographicGlobe
                points={points}
                arcs={arcs}
                focusLat={focusLat}
                focusLng={focusLng}
              />

              {/* Floating legend */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  background: 'rgba(5,10,20,0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(6,182,212,0.2)',
                  borderRadius: 12,
                  padding: '10px 16px',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                  zIndex: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d39980', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace', color: '#64748b' }}>Bank Branch</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171', boxShadow: '0 0 8px #f8717180', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace', color: '#64748b' }}>Server IP</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 16, height: 2, background: '#06b6d4', boxShadow: '0 0 6px #06b6d480', display: 'inline-block', borderRadius: 1 }} />
                  <span style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace', color: '#64748b' }}>Data Flow</span>
                </div>
              </div>

              {/* Floating controls hint */}
              <div
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'rgba(5,10,20,0.75)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(6,182,212,0.15)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  zIndex: 10,
                }}
              >
                <span style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: '#334155' }}>
                  🖱 Drag to rotate · Scroll to zoom
                </span>
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

              {/* Map legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background:'var(--green)', boxShadow:'0 0 6px var(--green)' }} />
                  <span style={{ color:'var(--text-secondary)' }}>Bank branch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background:'var(--red)', boxShadow:'0 0 6px var(--red)' }} />
                  <span style={{ color:'var(--text-secondary)' }}>Server IP</span>
                </div>
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
