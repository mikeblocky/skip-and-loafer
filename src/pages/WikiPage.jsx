import { Suspense, lazy, startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BookOpen, ChevronDown, ChevronLeft, FileText, Images, Info, Quote, Search, Sparkles, Users, X } from 'lucide-react';
import APP_UI_TEXT_GLOBAL from '../config/appUiText';
import { WIKI_SECTIONS } from '../data/wiki';
import { CONTENT_SLIDE_COMPACT, TRANSITION_FAST } from '../components/shared/animationPresets';
import { getPageRootStyle, getScrollablePaneStyle } from '../features/blog/blogStyles';
import { ensureMetaDescriptionTag } from '../features/blog/blogShared';
import usePageTitle from '../hooks/shared/usePageTitle';
import { getWikiEntryExtras } from '../features/wiki/wikiEnhancements';
import { WIKI_UI_TEXT } from '../features/wiki/wikiText';
import { useWikiHistoryNavigation } from '../features/wiki/useWikiHistoryNavigation';
import { IS_PRODUCTION_SERVER, PRODUCTION_WIKI_VISIBLE_ENTRY_IDS } from '../config/runtimeFlags';
import PaperPageHeader from '../components/shared/paper/PaperPageHeader';
import PaperHeadingBadge from '../components/shared/paper/PaperHeadingBadge';

const ImageLightbox = lazy(() => import('../components/shared/ImageLightbox'));

const CATEGORY_ICON_BY_ID = {
  characters: Users,
  story: BookOpen,
  influences: Sparkles,
};

const getCategoryIcon = (categoryId) => CATEGORY_ICON_BY_ID[categoryId] || FileText;

const getVisibleWikiSections = () => {
  if (!IS_PRODUCTION_SERVER) return WIKI_SECTIONS;

  return WIKI_SECTIONS.map((category) => {
    const allowedEntryIds = PRODUCTION_WIKI_VISIBLE_ENTRY_IDS[category.id];
    if (!allowedEntryIds) return null;

    const entries = category.entries.filter((entry) => allowedEntryIds.includes(entry.id));
    if (!entries.length) return null;

    return {
      ...category,
      entries,
    };
  }).filter(Boolean);
};

const mainPillStyle = (isMobile) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  background: '#ffffff',
  border: '3.5px solid #0ea5e9',
  borderBottom: '9px solid #0284c7',
  borderRadius: '24px',
  padding: isMobile ? '10px 18px' : '12px 24px',
  color: '#0f766e',
  fontFamily: '"Sniglet", "Coming Soon", cursive',
  fontSize: isMobile ? '1.3rem' : '1.4rem',
  fontWeight: '400',
  lineHeight: 1,
  boxShadow: '0 10px 20px rgba(14,165,233,0.12)',
});

const statPillStyle = (border, bottom, color, isMobile) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '50px',
  padding: isMobile ? '12px 16px' : '12px 18px',
  background: '#ffffff',
  border: `3px solid ${border}`,
  borderBottom: `8px solid ${bottom}`,
  borderRadius: '999px',
  color,
  fontFamily: '"Sniglet", "Coming Soon", cursive',
  fontSize: isMobile ? '0.96rem' : '1rem',
  fontWeight: '400',
  lineHeight: 1,
  boxShadow: '0 10px 18px rgba(15,23,42,0.08)',
});

const backButtonStyle = (isMobile) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: '3px solid #bfdbfe',
  borderBottom: '7px solid #60a5fa',
  background: '#ffffff',
  borderRadius: '18px',
  color: '#1d4ed8',
  fontFamily: '"Sniglet", "Coming Soon", cursive',
  fontWeight: '400',
  fontSize: isMobile ? '0.92rem' : '1rem',
  padding: '10px 18px',
  cursor: 'pointer',
});

const articleButtonStyle = (border, accent, surface, isMobile) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  border: `3px solid ${border}`,
  borderBottom: `7px solid ${border}`,
  background: surface,
  color: accent,
  borderRadius: '18px',
  padding: isMobile ? '12px 14px' : '12px 16px',
  cursor: 'pointer',
  fontFamily: '"Sniglet", "Coming Soon", cursive',
  fontSize: '0.98rem',
  fontWeight: '400',
  lineHeight: 1,
  whiteSpace: 'nowrap',
});

const renderBadge = (label, border, bottom, background, color) => (
  <span
    className="sketchbook-border"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '38px',
      padding: '7px 12px',
      background,
      border: `2.5px solid ${border}`,
      borderBottom: `6px solid ${bottom}`,
      borderRadius: '999px',
      color,
      fontFamily: 'var(--font-main)',
      fontSize: '0.84rem',
      fontWeight: '800',
      lineHeight: 1,
    }}
  >
    {label}
  </span>
);

const normalizeForSearch = (value = '') => value.toLowerCase().trim();

const getAnchorId = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const getTableSearchTokens = (table = {}) => [
  table.title,
  ...(table.columns || []),
  ...((table.rows || []).flatMap((row) => row || [])),
];

const getSectionSearchTokens = (section = {}) => [
  section.title,
  ...(section.paragraphs || []),
  ...(section.tables || []).flatMap((table) => getTableSearchTokens(table)),
  ...(section.subsections || []).flatMap((subsection) => [
    subsection.title,
    ...(subsection.paragraphs || []),
    ...((subsection.tables || []).flatMap((table) => getTableSearchTokens(table))),
  ]),
];

const getEntrySearchHaystack = (category, entry) => [
  category.title,
  category.description,
  entry.title,
  entry.shortTitle,
  entry.description,
  entry.lead,
  ...(entry.searchAliases || []),
  ...(entry.tags || []),
  entry.infobox?.title,
  entry.infobox?.subtitle,
  entry.infobox?.caption,
  ...(entry.infobox?.facts || []).flatMap((fact) => [fact.label, fact.value]),
  ...(entry.sections || []).flatMap((section) => getSectionSearchTokens(section)),
].filter(Boolean).join(' ');

const getEntryVersions = (entry, versionLabel) => {
  if (entry.galleryVersions?.length) {
    return entry.galleryVersions;
  }

  return [entry.image, ...(entry.galleryImages || [])]
    .filter(Boolean)
    .filter((src, index, array) => array.indexOf(src) === index)
    .map((src, index) => ({
      id: `version-${index + 1}`,
      label: `${versionLabel} ${index + 1}`,
      src,
    }));
};

const getSectionContents = (sections = []) => (
  sections.flatMap((section, sectionIndex) => {
    const sectionId = getAnchorId(section.title);
    return [
      { id: sectionId, title: section.title, level: 0, number: `${sectionIndex + 1}` },
      ...(section.subsections || []).map((subsection, subsectionIndex) => ({
        id: getAnchorId(`${section.title}-${subsection.title}`),
        title: subsection.title,
        level: 1,
        number: `${sectionIndex + 1}.${subsectionIndex + 1}`,
      })),
    ];
  })
);

const scrollToSection = (sectionId) => {
  if (typeof document === 'undefined') return;
  const nextTarget = document.getElementById(sectionId);
  if (!nextTarget) return;
  nextTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const searchInputWrapStyle = (isMobile) => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) auto',
  gap: '12px',
  alignItems: 'center',
});

const sectionCardStyle = (isMobile) => ({
  background: '#ffffff',
  border: '3px solid #cbd5e1',
  borderBottom: '10px solid #94a3b8',
  borderRadius: '26px',
  padding: isMobile ? '18px 16px' : '20px 22px',
  display: 'grid',
  gap: '14px',
  boxShadow: '0 10px 18px rgba(15,23,42,0.05)',
});

const subsectionCardStyle = (isMobile) => ({
  background: '#f8fafc',
  border: '2.5px solid #dbeafe',
  borderBottom: '8px solid #93c5fd',
  borderRadius: '20px',
  padding: isMobile ? '14px 14px 14px 16px' : '16px 16px 16px 18px',
  display: 'grid',
  gap: '10px',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.8)',
});

