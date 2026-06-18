import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { articleButtonStyle, tablePanelStyle } from './wikiStyleFns';

const WikiSectionTable = ({ isMobile, table }) => {
  const rowCount = table.rows?.length || 0;
  const columnCount = table.columns?.length || 0;
  const [isExpanded, setIsExpanded] = useState(() => !(isMobile && rowCount > 2));

  return (
    <div className="sketchbook-border" style={{ ...tablePanelStyle, padding: isMobile ? '14px' : '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'grid', gap: '6px' }}>
          {table.title ? (
            <h4 style={{ margin: 0, color: '#1d4ed8', fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: isMobile ? '1rem' : '1.08rem', fontWeight: '400', lineHeight: 1.18 }}>
              {table.title}
            </h4>
          ) : null}
          <p style={{ margin: 0, color: '#64748b', fontFamily: 'var(--font-main)', fontWeight: '700', fontSize: isMobile ? '0.76rem' : '0.8rem', lineHeight: 1.4 }}>
            {rowCount} rows, {columnCount} columns
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded((c) => !c)}
          style={{ ...articleButtonStyle('#bfdbfe', '#1d4ed8', '#eff6ff', isMobile), padding: '10px 14px' }}
        >
          <ChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 160ms ease' }} />
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
                style={{ background: rowIndex % 2 === 0 ? '#f8fafc' : '#eff6ff', border: '2px solid #dbeafe', borderBottom: '6px solid #93c5fd', borderRadius: '18px', padding: '14px', display: 'grid', gap: '10px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: '30px', padding: '5px 10px', borderRadius: '999px', border: '2px solid #bfdbfe', borderBottom: '5px solid #93c5fd', background: '#ffffff', color: '#1d4ed8', fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: '0.76rem', lineHeight: 1 }}>
                    {row[0] || `Row ${rowIndex + 1}`}
                  </span>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {(table.columns || []).slice(1).map((col, colIndex) => (
                    <div key={`${col}-${colIndex}`} style={{ display: 'grid', gridTemplateColumns: '80px minmax(0,1fr)', gap: '8px', alignItems: 'start' }}>
                      <span style={{ color: '#64748b', fontFamily: 'var(--font-main)', fontWeight: '700', fontSize: '0.76rem', lineHeight: 1.4, paddingTop: '2px' }}>{col}</span>
                      <span style={{ color: '#334155', fontFamily: 'var(--font-main)', fontWeight: '700', fontSize: '0.82rem', lineHeight: 1.45 }}>{row[colIndex + 1] ?? '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-main)', fontSize: '0.86rem' }}>
              <thead>
                <tr>
                  {(table.columns || []).map((col) => (
                    <th key={col} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '800', color: '#1d4ed8', background: '#eff6ff', borderBottom: '2px solid #bfdbfe', whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(table.rows || []).map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`} style={{ background: rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    {(table.columns || []).map((col, colIndex) => (
                      <td key={`${col}-${colIndex}`} style={{ padding: '10px 12px', color: '#334155', fontWeight: '700', borderBottom: '1px solid #e2e8f0', lineHeight: 1.5 }}>
                        {row[colIndex] ?? '—'}
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

export const WikiSectionTables = ({ isMobile, tables = [] }) => {
  if (!tables?.length) return null;
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

export default WikiSectionTable;
