import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, AlertTriangle, Building2 } from 'lucide-react';
import { CaseDetail } from '../../types';

const bankIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:var(--green,#34d399);border:2px solid #fff;box-shadow:0 0 12px rgba(52,211,153,0.7)"></div>`,
  iconSize: [14, 14],
});

const ipIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:var(--red,#f87171);border:2px solid #fff;box-shadow:0 0 12px rgba(248,113,113,0.7)"></div>`,
  iconSize: [14, 14],
});

/* ── Animated beam overlay ───────────────────────────────────── */
interface BeamOverlayProps {
  from: [number, number]; // [lat, lng] sender (red)
  to:   [number, number]; // [lat, lng] receiver (green)
}

const BeamOverlay: React.FC<BeamOverlayProps> = ({ from, to }) => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const dashOffsetRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Size canvas to map container
    const container = map.getContainer();
    const resize = () => {
      canvas.width  = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    map.on('resize move zoom viewreset zoomend moveend', resize);

    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Convert lat/lng to pixel positions relative to map container
      const pFrom = map.latLngToContainerPoint(L.latLng(from[0], from[1]));
      const pTo   = map.latLngToContainerPoint(L.latLng(to[0],   to[1]));

      const x1 = pFrom.x, y1 = pFrom.y;
      const x2 = pTo.x,   y2 = pTo.y;

      // Arc control point — bow upward for globe feel
      const mx  = (x1 + x2) / 2;
      const my  = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.35;

      // ── Single glowing dotted line ──
      dashOffsetRef.current = (dashOffsetRef.current - 0.4) % 20;

      // Outer glow (soft)
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(mx, my, x2, y2);
      ctx.strokeStyle = 'rgba(0, 86, 166, 0.25)';
      ctx.lineWidth   = 8;
      ctx.lineCap     = 'round';
      ctx.setLineDash([2, 10]);
      ctx.lineDashOffset = dashOffsetRef.current;
      ctx.shadowBlur    = 12;
      ctx.shadowColor   = 'rgba(0, 86, 166, 0.6)';
      ctx.stroke();

      // Inner bright dotted line
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(mx, my, x2, y2);
      ctx.strokeStyle = '#0056A6';
      ctx.lineWidth   = 3;
      ctx.setLineDash([2, 10]);
      ctx.lineDashOffset = dashOffsetRef.current;
      ctx.shadowBlur    = 8;
      ctx.shadowColor   = '#0056A6';
      ctx.stroke();

      // Reset context state
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      map.off('resize move zoom viewreset zoomend moveend', resize);
    };
  }, [map, from, to]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 500,
        pointerEvents: 'none',
      }}
    />
  );
};

interface GeoFinancialMapViewProps { caseDetail: CaseDetail; }

export const GeoFinancialMapView: React.FC<GeoFinancialMapViewProps> = ({ caseDetail }) => {
  const geo = caseDetail.geo_financial;

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

            {/* ── Map (left 2/3) ── */}
            <div
              className="lg:col-span-2 rounded-2xl overflow-hidden"
              style={{
                height: 460,
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <MapContainer center={[25, 50]} zoom={3} scrollWheelZoom={false} className="w-full h-full">
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={16}
                />
                <Marker position={[geo.lat, geo.lng]} icon={bankIcon}>
                  <Popup>
                    <div style={{ fontFamily:'monospace', fontSize:11 }}>
                      <strong>Financial Destination</strong><br />
                      {geo.bank_name} · {geo.ifsc_code}<br />
                      {geo.branch_city}, India
                    </div>
                  </Popup>
                </Marker>
                <Marker position={[geo.ip_lat, geo.ip_lng]} icon={ipIcon}>
                  <Popup>
                    <div style={{ fontFamily:'monospace', fontSize:11 }}>
                      <strong>Technical Origin IP</strong><br />
                      {geo.ip_geolocation}<br />
                      {geo.ip_lat.toFixed(4)}, {geo.ip_lng.toFixed(4)}
                    </div>
                  </Popup>
                </Marker>
                {/* Animated beam from sender (red/IP) → receiver (green/bank) */}
                <BeamOverlay
                  from={[geo.ip_lat, geo.ip_lng]}
                  to={[geo.lat, geo.lng]}
                />
              </MapContainer>
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