const tablePanelStyle = {
  background: '#ffffff',
  border: '2.5px solid #dbeafe',
  borderBottom: '7px solid #93c5fd',
  borderRadius: '20px',
  display: 'grid',
  gap: '12px',
};

const WikiSectionTable = ({ isMobile, table }) => {
  const rowCount = table.rows?.length || 0;
  const columnCount = table.columns?.length || 0;
  const [isExpanded, setIsExpanded] = useState(() => !(isMobile && rowCount > 2));

  return (
    <div
      className="sketchbook-border"
      style={{
        ...tablePanelStyle,
        padding: isMobile ? '14px' : '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'grid', gap: '6px' }}>
          {table.title ? (
            <h4
              style={{
                margin: 0,
                color: '#1d4ed8',
                fontFamily: '"Sniglet", "Coming Soon", cursive',
                fontSize: isMobile ? '1rem' : '1.08rem',
                fontWeight: '400',
                lineHeight: 1.18,
              }}
            >
              {table.title}
            </h4>
          ) : null}

          <p
            style={{
              margin: 0,
              color: '#64748b',
              fontFamily: 'var(--font-main)',
              fontWeight: '700',
              fontSize: isMobile ? '0.76rem' : '0.8rem',
              lineHeight: 1.4,
            }}
          >
            {rowCount} rows, {columnCount} columns
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          style={{
            ...articleButtonStyle('#bfdbfe', '#1d4ed8', '#eff6ff', isMobile),
            padding: '10px 14px',
          }}
        >
          <ChevronDown
            size={16}
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 160ms ease',
            }}
          />
          {isExpanded ? 'Hide table' : 'Show table'}
        </button>
      </div>

      {isExpanded ? (
        isMobile ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {(table.rows || []).map((row, rowIndex) => (
              <div
                key={`${table.title || 'row-card'}-${rowIndex}`}
                className="sketchbook-border"
                style={{
                  background: rowIndex % 2 === 0 ? '#f8fafc' : '#eff6ff',
                  border: '2px solid #dbeafe',
                  borderBottom: '6px solid #93c5fd',
                  borderRadius: '18px',
                  padding: '14px',
                  display: 'grid',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '30px',
                      padding: '5px 10px',
                      borderRadius: '999px',
                      border: '2px solid #bfdbfe',
                      borderBottom: '5px solid #93c5fd',
                      background: '#ffffff',
                      color: '#1d4ed8',
                      fontFamily: '"Sniglet", "Coming Soon", cursive',
                      fontSize: '0.76rem',
                      lineHeight: 1,
                    }}
                  >
                    {row[0] || `Row ${rowIndex + 1}`}
                  </span>
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  {(table.columns || []).map((column, cellIndex) => (
                    <div
                      key={`${table.title || 'row-card-cell'}-${rowIndex}-${column}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '96px minmax(0, 1fr)',
                        gap: '10px',
                        alignItems: 'start',
                      }}
                    >
                      <div
                        style={{
                          color: '#1d4ed8',
                          fontFamily: '"Sniglet", "Coming Soon", cursive',
                          fontWeight: '400',
                          fontSize: '0.78rem',
                          lineHeight: 1.2,
                        }}
                      >
                        {column}
                      </div>
                      <div
                        style={{
                          color: '#334155',
                          fontFamily: 'var(--font-main)',
                          fontWeight: '800',
                          fontSize: '0.82rem',
                          lineHeight: 1.45,
                        }}
                      >
                        {row[cellIndex] || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                minWidth: table.columns?.length > 3 ? '680px' : '520px',
                borderCollapse: 'separate',
                borderSpacing: 0,
              }}
            >
              <thead>
                <tr>
                  {(table.columns || []).map((column) => (
                    <th
                      key={column}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        borderTop: '1px solid #bfdbfe',
                        borderBottom: '2px solid #93c5fd',
                        fontFamily: '"Sniglet", "Coming Soon", cursive',
                        fontWeight: '400',
                        fontSize: '0.9rem',
                        lineHeight: 1.15,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(table.rows || []).map((row, rowIndex) => (
                  <tr key={`${table.title || 'row'}-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`${table.title || 'cell'}-${rowIndex}-${cellIndex}`}
                        style={{
                          padding: '11px 12px',
                          verticalAlign: 'top',
                          background: rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc',
                          borderBottom: '1px solid #dbeafe',
                          color: '#334155',
                          fontFamily: 'var(--font-main)',
                          fontWeight: '800',
                          fontSize: '0.86rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  );
};

const WikiSectionTables = ({ isMobile, tables = [] }) => {
  if (!tables.length) return null;

  return (
    <div style={{ display: 'grid', gap: '14px' }}>
      {tables.map((table) => (
        <WikiSectionTable
          key={`${table.title || 'table'}-${(table.columns || []).join('-')}`}
          isMobile={isMobile}
          table={table}
        />
      ))}
    </div>
  );
};

const WikiHighlightsPanel = ({ isMobile, t, entry }) => {
  if (!entry.highlights?.length) return null;

  return (
    <div
      className="sketchbook-border"
      style={{
        background: '#ffffff',
        border: '3px solid #fcd34d',
        borderBottom: '8px solid #f59e0b',
        borderRadius: '24px',
        padding: isMobile ? '18px 16px' : '20px 22px',
        display: 'grid',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309' }}>
        <Info size={18} strokeWidth={2.6} />
        <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: '1rem' }}>
          {t.detailsLabel}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
          gap: '12px',
        }}
      >
        {entry.highlights.map((highlight) => (
          <div
            key={`${highlight.label}-${highlight.value}`}
            className="sketchbook-border"
            style={{
              background: '#fffbeb',
              border: '2.5px solid #fde68a',
              borderBottom: '7px solid #fbbf24',
              borderRadius: '18px',
              padding: '14px',
              display: 'grid',
              gap: '8px',
            }}
          >
            <div style={{ color: '#b45309', fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: '0.92rem', lineHeight: 1.1 }}>
              {highlight.label}
            </div>
            <p
              style={{
                margin: 0,
                color: '#334155',
                fontFamily: 'var(--font-main)',
                fontWeight: '800',
                fontSize: isMobile ? '0.84rem' : '0.88rem',
                lineHeight: 1.55,
              }}
            >
              {highlight.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const WikiRelationshipPanel = ({ isMobile, t, category, entry }) => {
  const graph = entry.relationshipGraph;

  if (!graph?.nodes?.length) return null;

  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const svgWidth = isMobile ? 320 : 420;
  const svgHeight = isMobile ? 280 : 320;
  const pointForNode = (node) => ({
    x: (node.x / 100) * svgWidth,
    y: (node.y / 100) * svgHeight,
  });
  const legendItems = graph.legend?.length
    ? graph.legend
    : Array.from(new Map((graph.edges || []).map((edge) => [edge.color || category.accent, { label: edge.label, color: edge.color || category.accent }])).values());

  return (
    <div
      className="sketchbook-border"
      style={{
        background: '#ffffff',
        border: `3px solid ${category.border}`,
        borderBottom: `8px solid ${category.border}`,
        borderRadius: '24px',
        padding: isMobile ? '18px 16px' : '20px 22px',
        display: 'grid',
        gap: '16px',
      }}
    >
      <div style={{ display: 'grid', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: category.accent }}>
          <Sparkles size={18} strokeWidth={2.6} />
          <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: '1rem' }}>
            {t.dynamicsLabel}
          </span>
        </div>
        <p
          style={{
            margin: 0,
            color: '#475569',
            fontFamily: 'var(--font-main)',
            fontWeight: '700',
            fontSize: isMobile ? '0.84rem' : '0.9rem',
            lineHeight: 1.55,
          }}
        >
          {t.dynamicsHint}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : `${svgWidth}px minmax(0, 1fr)`,
          gap: '18px',
          alignItems: 'start',
        }}
      >
        <div
          className="sketchbook-border"
          style={{
            background: '#f8fafc',
            border: '2.5px solid #dbeafe',
            borderBottom: '7px solid #93c5fd',
            borderRadius: '22px',
            padding: '12px',
            overflow: 'hidden',
          }}
        >
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%" role="img" aria-label={t.relationshipsLabel}>
            {graph.edges?.map((edge) => {
              const from = nodesById.get(edge.from);
              const to = nodesById.get(edge.to);
              if (!from || !to) return null;
              const fromPoint = pointForNode(from);
              const toPoint = pointForNode(to);
              const midX = (fromPoint.x + toPoint.x) / 2;
              const midY = (fromPoint.y + toPoint.y) / 2;
              const dx = toPoint.x - fromPoint.x;
              const dy = toPoint.y - fromPoint.y;
              const distance = Math.max(Math.sqrt((dx ** 2) + (dy ** 2)), 1);
              const normalX = -dy / distance;
              const normalY = dx / distance;
              const curve = edge.curve || 0;
              const controlX = midX + (normalX * curve);
              const controlY = midY + (normalY * curve);
              const pathD = `M ${fromPoint.x} ${fromPoint.y} Q ${controlX} ${controlY} ${toPoint.x} ${toPoint.y}`;
              const labelX = (fromPoint.x + (2 * controlX) + toPoint.x) / 4;
              const labelY = (fromPoint.y + (2 * controlY) + toPoint.y) / 4;
              return (
                <g key={`${edge.from}-${edge.to}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={edge.color || category.accent}
                    strokeWidth={3.4}
                    strokeLinecap="round"
                    opacity={0.82}
                  />
                  <text
                    x={labelX}
                    y={labelY - 6}
                    textAnchor="middle"
                    fill={edge.color || category.accent}
                    style={{
                      fontFamily: 'var(--font-main)',
                      fontSize: isMobile ? '10px' : '11px',
                      fontWeight: 800,
                    }}
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {graph.nodes.map((node) => {
              const point = pointForNode(node);
              const radius = node.id === graph.centerId ? (isMobile ? 30 : 34) : (isMobile ? 24 : 26);
              return (
                <g
                  key={node.id}
                >
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={radius}
                    fill={node.id === graph.centerId ? node.accent : '#ffffff'}
                    stroke={node.accent}
                    strokeWidth={node.id === graph.centerId ? 5 : 3.5}
                  />
                  <text
                    x={point.x}
                    y={point.y - 4}
                    textAnchor="middle"
                    fill={node.id === graph.centerId ? '#ffffff' : '#0f172a'}
                    style={{
                      fontFamily: '"Sniglet", "Coming Soon", cursive',
                      fontSize: node.id === graph.centerId ? (isMobile ? '14px' : '16px') : (isMobile ? '12px' : '13px'),
                      fontWeight: 400,
                    }}
                  >
                  {node.shortLabel || node.label}
                  </text>
                  {node.id !== graph.centerId ? (
                    <text
                      x={point.x}
                      y={point.y + 12}
                      textAnchor="middle"
                      fill="#475569"
                      style={{
                        fontFamily: 'var(--font-main)',
                        fontSize: isMobile ? '8px' : '9px',
                        fontWeight: 800,
                      }}
                    >
                      {node.relation || ''}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>

        <div
          className="sketchbook-border"
          style={{
            background: '#ffffff',
            border: '2.5px solid #dbeafe',
            borderBottom: '7px solid #93c5fd',
            borderRadius: '22px',
            padding: '16px',
            display: 'grid',
            gap: '14px',
          }}
        >
          {graph.edges?.map((edge) => {
            const fromNode = nodesById.get(edge.from);
            const toNode = nodesById.get(edge.to);
            return (
              <div
                key={edge.id || `${edge.from}-${edge.to}`}
                className="sketchbook-border"
                style={{
                  background: '#f8fafc',
                  border: '2.5px solid #e2e8f0',
                  borderBottom: '7px solid #cbd5e1',
                  borderRadius: '18px',
                  padding: '14px',
                  display: 'grid',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  {renderBadge(t.activeConnectionLabel, '#cbd5e1', '#94a3b8', '#ffffff', '#475569')}
                  <span
                    style={{
                      color: edge.color || category.accent,
                      fontFamily: '"Sniglet", "Coming Soon", cursive',
                      fontSize: '1rem',
                      lineHeight: 1.1,
                    }}
                  >
                    {fromNode?.label} / {toNode?.label}
                  </span>
                </div>

                <p
                  style={{
                    margin: 0,
                    color: '#334155',
                    fontFamily: 'var(--font-main)',
                    fontWeight: '800',
                    fontSize: isMobile ? '0.86rem' : '0.9rem',
                    lineHeight: 1.58,
                  }}
                >
                  {edge.label}
                </p>

                {edge.detail ? (
                  <p
                    style={{
                      margin: 0,
                      color: '#475569',
                      fontFamily: 'var(--font-main)',
                      fontWeight: '700',
                      fontSize: isMobile ? '0.84rem' : '0.88rem',
                      lineHeight: 1.58,
                    }}
                  >
                    {edge.detail}
                  </p>
                ) : null}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {edge.emotions?.map((emotion) => (
                    <span
                      key={`${edge.id}-${emotion}`}
                      className="sketchbook-border"
                      style={{
                        padding: '7px 10px',
                        borderRadius: '999px',
                        background: '#ffffff',
                        border: `2px solid ${edge.color || category.border}`,
                        borderBottom: `5px solid ${edge.color || category.border}`,
                        color: '#1e293b',
                        fontFamily: 'var(--font-main)',
                        fontWeight: '800',
                        fontSize: '0.78rem',
                        lineHeight: 1,
                      }}
                    >
                      {emotion}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                    gap: '10px',
                  }}
                >
                  <div
                    className="sketchbook-border"
                    style={{
                      background: '#ffffff',
                      border: '2px solid #dbeafe',
                      borderBottom: '6px solid #93c5fd',
                      borderRadius: '16px',
                      padding: '12px',
                      display: 'grid',
                      gap: '6px',
                    }}
                  >
                    <span style={{ color: '#1d4ed8', fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: '0.9rem' }}>
                      {t.intensityLabel}
                    </span>
                    <span style={{ color: '#0f172a', fontFamily: 'var(--font-main)', fontWeight: '800', fontSize: '0.88rem' }}>
                      {edge.intensity || 'Medium'}
                    </span>
                  </div>

                  <div
                    className="sketchbook-border"
                    style={{
                      background: '#ffffff',
                      border: '2px solid #dcfce7',
                      borderBottom: '6px solid #4ade80',
                      borderRadius: '16px',
                      padding: '12px',
                      display: 'grid',
                      gap: '6px',
                    }}
                  >
                    <span style={{ color: '#15803d', fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: '0.9rem' }}>
                      {t.relationStatusLabel}
                    </span>
                    <span style={{ color: '#0f172a', fontFamily: 'var(--font-main)', fontWeight: '800', fontSize: '0.88rem' }}>
                      {edge.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {legendItems.length > 0 ? (
            <div style={{ display: 'grid', gap: '8px' }}>
              <span style={{ color: '#475569', fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: '0.94rem' }}>
                {t.legendLabel}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {legendItems.map((item) => (
                  <span
                    key={`${item.label}-${item.color}`}
                    className="sketchbook-border"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      background: '#ffffff',
                      border: '2px solid #e2e8f0',
                      borderBottom: '5px solid #cbd5e1',
                      borderRadius: '999px',
                      color: '#334155',
                      fontFamily: 'var(--font-main)',
                      fontWeight: '800',
                      fontSize: '0.76rem',
                    }}
                  >
                    <span style={{ width: '10px', height: '10px', borderRadius: '999px', background: item.color }} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
};

const WikiSearchBar = ({
  isMobile,
  t,
  searchTerm,
  onSearchChange,
  resultCount,
}) => (
  <div
    className="sketchbook-border"
    style={{
      background: '#ffffff',
      border: '3px solid #dbeafe',
      borderBottom: '8px solid #93c5fd',
      borderRadius: '24px',
      padding: isMobile ? '14px' : '16px 18px',
      display: 'grid',
      gap: '10px',
      boxShadow: '0 10px 18px rgba(15,23,42,0.06)',
    }}
  >
    <div style={searchInputWrapStyle(isMobile)}>
      <label
        style={{
          display: 'grid',
          gridTemplateColumns: '24px minmax(0, 1fr)',
          alignItems: 'center',
          gap: '10px',
          border: '2.5px solid #bfdbfe',
          borderBottom: '6px solid #93c5fd',
          borderRadius: '18px',
          padding: isMobile ? '10px 12px' : '12px 14px',
          background: '#eff6ff',
          color: '#1d4ed8',
        }}
      >
        <Search size={18} strokeWidth={2.6} />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchLabel}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: '#0f172a',
            fontFamily: 'var(--font-main)',
            fontSize: isMobile ? '0.94rem' : '0.98rem',
            fontWeight: '800',
          }}
        />
      </label>

      <div style={{ display: 'flex', gap: '10px', justifyContent: isMobile ? 'space-between' : 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={statPillStyle('#c4b5fd', '#8b5cf6', '#6d28d9', isMobile)}>
          {resultCount} {t.resultsLabel.toLowerCase()}
        </span>
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            style={{
              ...articleButtonStyle('#fecaca', '#b91c1c', '#fef2f2', isMobile),
              padding: isMobile ? '10px 12px' : '10px 14px',
            }}
          >
            <X size={16} strokeWidth={2.6} />
            {t.clearSearch}
          </button>
        )}
      </div>
    </div>
  </div>
);

const WikiRootView = ({
  isMobile,
  t,
  categories,
  totalEntries,
  searchTerm,
  globalSearchResults,
  onSearchChange,
  onSelectCategory,
  onSelectEntry,
}) => (
  <div style={{ display: 'grid', gap: isMobile ? '18px' : '22px' }}>
    <PaperPageHeader
      isMobile={isMobile}
      leftSlot={(
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
          <span style={statPillStyle('#93c5fd', '#2563eb', '#1d4ed8', isMobile)}>
            {categories.length} {t.categoriesLabel.toLowerCase()}
          </span>
          <span style={statPillStyle('#fbbf24', '#f59e0b', '#b45309', isMobile)}>
            {totalEntries} {t.entriesLabel.toLowerCase()}
          </span>
        </div>
      )}
      center={(
        <PaperHeadingBadge
          isMobile={isMobile}
          icon={BookOpen}
          title={t.header}
          palette={{
            borderColor: '#0ea5e9',
            bottomColor: '#0284c7',
            shadow: '0 8px 18px rgba(14, 165, 233, 0.12)',
          }}
          titleColor="#0284c7"
          iconColor="#0284c7"
        />
      )}
      rightSlot={(
        <span style={statPillStyle('#a7f3d0', '#34d399', '#047857', isMobile)}>
          {t.browseLabel}
        </span>
      )}
      paddingMobile="0"
      paddingDesktop="0"
      marginBottomMobile="0"
      marginBottomDesktop="0"
    />

    <motion.div
      initial={{ opacity: 0, y: 18, rotate: -0.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      className="sketchbook-border"
      style={{
        background: '#ffffff',
        border: '3.5px solid #93c5fd',
        borderBottom: '10px solid #60a5fa',
        borderRadius: '30px',
        padding: isMobile ? '20px 18px' : '26px 28px',
        boxShadow: '0 16px 34px rgba(15,23,42,0.08)',
        display: 'grid',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {renderBadge(t.categoriesLabel, '#93c5fd', '#60a5fa', '#ffffff', '#1d4ed8')}
      </div>
      <h2
        style={{
          margin: 0,
          fontFamily: '"Sniglet", "Coming Soon", cursive',
          color: '#0f172a',
          fontSize: isMobile ? '1.6rem' : '2.1rem',
          fontWeight: '400',
          lineHeight: 1.08,
        }}
      >
        World notes, cast pages, and story background
      </h2>
      <p
        style={{
          margin: 0,
          color: '#475569',
          fontFamily: 'var(--font-main)',
          fontSize: isMobile ? '0.92rem' : '0.98rem',
          fontWeight: '700',
          lineHeight: 1.58,
          maxWidth: '72ch',
        }}
      >
        {t.rootIntro}
      </p>
    </motion.div>

    <WikiSearchBar
      isMobile={isMobile}
      t={t}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      resultCount={searchTerm ? globalSearchResults.length : totalEntries}
    />

    {searchTerm ? (
      globalSearchResults.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            gap: '16px',
          }}
        >
          {globalSearchResults.map((entry, index) => (
            <motion.div
              key={`${entry.categoryId}:${entry.id}`}
              initial={{ opacity: 0, y: 18, rotate: index % 2 === 0 ? -0.4 : 0.4 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18, delay: index * 0.03 }}
              className="sketchbook-border"
              style={{
                background: '#ffffff',
                border: `3px solid ${entry.categoryBorder}`,
                borderBottom: `9px solid ${entry.categoryBorder}`,
                borderRadius: '24px',
                padding: isMobile ? '18px 16px' : '20px 20px 18px',
                display: 'grid',
                gap: '14px',
                boxShadow: '0 10px 18px rgba(15,23,42,0.06)',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
                {renderBadge(entry.categoryTitle, entry.categoryBorder, entry.categoryBorder, entry.categorySurface, entry.categoryAccent)}
                {entry.tags?.[0] ? renderBadge(entry.tags[0], '#dbeafe', '#93c5fd', '#eff6ff', '#1d4ed8') : null}
              </div>

              <div style={{ display: 'grid', gap: '8px' }}>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: '"Sniglet", "Coming Soon", cursive',
                    color: '#0f172a',
                    fontSize: isMobile ? '1.18rem' : '1.32rem',
                    fontWeight: '400',
                    lineHeight: 1.12,
                  }}
                >
                  {entry.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: '#475569',
                    fontFamily: 'var(--font-main)',
                    fontWeight: '700',
                    fontSize: isMobile ? '0.84rem' : '0.9rem',
                    lineHeight: 1.55,
                  }}
                >
                  {entry.description}
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => onSelectEntry(entry.categoryId, entry.id)}
                  style={articleButtonStyle(entry.categoryBorder, entry.categoryAccent, entry.categorySurface, isMobile)}
                >
                  {t.openEntry}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectCategory(entry.categoryId)}
                  style={articleButtonStyle('#dbeafe', '#1d4ed8', '#eff6ff', isMobile)}
                >
                  {t.openCategory}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div
          className="sketchbook-border"
          style={{
            background: '#ffffff',
            border: '3px dashed #cbd5e1',
            borderBottom: '8px solid #cbd5e1',
            borderRadius: '24px',
            padding: isMobile ? '22px 18px' : '28px 30px',
            textAlign: 'center',
            color: '#64748b',
            fontFamily: 'var(--font-main)',
            fontWeight: '800',
            lineHeight: 1.5,
          }}
        >
          {t.noResults}
        </div>
      )
    ) : categories.length > 0 ? (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
          gap: '16px',
        }}
      >
        {categories.map((category, index) => {
        const Icon = getCategoryIcon(category.id);
        return (
          <motion.button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.98, y: 2 }}
            className="sketchbook-border"
            style={{
              textAlign: 'left',
              background: '#ffffff',
              border: `3px solid ${category.border}`,
              borderBottom: `9px solid ${category.border}`,
              borderRadius: '26px',
              padding: isMobile ? '18px 16px' : '20px 20px 18px',
              boxShadow: '0 12px 24px rgba(15,23,42,0.06)',
              display: 'grid',
              gap: '14px',
              cursor: 'pointer',
            }}
            initial={{ opacity: 0, y: 24, rotate: index % 2 === 0 ? -0.5 : 0.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18, delay: index * 0.06 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '18px',
                  background: category.surface,
                  border: `3px solid ${category.border}`,
                  borderBottom: `7px solid ${category.border}`,
                  color: category.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `inset 0 0 0 1px ${category.border}22`,
                }}
              >
                <Icon size={24} strokeWidth={2.6} />
              </div>
              {renderBadge(`${category.entries.length} ${t.entriesLabel.toLowerCase()}`, category.border, category.border, category.surface, category.accent)}
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              <h3
                style={{
                  margin: 0,
                  fontFamily: '"Sniglet", "Coming Soon", cursive',
                  color: '#0f172a',
                  fontSize: isMobile ? '1.18rem' : '1.28rem',
                  fontWeight: '400',
                  lineHeight: 1.15,
                }}
              >
                {category.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  color: '#475569',
                  fontFamily: 'var(--font-main)',
                  fontWeight: '700',
                  fontSize: isMobile ? '0.84rem' : '0.88rem',
                  lineHeight: 1.5,
                }}
              >
                {category.description}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  color: category.accent,
                  fontFamily: '"Sniglet", "Coming Soon", cursive',
                  fontSize: '0.96rem',
                  fontWeight: '400',
                  lineHeight: 1,
                }}
              >
                {t.openCategory}
              </span>
              <ArrowRight size={18} strokeWidth={2.8} color={category.accent} />
            </div>
          </motion.button>
        );
        })}
      </div>
    ) : (
      <div
        className="sketchbook-border"
        style={{
          background: '#ffffff',
          border: '3px dashed #cbd5e1',
          borderBottom: '8px solid #cbd5e1',
          borderRadius: '24px',
          padding: isMobile ? '22px 18px' : '28px 30px',
          textAlign: 'center',
          color: '#64748b',
          fontFamily: 'var(--font-main)',
          fontWeight: '800',
          lineHeight: 1.5,
        }}
      >
        {t.noResults}
      </div>
    )}
  </div>
);

const WikiCategoryView = ({
  isMobile,
  t,
  category,
  entries,
  searchTerm,
  onSearchChange,
  onBackToWiki,
  onSelectEntry,
}) => {
  const featuredEntry = entries[0];
  const remainingEntries = entries.slice(1);
  const Icon = getCategoryIcon(category.id);

  return (
    <div style={{ display: 'grid', gap: isMobile ? '18px' : '22px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
        <button type="button" onClick={onBackToWiki} style={backButtonStyle(isMobile)}>
          <ChevronLeft size={16} strokeWidth={3} />
          {t.backToWiki}
        </button>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
          {renderBadge(category.title, category.border, category.border, category.surface, category.accent)}
          {renderBadge(`${entries.length} ${t.entriesLabel.toLowerCase()}`, '#cbd5e1', '#94a3b8', '#ffffff', '#475569')}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18, rotate: -0.6 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="sketchbook-border"
        style={{
          background: category.surface,
          border: `3.5px solid ${category.border}`,
          borderBottom: `10px solid ${category.border}`,
          borderRadius: '30px',
          padding: isMobile ? '20px 18px' : '26px 28px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) auto',
          gap: '20px',
          boxShadow: `0 16px 34px ${category.accent}14`,
        }}
      >
        <div style={{ display: 'grid', gap: '12px', minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                border: `3px solid ${category.border}`,
                borderBottom: `7px solid ${category.border}`,
                background: '#ffffff',
                color: category.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={22} strokeWidth={2.6} />
            </div>
            {renderBadge('Category', '#cbd5e1', '#94a3b8', '#ffffff', '#475569')}
          </div>

          <h2
            style={{
              margin: 0,
              fontFamily: '"Sniglet", "Coming Soon", cursive',
              color: '#0f172a',
              fontSize: isMobile ? '1.7rem' : '2.2rem',
              lineHeight: 1.08,
              fontWeight: '400',
            }}
          >
            {category.title}
          </h2>

          <p
            style={{
              margin: 0,
              color: '#475569',
              fontFamily: 'var(--font-main)',
              fontWeight: '700',
              fontSize: isMobile ? '0.92rem' : '0.98rem',
              lineHeight: 1.58,
              maxWidth: '68ch',
            }}
          >
            {category.description}
          </p>
        </div>

        {featuredEntry ? (
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'end' }}>
            <motion.button
              type="button"
              onClick={() => onSelectEntry(featuredEntry.id)}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.94, y: 6 }}
              className="sketchbook-border paper-interact"
              style={{
                minWidth: isMobile ? '100%' : '172px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: '#ffffff',
                border: `3.5px solid ${category.border}`,
                borderBottom: `9px solid ${category.border}`,
                borderRadius: '24px',
                padding: isMobile ? '14px 16px' : '16px 20px',
                color: category.accent,
                fontFamily: '"Sniglet", "Coming Soon", cursive',
                fontSize: isMobile ? '1.02rem' : '1.08rem',
                fontWeight: '400',
                cursor: 'pointer',
              }}
            >
              {t.openEntry}
              <ArrowRight size={18} strokeWidth={2.8} />
            </motion.button>
          </div>
        ) : null}
      </motion.div>

      <WikiSearchBar
        isMobile={isMobile}
        t={t}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        resultCount={entries.length}
      />

      {featuredEntry ? (
        <>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
        className="sketchbook-border"
        style={{
          background: '#ffffff',
          border: `3.5px solid ${category.border}`,
          borderBottom: `10px solid ${category.border}`,
          borderRadius: '28px',
          padding: isMobile ? '18px 16px' : '20px 22px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) auto',
          gap: '18px',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {renderBadge('Featured article', category.border, category.border, category.surface, category.accent)}
          </div>
          <h3
            style={{
              margin: 0,
              fontFamily: '"Sniglet", "Coming Soon", cursive',
              color: '#0f172a',
              fontSize: isMobile ? '1.28rem' : '1.48rem',
              lineHeight: 1.12,
              fontWeight: '400',
            }}
          >
            {featuredEntry.title}
          </h3>
          <p
            style={{
              margin: 0,
              color: '#475569',
              fontFamily: 'var(--font-main)',
              fontWeight: '700',
              fontSize: isMobile ? '0.84rem' : '0.9rem',
              lineHeight: 1.52,
            }}
          >
            {featuredEntry.description}
          </p>
        </div>

        <motion.button
          type="button"
          onClick={() => onSelectEntry(featuredEntry.id)}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.94, y: 4 }}
          style={articleButtonStyle(category.border, category.accent, category.surface, isMobile)}
        >
          {t.openEntry}
        </motion.button>
      </motion.div>

      <div style={{ display: 'grid', gap: '14px' }}>
        {remainingEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20, rotate: index % 2 === 0 ? -0.5 : 0.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.05 * (index + 1) }}
            whileHover={{ y: -4, scale: 1.005 }}
            className="sketchbook-border"
            style={{
              background: '#ffffff',
              border: `3px solid ${category.border}`,
              borderBottom: `8px solid ${category.border}`,
              borderRadius: '24px',
              padding: isMobile ? '16px' : '18px 20px',
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '56px minmax(0, 1fr) auto',
              gap: '14px',
              alignItems: 'start',
              boxShadow: '0 10px 18px rgba(15,23,42,0.05)',
            }}
          >
            <div
              style={{
                width: '56px',
                minWidth: '56px',
                height: '56px',
                borderRadius: '18px',
                border: `3px solid ${category.border}`,
                borderBottom: `7px solid ${category.border}`,
                background: category.surface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: category.accent,
                fontFamily: '"Sniglet", "Coming Soon", cursive',
                fontSize: '0.92rem',
                fontWeight: '400',
              }}
            >
              {String(index + 2).padStart(2, '0')}
            </div>

            <div style={{ display: 'grid', gap: '8px', minWidth: 0 }}>
              <h3
                style={{
                  margin: 0,
                  fontFamily: '"Sniglet", "Coming Soon", cursive',
                  color: '#0f172a',
                  fontSize: isMobile ? '1.08rem' : '1.22rem',
                  lineHeight: 1.16,
                  fontWeight: '400',
                }}
              >
                {entry.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  color: '#475569',
                  fontFamily: 'var(--font-main)',
                  fontWeight: '700',
                  fontSize: isMobile ? '0.82rem' : '0.86rem',
                  lineHeight: 1.48,
                }}
              >
                {entry.description}
              </p>
            </div>

            <motion.button
              type="button"
              onClick={() => onSelectEntry(entry.id)}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.94, y: 4 }}
              style={articleButtonStyle(category.border, category.accent, category.surface, isMobile)}
            >
              {t.openEntry}
            </motion.button>
          </motion.div>
        ))}
      </div>
        </>
      ) : (
        <div
          className="sketchbook-border"
          style={{
            background: '#ffffff',
            border: '3px dashed #cbd5e1',
            borderBottom: '8px solid #cbd5e1',
            borderRadius: '24px',
            padding: isMobile ? '22px 18px' : '28px 30px',
            textAlign: 'center',
            color: '#64748b',
            fontFamily: 'var(--font-main)',
            fontWeight: '800',
            lineHeight: 1.5,
          }}
        >
          {t.noResults}
        </div>
      )}
    </div>
  );
};

const WikiDetailView = ({
  isMobile,
  t,
  category,
  entry,
  onBackToWiki,
  onBackToCategory,
  onSelectRelated,
  onOpenGallery,
}) => {
  const displaySections = entry.sections || [];
  const sectionIds = getSectionContents(displaySections);
  const infoboxFacts = entry.infobox?.facts || [];
  const versions = useMemo(() => getEntryVersions(entry, t.versionLabel), [entry, t.versionLabel]);
  const [activeVersionSrc, setActiveVersionSrc] = useState(versions[0]?.src || entry.image);

  useEffect(() => {
    setActiveVersionSrc(versions[0]?.src || entry.image);
  }, [entry, versions]);

  const activeVersion = versions.find((version) => version.src === activeVersionSrc) || versions[0] || null;
  const galleryItems = useMemo(
    () => [...(entry.galleryImages || []), ...(entry.galleryVersions || []).map((version) => version.src)]
      .filter(Boolean)
      .filter((src, index, array) => array.indexOf(src) === index),
    [entry],
  );

  return (
    <div style={{ display: 'grid', gap: isMobile ? '18px' : '22px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button type="button" onClick={onBackToWiki} style={backButtonStyle(isMobile)}>
            <ChevronLeft size={16} strokeWidth={3} />
            {t.backToWiki}
          </button>
          <button type="button" onClick={onBackToCategory} style={backButtonStyle(isMobile)}>
            <ChevronLeft size={16} strokeWidth={3} />
            {t.backToCategory}
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {renderBadge(category.title, category.border, category.border, category.surface, category.accent)}
          {renderBadge('Article', '#cbd5e1', '#94a3b8', '#ffffff', '#475569')}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18, rotate: -0.4 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="sketchbook-border"
        style={{
          background: '#ffffff',
          border: `3.5px solid ${category.border}`,
          borderBottom: `10px solid ${category.border}`,
          borderRadius: '30px',
          padding: isMobile ? '20px 18px' : '24px 26px',
          display: 'grid',
          gap: '14px',
          boxShadow: '0 16px 30px rgba(15,23,42,0.08)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {renderBadge(entry.infobox?.subtitle || category.title, category.border, category.border, category.surface, category.accent)}
        </div>

        <div style={{ display: 'grid', gap: '10px' }}>
          <h1
            style={{
              margin: 0,
              fontFamily: '"Sniglet", "Coming Soon", cursive',
              color: '#0f172a',
              fontSize: isMobile ? '1.8rem' : '2.35rem',
              fontWeight: '400',
              lineHeight: 1.05,
            }}
          >
            {entry.title}
          </h1>
          <p
            style={{
              margin: 0,
              color: '#475569',
              fontFamily: 'var(--font-main)',
              fontWeight: '700',
              fontSize: isMobile ? '0.96rem' : '1rem',
              lineHeight: 1.62,
              maxWidth: '76ch',
            }}
          >
            {entry.lead}
          </p>
        </div>
      </motion.div>

      {entry.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {entry.tags.map((tag) => renderBadge(tag, '#dbeafe', '#93c5fd', '#eff6ff', '#1d4ed8'))}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 320px',
          gap: isMobile ? '18px' : '22px',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'grid', gap: '16px', order: isMobile ? 2 : 1 }}>
          <div
            className="sketchbook-border"
            style={{
              background: '#ffffff',
              border: '3px solid #dbeafe',
              borderBottom: '8px solid #93c5fd',
              borderRadius: '24px',
              padding: isMobile ? '16px' : '18px 20px',
              display: 'grid',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8' }}>
              <Info size={18} strokeWidth={2.6} />
              <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: '1rem' }}>
                {t.sectionContents}
              </span>
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {sectionIds.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    paddingLeft: section.level === 1 ? '18px' : '0',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: section.level === 1 ? '#475569' : '#334155',
                    fontFamily: 'var(--font-main)',
                    fontWeight: '800',
                    fontSize: section.level === 1
                      ? (isMobile ? '0.82rem' : '0.86rem')
                      : (isMobile ? '0.86rem' : '0.9rem'),
                    lineHeight: 1.35,
                  }}
                  >
                    <span
                      style={{
                      minWidth: '30px',
                      height: '30px',
                      borderRadius: '10px',
                      border: section.level === 1 ? '2px solid #dbeafe' : '2px solid #bfdbfe',
                      borderBottom: section.level === 1 ? '4px solid #cbd5e1' : '4px solid #93c5fd',
                      background: section.level === 1 ? '#f8fafc' : '#eff6ff',
                      color: section.level === 1 ? '#475569' : '#1d4ed8',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: '"Sniglet", "Coming Soon", cursive',
                      fontSize: '0.78rem',
                    }}
                  >
                    {section.number}
                  </span>
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          </div>

          {displaySections.map((section, index) => (
            <motion.section
              key={section.title}
              id={getAnchorId(section.title)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 * index }}
              className="sketchbook-border"
              style={{ ...sectionCardStyle(isMobile), scrollMarginTop: '22px' }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                {renderBadge(`${t.sectionLabel} ${index + 1}`, '#cbd5e1', '#94a3b8', '#f8fafc', '#334155')}
              </div>

              <h2
                style={{
                  margin: 0,
                  fontFamily: '"Sniglet", "Coming Soon", cursive',
                  fontSize: isMobile ? '1.28rem' : '1.46rem',
                  color: '#0f172a',
                  fontWeight: '400',
                  lineHeight: 1.12,
                }}
              >
                {section.title}
              </h2>

              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  style={{
                    margin: 0,
                    color: '#334155',
                    fontFamily: 'var(--font-main)',
                    fontWeight: '700',
                    fontSize: isMobile ? '0.9rem' : '0.94rem',
                    lineHeight: 1.7,
                  }}
                >
                  {paragraph}
                </p>
              ))}

              <WikiSectionTables isMobile={isMobile} tables={section.tables} />

              {section.subsections?.map((subsection, subsectionIndex) => (
                <div
                  key={`${section.title}-${subsection.title}-${subsectionIndex}`}
                  className="sketchbook-border"
                  id={getAnchorId(`${section.title}-${subsection.title}`)}
                  style={{ ...subsectionCardStyle(isMobile), scrollMarginTop: '22px' }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                    {renderBadge(
                      `${t.subsectionLabel} ${index + 1}.${subsectionIndex + 1}`,
                      '#bfdbfe',
                      '#60a5fa',
                      '#eff6ff',
                      '#1d4ed8',
                    )}
                  </div>

                  <h3
                    style={{
                      margin: 0,
                      fontFamily: '"Sniglet", "Coming Soon", cursive',
                      fontSize: isMobile ? '1.08rem' : '1.18rem',
                      color: '#1d4ed8',
                      fontWeight: '400',
                      lineHeight: 1.18,
                    }}
                  >
                    {subsection.title}
                  </h3>

                  {subsection.paragraphs.map((paragraph) => (
                    <p
                      key={`${subsection.title}-${paragraph}`}
                      style={{
                        margin: 0,
                        color: '#334155',
                        fontFamily: 'var(--font-main)',
                        fontWeight: '700',
                        fontSize: isMobile ? '0.88rem' : '0.92rem',
                        lineHeight: 1.68,
                      }}
                    >
                      {paragraph}
                    </p>
                  ))}

                  <WikiSectionTables isMobile={isMobile} tables={subsection.tables} />
                </div>
              ))}
            </motion.section>
          ))}

          {entry.related?.length > 0 && (
            <div
              className="sketchbook-border"
              style={{
                background: '#ffffff',
                border: '3px solid #fde68a',
                borderBottom: '8px solid #fbbf24',
                borderRadius: '24px',
                padding: isMobile ? '18px 16px' : '20px 22px',
                display: 'grid',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309' }}>
                <Sparkles size={18} strokeWidth={2.6} />
                <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: '1rem' }}>
                  {t.relatedArticles}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {entry.related.map((related) => (
                  <motion.button
                    key={`${related.categoryId}:${related.entryId}`}
                    type="button"
                    onClick={() => onSelectRelated(related.categoryId, related.entryId)}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.96, y: 2 }}
                    style={{
                      ...articleButtonStyle('#fde68a', '#92400e', '#fffbeb', isMobile),
                      padding: '10px 14px',
                    }}
                  >
                    {related.label}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {entry.quote && (
            <div
              className="sketchbook-border"
              style={{
                background: '#ffffff',
                border: '3px solid #c4b5fd',
                borderBottom: '8px solid #8b5cf6',
                borderRadius: '24px',
                padding: isMobile ? '18px 16px' : '20px 22px',
                display: 'grid',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6d28d9' }}>
                <Quote size={18} strokeWidth={2.6} />
                <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: '1rem' }}>
                  {t.quoteLabel}
                </span>
              </div>
              <blockquote
                style={{
                  margin: 0,
                  color: '#334155',
                  fontFamily: 'var(--font-main)',
                  fontWeight: '800',
                  fontSize: isMobile ? '0.96rem' : '1rem',
                  lineHeight: 1.7,
                }}
              >
                “{entry.quote.text}”
              </blockquote>
              <p
                style={{
                  margin: 0,
                  color: '#6d28d9',
                  fontFamily: '"Sniglet", "Coming Soon", cursive',
                  fontWeight: '400',
                  fontSize: '0.9rem',
                }}
              >
                {entry.quote.author}
              </p>
            </div>
          )}

          {galleryItems.length > 0 && (
            <div
              className="sketchbook-border"
              style={{
                background: '#ffffff',
                border: '3px solid #a7f3d0',
                borderBottom: '8px solid #34d399',
                borderRadius: '24px',
                padding: isMobile ? '18px 16px' : '20px 22px',
                display: 'grid',
                gap: '14px',
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857' }}>
                    <Images size={18} strokeWidth={2.6} />
                  <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: '1rem' }}>
                    {entry.galleryTitle || t.galleryLabel}
                  </span>
                </div>
                {renderBadge(`${galleryItems.length} images`, '#a7f3d0', '#34d399', '#ecfdf5', '#047857')}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))',
                  gap: '12px',
                }}
              >
                {galleryItems.map((imageSrc, index) => (
                  <motion.button
                    key={imageSrc}
                    type="button"
                    onClick={() => onOpenGallery(galleryItems, imageSrc, `${entry.title} gallery image ${index + 1}`)}
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.97, y: 1 }}
                    className="sketchbook-border"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      background: '#ffffff',
                      border: '3px solid #bbf7d0',
                      borderBottom: '7px solid #86efac',
                      borderRadius: '18px',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt={`${entry.title} gallery image ${index + 1}`}
                      style={{
                        display: 'block',
                        width: '100%',
                        height: isMobile ? '118px' : '138px',
                        objectFit: 'cover',
                        objectPosition: 'center',
                      }}
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside
          className="sketchbook-border"
          style={{
            background: '#ffffff',
            border: `3px solid ${category.border}`,
            borderBottom: `10px solid ${category.border}`,
            borderRadius: '26px',
            padding: isMobile ? '16px' : '18px',
            display: 'grid',
            gap: '14px',
            position: isMobile ? 'relative' : 'sticky',
            top: isMobile ? 'auto' : '22px',
            boxShadow: '0 12px 24px rgba(15,23,42,0.08)',
            order: isMobile ? 1 : 2,
          }}
        >
          <div style={{ display: 'grid', gap: '10px' }}>
            <div
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                border: `3px solid ${category.border}`,
                borderBottom: `8px solid ${category.border}`,
                background: category.surface,
              }}
            >
              <img
                src={activeVersion?.src || entry.image}
                alt={entry.title}
                style={{
                  display: 'block',
                  width: '100%',
                  height: isMobile ? '240px' : '280px',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  background: category.surface,
                }}
              />
            </div>

            <div style={{ display: 'grid', gap: '6px' }}>
              <h3
                style={{
                  margin: 0,
                  fontFamily: '"Sniglet", "Coming Soon", cursive',
                  fontWeight: '400',
                  fontSize: isMobile ? '1.14rem' : '1.2rem',
                  lineHeight: 1.12,
                  color: '#0f172a',
                  textAlign: 'center',
                }}
              >
                {entry.infobox?.title || entry.title}
              </h3>
              {entry.infobox?.subtitle && (
                <p
                  style={{
                    margin: 0,
                    textAlign: 'center',
                    color: category.accent,
                    fontFamily: 'var(--font-main)',
                    fontWeight: '800',
                    fontSize: '0.84rem',
                    lineHeight: 1.35,
                  }}
                >
                  {entry.infobox.subtitle}
                </p>
              )}
              {(activeVersion?.caption || entry.infobox?.caption) && (
                <p
                  style={{
                    margin: 0,
                    color: '#64748b',
                    fontFamily: 'var(--font-main)',
                    fontWeight: '700',
                    fontSize: '0.76rem',
                    lineHeight: 1.45,
                    textAlign: 'center',
                  }}
                >
                  {activeVersion?.caption || entry.infobox.caption}
                </p>
              )}
            </div>
          </div>

          {versions.length > 1 && (
            <div
              className="sketchbook-border"
              style={{
                background: '#f8fafc',
                border: '2.5px solid #dbeafe',
                borderBottom: '7px solid #93c5fd',
                borderRadius: '20px',
                padding: '14px',
                display: 'grid',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8' }}>
                <Images size={16} strokeWidth={2.6} />
                <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: '0.98rem' }}>
                  {t.versionsLabel}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {versions.map((version, index) => {
                  const isActive = version.src === (activeVersion?.src || '');
                  return (
                    <button
                      key={version.id || version.src}
                      type="button"
                      onClick={() => setActiveVersionSrc(version.src)}
                      style={{
                        ...articleButtonStyle(
                          isActive ? category.border : '#dbeafe',
                          isActive ? category.accent : '#1d4ed8',
                          isActive ? category.surface : '#eff6ff',
                          isMobile,
                        ),
                        padding: '10px 12px',
                      }}
                    >
                      {version.label || `${t.versionLabel} ${index + 1}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              border: '2.5px solid #e2e8f0',
              borderBottom: '7px solid #cbd5e1',
              background: '#f8fafc',
            }}
          >
            {infoboxFacts.map((fact, index) => (
              <div
                key={`${fact.label}-${fact.value}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '108px minmax(0, 1fr)',
                  gap: '10px',
                  padding: '12px 14px',
                  borderTop: index === 0 ? 'none' : '1px solid #dbeafe',
                  alignItems: 'start',
                }}
              >
                <div
                  style={{
                    color: '#1d4ed8',
                    fontFamily: '"Sniglet", "Coming Soon", cursive',
                    fontWeight: '400',
                    fontSize: '0.86rem',
                    lineHeight: 1.2,
                  }}
                >
                  {fact.label}
                </div>
                <div
                  style={{
                    color: '#334155',
                    fontFamily: 'var(--font-main)',
                    fontWeight: '800',
                    fontSize: '0.82rem',
                    lineHeight: 1.45,
                    minWidth: 0,
                  }}
                >
                  {fact.value}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

const WikiPage = ({ isMobile, uiLanguage = 'en' }) => {
  const t = { ...WIKI_UI_TEXT.en, ...(WIKI_UI_TEXT[uiLanguage] || {}) };
  const tGlobal = APP_UI_TEXT_GLOBAL[uiLanguage] || APP_UI_TEXT_GLOBAL.en;
  usePageTitle(tGlobal.tabs?.wiki?.label || t.header || 'Wiki');

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lightboxState, setLightboxState] = useState(null);

  const categories = useMemo(
    () => getVisibleWikiSections().map((category) => ({
      ...category,
      entries: category.entries.map((entry) => ({
        ...entry,
        ...(getWikiEntryExtras(category.id, entry.id) || {}),
      })),
    })),
    [],
  );
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) || null,
    [categories, selectedCategoryId],
  );
  const selectedEntry = useMemo(
    () => selectedCategory?.entries.find((entry) => entry.id === selectedEntryId) || null,
    [selectedCategory, selectedEntryId],
  );
  const totalEntries = useMemo(
    () => categories.reduce((sum, category) => sum + category.entries.length, 0),
    [categories],
  );
  const normalizedSearchTerm = useMemo(() => normalizeForSearch(searchTerm), [searchTerm]);

  const filteredCategories = useMemo(() => {
    if (!normalizedSearchTerm) return categories;

    return categories
      .map((category) => {
        const categoryMatch = normalizeForSearch(`${category.title} ${category.description}`).includes(normalizedSearchTerm);
        const nextEntries = category.entries.filter((entry) => {
          const haystack = getEntrySearchHaystack(category, entry);
          return normalizeForSearch(haystack).includes(normalizedSearchTerm);
        });

        if (!categoryMatch && nextEntries.length === 0) {
          return null;
        }

        return {
          ...category,
          entries: categoryMatch && nextEntries.length === 0 ? category.entries : nextEntries,
        };
      })
      .filter(Boolean);
  }, [categories, normalizedSearchTerm]);

  const globalSearchResults = useMemo(
    () => filteredCategories.flatMap((category) => category.entries.map((entry) => ({
      ...entry,
      categoryId: category.id,
      categoryTitle: category.title,
      categoryAccent: category.accent,
      categoryBorder: category.border,
      categorySurface: category.surface,
    }))),
    [filteredCategories],
  );

  const filteredSelectedCategory = useMemo(
    () => filteredCategories.find((category) => category.id === selectedCategoryId) || null,
    [filteredCategories, selectedCategoryId],
  );

  useWikiHistoryNavigation({
    selectedCategoryId,
    selectedEntryId,
    setSelectedCategoryId,
    setSelectedEntryId,
    categories,
  });

  useEffect(() => {
    if (selectedCategory && !selectedEntryId) return;
    if (!selectedCategoryId) return;
    if (!selectedCategory) {
      startTransition(() => {
        setSelectedCategoryId(null);
        setSelectedEntryId(null);
      });
    }
  }, [selectedCategory, selectedCategoryId, selectedEntryId]);

  useEffect(() => {
    if (!selectedCategory && selectedEntryId) {
      startTransition(() => {
        setSelectedEntryId(null);
      });
      return;
    }

    if (selectedCategory && selectedEntryId && !selectedEntry) {
      startTransition(() => {
        setSelectedEntryId(null);
      });
    }
  }, [selectedCategory, selectedEntry, selectedEntryId]);

  const handleSelectCategory = useCallback((categoryId) => {
    startTransition(() => {
      setSelectedCategoryId(categoryId);
      setSelectedEntryId(null);
    });
  }, []);

  const handleSelectEntry = useCallback((entryId) => {
    startTransition(() => {
      setSelectedEntryId(entryId);
    });
  }, []);

  const handleSelectGlobalEntry = useCallback((categoryId, entryId) => {
    startTransition(() => {
      setSelectedCategoryId(categoryId);
      setSelectedEntryId(entryId);
    });
  }, []);

  const handleSelectRelated = useCallback((categoryId, entryId) => {
    startTransition(() => {
      setSelectedCategoryId(categoryId);
      setSelectedEntryId(entryId);
    });
  }, []);

  const handleBackToWiki = useCallback(() => {
    startTransition(() => {
      setSelectedCategoryId(null);
      setSelectedEntryId(null);
    });
  }, []);

  const handleBackToCategory = useCallback(() => {
    startTransition(() => {
      setSelectedEntryId(null);
    });
  }, []);
  const handleOpenGallery = useCallback((images, src, altText) => {
    setLightboxState({ images, src, altText });
  }, []);
  const handleCloseGallery = useCallback(() => {
    setLightboxState(null);
  }, []);
  const handleNavigateGallery = useCallback((src) => {
    setLightboxState((current) => (current ? { ...current, src } : current));
  }, []);

  useEffect(() => {
    const descriptionTag = ensureMetaDescriptionTag();
    const previousDescription = descriptionTag.getAttribute('content') || '';
    const nextDescription = selectedEntry?.description || selectedCategory?.description || t.listHint || WIKI_UI_TEXT.en.listHint;

    descriptionTag.setAttribute('content', nextDescription);
    return () => {
      descriptionTag.setAttribute('content', previousDescription);
    };
  }, [selectedCategory, selectedEntry, t.listHint]);

  let content = null;

  if (!selectedCategory) {
    content = (
      <WikiRootView
        isMobile={isMobile}
        t={t}
        categories={filteredCategories}
        totalEntries={totalEntries}
        searchTerm={searchTerm}
        globalSearchResults={globalSearchResults}
        onSearchChange={setSearchTerm}
        onSelectCategory={handleSelectCategory}
        onSelectEntry={handleSelectGlobalEntry}
      />
    );
  } else if (!selectedEntry) {
    content = (
      <WikiCategoryView
        isMobile={isMobile}
        t={t}
        category={selectedCategory}
        entries={filteredSelectedCategory?.entries || []}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onBackToWiki={handleBackToWiki}
        onSelectEntry={handleSelectEntry}
      />
    );
  } else {
    content = (
      <WikiDetailView
        isMobile={isMobile}
        t={t}
        category={selectedCategory}
        entry={selectedEntry}
        onBackToWiki={handleBackToWiki}
        onBackToCategory={handleBackToCategory}
        onSelectRelated={handleSelectRelated}
        onOpenGallery={handleOpenGallery}
      />
    );
  }

  return (
    <div style={getPageRootStyle(isMobile)}>
      <AnimatePresence>
        {lightboxState ? (
          <Suspense fallback={null}>
            <ImageLightbox
              src={lightboxState.src}
              images={lightboxState.images}
              onClose={handleCloseGallery}
              onNavigate={handleNavigateGallery}
              isMobile={isMobile}
              altText={lightboxState.altText}
            />
          </Suspense>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedEntry ? `entry-${selectedCategoryId}-${selectedEntryId}` : (selectedCategory ? `category-${selectedCategoryId}` : 'wiki-root')}
          initial={CONTENT_SLIDE_COMPACT.initial}
          animate={CONTENT_SLIDE_COMPACT.animate}
          exit={CONTENT_SLIDE_COMPACT.exit}
          transition={TRANSITION_FAST}
          className="hide-scrollbar"
          data-no-tab-swipe={selectedEntry ? '1' : undefined}
          style={getScrollablePaneStyle(isMobile)}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WikiPage;
