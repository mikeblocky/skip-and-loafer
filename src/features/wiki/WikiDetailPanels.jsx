import { Info, Sparkles } from 'lucide-react';
import { renderBadge } from './wikiStyleFns';

export const WikiHighlightsPanel = ({ isMobile, t, entry }) => {
  if (!entry.highlights?.length) return null;

  return (
    <div className="sketchbook-border" style={{ background: '#ffffff', border: '3px solid #fcd34d', borderBottom: '8px solid #f59e0b', borderRadius: '24px', padding: isMobile ? '18px 16px' : '20px 22px', display: 'grid', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309' }}>
        <Info size={18} strokeWidth={2.6} />
        <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: '1rem' }}>{t.detailsLabel}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
        {entry.highlights.map((highlight) => (
          <div key={`${highlight.label}-${highlight.value}`} className="sketchbook-border" style={{ background: '#fffbeb', border: '2.5px solid #fde68a', borderBottom: '7px solid #fbbf24', borderRadius: '18px', padding: '14px', display: 'grid', gap: '8px' }}>
            <div style={{ color: '#b45309', fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: '0.92rem', lineHeight: 1.1 }}>{highlight.label}</div>
            <p style={{ margin: 0, color: '#334155', fontFamily: 'var(--font-main)', fontWeight: '800', fontSize: isMobile ? '0.84rem' : '0.88rem', lineHeight: 1.55 }}>{highlight.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const WikiRelationshipPanel = ({ isMobile, t, category, entry }) => {
  const graph = entry.relationshipGraph;
  if (!graph?.nodes?.length) return null;

  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const svgWidth = isMobile ? 320 : 420;
  const svgHeight = isMobile ? 280 : 320;
  const pointForNode = (node) => ({ x: (node.x / 100) * svgWidth, y: (node.y / 100) * svgHeight });
  const legendItems = graph.legend?.length
    ? graph.legend
    : Array.from(new Map((graph.edges || []).map((edge) => [edge.color || category.accent, { label: edge.label, color: edge.color || category.accent }])).values());

  return (
    <div className="sketchbook-border" style={{ background: '#ffffff', border: `3px solid ${category.border}`, borderBottom: `8px solid ${category.border}`, borderRadius: '24px', padding: isMobile ? '18px 16px' : '20px 22px', display: 'grid', gap: '16px' }}>
      <div style={{ display: 'grid', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: category.accent }}>
          <Sparkles size={18} strokeWidth={2.6} />
          <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: '1rem' }}>{t.dynamicsLabel}</span>
        </div>
        <p style={{ margin: 0, color: '#475569', fontFamily: 'var(--font-main)', fontWeight: '700', fontSize: isMobile ? '0.84rem' : '0.9rem', lineHeight: 1.55 }}>{t.dynamicsHint}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `${svgWidth}px minmax(0, 1fr)`, gap: '18px', alignItems: 'start' }}>
        <div className="sketchbook-border" style={{ background: '#f8fafc', border: '2.5px solid #dbeafe', borderBottom: '7px solid #93c5fd', borderRadius: '22px', padding: '12px', overflow: 'hidden' }}>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%" role="img" aria-label={t.relationshipsLabel}>
            {graph.edges?.map((edge) => {
              const from = nodesById.get(edge.from);
              const to = nodesById.get(edge.to);
              if (!from || !to) return null;
              const fp = pointForNode(from);
              const tp = pointForNode(to);
              const midX = (fp.x + tp.x) / 2;
              const midY = (fp.y + tp.y) / 2;
              const dx = tp.x - fp.x;
              const dy = tp.y - fp.y;
              const dist = Math.max(Math.sqrt(dx ** 2 + dy ** 2), 1);
              const curve = edge.curve || 0;
              const cx = midX + (-dy / dist) * curve;
              const cy = midY + (dx / dist) * curve;
              const lx = (fp.x + 2 * cx + tp.x) / 4;
              const ly = (fp.y + 2 * cy + tp.y) / 4;
              return (
                <g key={`${edge.from}-${edge.to}`}>
                  <path d={`M ${fp.x} ${fp.y} Q ${cx} ${cy} ${tp.x} ${tp.y}`} fill="none" stroke={edge.color || category.accent} strokeWidth={3.4} strokeLinecap="round" opacity={0.82} />
                  <text x={lx} y={ly - 6} textAnchor="middle" fill={edge.color || category.accent} style={{ fontFamily: 'var(--font-main)', fontSize: isMobile ? '10px' : '11px', fontWeight: 800 }}>{edge.label}</text>
                </g>
              );
            })}
            {graph.nodes.map((node) => {
              const pt = pointForNode(node);
              const r = node.id === graph.centerId ? (isMobile ? 30 : 34) : (isMobile ? 24 : 26);
              return (
                <g key={node.id}>
                  <circle cx={pt.x} cy={pt.y} r={r} fill={node.id === graph.centerId ? node.accent : '#ffffff'} stroke={node.accent} strokeWidth={node.id === graph.centerId ? 5 : 3.5} />
                  <text x={pt.x} y={pt.y - 4} textAnchor="middle" fill={node.id === graph.centerId ? '#ffffff' : '#0f172a'} style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: node.id === graph.centerId ? (isMobile ? '14px' : '16px') : (isMobile ? '12px' : '13px'), fontWeight: 400 }}>
                    {node.shortLabel || node.label}
                  </text>
                  {node.id !== graph.centerId ? (
                    <text x={pt.x} y={pt.y + 12} textAnchor="middle" fill="#475569" style={{ fontFamily: 'var(--font-main)', fontSize: isMobile ? '8px' : '9px', fontWeight: 800 }}>{node.relation || ''}</text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="sketchbook-border" style={{ background: '#ffffff', border: '2.5px solid #dbeafe', borderBottom: '7px solid #93c5fd', borderRadius: '22px', padding: '16px', display: 'grid', gap: '14px' }}>
          {graph.edges?.map((edge) => {
            const fromNode = nodesById.get(edge.from);
            const toNode = nodesById.get(edge.to);
            return (
              <div key={edge.id || `${edge.from}-${edge.to}`} className="sketchbook-border" style={{ background: '#f8fafc', border: '2.5px solid #e2e8f0', borderBottom: '7px solid #cbd5e1', borderRadius: '18px', padding: '14px', display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  {renderBadge(t.activeConnectionLabel, '#cbd5e1', '#94a3b8', '#ffffff', '#475569')}
                  <span style={{ color: edge.color || category.accent, fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: '1rem', lineHeight: 1.1 }}>{fromNode?.label} / {toNode?.label}</span>
                </div>
                <p style={{ margin: 0, color: '#334155', fontFamily: 'var(--font-main)', fontWeight: '800', fontSize: isMobile ? '0.86rem' : '0.9rem', lineHeight: 1.58 }}>{edge.label}</p>
                {edge.detail ? <p style={{ margin: 0, color: '#475569', fontFamily: 'var(--font-main)', fontWeight: '700', fontSize: isMobile ? '0.84rem' : '0.88rem', lineHeight: 1.58 }}>{edge.detail}</p> : null}
                {edge.emotions?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {edge.emotions.map((emotion) => (
                      <span key={`${edge.id}-${emotion}`} className="sketchbook-border" style={{ padding: '7px 10px', borderRadius: '999px', background: '#ffffff', border: `2px solid ${edge.color || category.border}`, borderBottom: `5px solid ${edge.color || category.border}`, color: '#1e293b', fontFamily: 'var(--font-main)', fontWeight: '800', fontSize: '0.78rem', lineHeight: 1 }}>{emotion}</span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                  <div className="sketchbook-border" style={{ background: '#ffffff', border: '2px solid #dbeafe', borderBottom: '6px solid #93c5fd', borderRadius: '16px', padding: '12px', display: 'grid', gap: '6px' }}>
                    <span style={{ color: '#1d4ed8', fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: '0.9rem' }}>{t.intensityLabel}</span>
                    <span style={{ color: '#0f172a', fontFamily: 'var(--font-main)', fontWeight: '800', fontSize: '0.88rem' }}>{edge.intensity || 'Medium'}</span>
                  </div>
                  <div className="sketchbook-border" style={{ background: '#ffffff', border: '2px solid #dcfce7', borderBottom: '6px solid #4ade80', borderRadius: '16px', padding: '12px', display: 'grid', gap: '6px' }}>
                    <span style={{ color: '#15803d', fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: '0.9rem' }}>{t.relationStatusLabel}</span>
                    <span style={{ color: '#0f172a', fontFamily: 'var(--font-main)', fontWeight: '800', fontSize: '0.88rem' }}>{edge.status || 'Active'}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {legendItems.length > 0 && (
            <div style={{ display: 'grid', gap: '8px' }}>
              <span style={{ color: '#475569', fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: '0.94rem' }}>{t.legendLabel}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {legendItems.map((item) => (
                  <span key={`${item.label}-${item.color}`} className="sketchbook-border" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: '#ffffff', border: '2px solid #e2e8f0', borderBottom: '5px solid #cbd5e1', borderRadius: '999px', color: '#334155', fontFamily: 'var(--font-main)', fontWeight: '800', fontSize: '0.76rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '999px', background: item.color }} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
