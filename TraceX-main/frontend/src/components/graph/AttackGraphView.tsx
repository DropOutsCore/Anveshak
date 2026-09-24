import React, { useState, useMemo } from 'react';
import { ReactFlow, Background, Controls, Node, Edge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Network, Info, Mail, Server, Globe, Link as LinkIcon,
  Crosshair, ShieldAlert, DollarSign, User, Building2
} from 'lucide-react';
import { CaseDetail, GraphNode } from '../../types';

interface AttackGraphViewProps { caseDetail: CaseDetail; }

const BLUE      = '#0056A6';
const BLUE_DIM  = 'rgba(0,86,166,0.55)';
const RED       = '#DC2626';
const AMBER     = '#D97706';
const GRAY      = '#6b7280';
const BORDER    = '#d1d5db';

export const AttackGraphView: React.FC<AttackGraphViewProps> = ({ caseDetail }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const graphData = caseDetail.attack_graph;

  const getNodeIcon = (type: string, size = 14) => {
    switch (type.toUpperCase()) {
      case 'EMAIL':    return <Mail       size={size} />;
      case 'IP':
      case 'SERVER':   return <Server     size={size} />;
      case 'DOMAIN':   return <Globe      size={size} />;
      case 'URL':      return <LinkIcon   size={size} />;
      case 'CAMPAIGN': return <Crosshair  size={size} />;
      case 'IDENTITY': return <User       size={size} />;
      case 'BANK':
      case 'BANK_ENTITY':
      case 'FINANCIAL':return <Building2  size={size} />;
      default:         return <ShieldAlert size={size} />;
    }
  };

  const sevBadge = (s: string) => {
    const map: Record<string, { bg: string; color: string; border: string }> = {
      CRITICAL: { bg: '#fef2f2', color: RED,   border: '#fecaca' },
      HIGH:     { bg: '#fef2f2', color: RED,   border: '#fecaca' },
      WARNING:  { bg: '#fffbeb', color: AMBER, border: '#fde68a' },
      MEDIUM:   { bg: '#eff6ff', color: BLUE,  border: '#bfdbfe' },
      LOW:      { bg: '#f0fdf4', color: '#16A34A', border: '#bbf7d0' },
    };
    return map[s?.toUpperCase()] || { bg: '#f3f4f6', color: GRAY, border: '#e5e7eb' };
  };

  const initialNodes: Node[] = useMemo(() => graphData.nodes.map((n, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const sev = sevBadge(n.severity ?? '');
    const isSelected = selectedNode?.id === n.id;

    return {
      id: n.id,
      position: { x: 40 + col * 280, y: 40 + row * 140 },
      data: {
        label: (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: isSelected ? `2px solid ${BLUE}` : `1.5px solid ${BORDER}`,
              background: '#ffffff',
              cursor: 'pointer',
              minWidth: 160,
              transition: 'all 180ms ease',
              boxShadow: isSelected
                ? '0 8px 20px rgba(0,86,166,0.20)'
                : '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:6, marginBottom:6 }}>
              <div style={{
                display:'flex', alignItems:'center', gap:5,
                color: '#1f2937', fontSize:11, fontWeight:700,
                textTransform:'uppercase', letterSpacing:'0.06em',
              }}>
                <span style={{ color: BLUE }}>{getNodeIcon(n.type, 13)}</span>
                {n.type}
              </div>
              <span style={{
                fontSize: 9, padding:'2px 7px', borderRadius: 4,
                fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                background: sev.bg, color: sev.color, border: `1px solid ${sev.border}`,
              }}>
                {n.severity}
              </span>
            </div>
            <div style={{
              fontWeight: 500, fontSize: 11, color: '#374151',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              maxWidth: 180,
            }}>
              {n.label}
            </div>
          </div>
        )
      }
    };
  }), [graphData, selectedNode]);

  const initialEdges: Edge[] = useMemo(() => graphData.edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.relationship,
    animated: false,
    style: {
      stroke: BLUE_DIM,
      strokeWidth: 1.5,
      strokeDasharray: '6 4',
    },
    labelStyle: {
      fill: '#6b7280',
      fontSize: 10,
      fontFamily: 'JetBrains Mono, monospace',
      fontWeight: 600,
    },
    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
    labelBgPadding: [4, 4] as [number, number],
    labelBgBorderRadius: 3,
    markerEnd: { type: MarkerType.ArrowClosed, color: BLUE_DIM, width: 14, height: 14 },
  })), [graphData]);

  const handleNodeClick = (_: any, node: Node) => {
    const orig = graphData.nodes.find(n => n.id === node.id);
    if (orig) setSelectedNode(orig);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto' }} className="anim-fade-up">

      {/* Page header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        gap: '20px', marginBottom: '24px',
        paddingBottom: '20px', borderBottom: `3px solid ${BLUE}`,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', background: 'rgba(0,86,166,0.08)',
            border: '1px solid rgba(0,86,166,0.20)', borderRadius: '20px',
            fontSize: '0.7rem', fontWeight: 700, color: BLUE,
            letterSpacing: '0.08em', marginBottom: '10px', textTransform: 'uppercase',
          }}>
            <Network size={12} /> Threat Topology
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1f2937', margin: 0, letterSpacing: '-0.02em' }}>
            Attack Graph
          </h1>
          <p style={{ fontSize: '0.9rem', color: GRAY, margin: '6px 0 0 0' }}>
            Interactive threat entity map: email, infrastructure, URLs, and campaigns
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {[
            { label: 'Nodes', value: graphData.nodes.length },
            { label: 'Edges', value: graphData.edges.length },
          ].map(s => (
            <div key={s.label} className="gov-stat-box" style={{ minWidth: '110px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1f2937', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.65rem', color: GRAY, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '4px' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '20px',
      }}>
        {/* Graph canvas card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          height: '640px',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Card header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 20px', borderBottom: '1px solid #e5e7eb',
            background: 'linear-gradient(90deg, rgba(0,86,166,0.03) 0%, transparent 100%)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,86,166,0.10)', color: BLUE,
              }}>
                <Network size={15} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1f2937' }}>
                Infrastructure Topology Diagram
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: GRAY }}>
              Click any node to inspect relationship details
            </span>
          </div>

          <div style={{ flex: 1, position: 'relative', background: '#fafbfc' }}>
            <ReactFlow
              nodes={initialNodes}
              edges={initialEdges}
              onNodeClick={handleNodeClick}
              fitView
              fitViewOptions={{ padding: 0.22 }}
              style={{ background: 'transparent' }}
              proOptions={{ hideAttribution: false }}
            >
              <Background color="#e5e7eb" gap={24} size={1} />
              <Controls
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              />
            </ReactFlow>
          </div>
        </div>

        {/* Node inspector */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          padding: '20px',
          height: '640px',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            paddingBottom: '14px', marginBottom: '16px',
            borderBottom: '1px solid #f3f4f6',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: BLUE, color: '#fff',
            }}>
              <Info size={16} />
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1f2937' }}>
              Entity Inspector
            </div>
          </div>

          {selectedNode ? (
            <div style={{ flex: 1 }} className="anim-fade-up">
              <div style={{ marginBottom: '18px' }}>
                <div style={{
                  fontSize: '0.65rem', fontWeight: 700, color: GRAY,
                  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px',
                }}>Type</div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '8px 14px', borderRadius: '8px',
                  background: 'rgba(0,86,166,0.08)', border: '1px solid rgba(0,86,166,0.20)',
                }}>
                  <span style={{ color: BLUE }}>{getNodeIcon(selectedNode.type, 15)}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: BLUE, letterSpacing: '0.02em' }}>
                    {selectedNode.type}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <div style={{
                  fontSize: '0.65rem', fontWeight: 700, color: GRAY,
                  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px',
                }}>Identifier</div>
                <div style={{
                  fontSize: '0.85rem', color: '#1f2937', fontWeight: 600,
                  wordBreak: 'break-all', lineHeight: 1.5,
                }}>{selectedNode.label}</div>
              </div>

              <div>
                <div style={{
                  fontSize: '0.65rem', fontWeight: 700, color: GRAY,
                  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px',
                }}>Attributes</div>
                <div style={{
                  border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden',
                }}>
                  {Object.entries(selectedNode.details).map(([k, v], i, arr) => (
                    <div key={k} style={{
                      display: 'flex', justifyContent: 'space-between', gap: '12px',
                      padding: '10px 14px',
                      borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none',
                      background: i % 2 === 0 ? '#fafbfc' : '#fff',
                    }}>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700, color: GRAY,
                        letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0,
                      }}>{k}</span>
                      <span style={{
                        fontSize: '0.72rem', color: '#374151', textAlign: 'right',
                        wordBreak: 'break-all', maxWidth: '60%',
                        fontFamily: typeof v === 'string' && v.length > 20 ? 'JetBrains Mono, monospace' : 'inherit',
                      }}>{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '12px', textAlign: 'center',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,86,166,0.08)', color: BLUE,
              }}>
                <Info size={26} />
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1f2937' }}>
                Select a node
              </div>
              <div style={{ fontSize: '0.78rem', color: GRAY, maxWidth: '200px', lineHeight: 1.5 }}>
                Click any entity on the graph to inspect its forensic attributes
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
