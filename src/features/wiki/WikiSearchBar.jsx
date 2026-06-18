import { Search, X } from 'lucide-react';
import { statPillStyle, articleButtonStyle, searchInputWrapStyle } from './wikiStyleFns';

const WikiSearchBar = ({ isMobile, t, searchTerm, onSearchChange, resultCount }) => (
  <div className="sketchbook-border" style={{ background: '#ffffff', border: '3px solid #dbeafe', borderBottom: '8px solid #93c5fd', borderRadius: '24px', padding: isMobile ? '14px' : '16px 18px', display: 'grid', gap: '10px', boxShadow: '0 10px 18px rgba(15,23,42,0.06)' }}>
    <div style={searchInputWrapStyle(isMobile)}>
      <label style={{ display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr)', alignItems: 'center', gap: '10px', border: '2.5px solid #bfdbfe', borderBottom: '6px solid #93c5fd', borderRadius: '18px', padding: isMobile ? '10px 12px' : '12px 14px', background: '#eff6ff', color: '#1d4ed8' }}>
        <Search size={18} strokeWidth={2.6} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchLabel}
          style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', color: '#0f172a', fontFamily: 'var(--font-main)', fontSize: isMobile ? '0.94rem' : '0.98rem', fontWeight: '800' }}
        />
      </label>
      <div style={{ display: 'flex', gap: '10px', justifyContent: isMobile ? 'space-between' : 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={statPillStyle('#c4b5fd', '#8b5cf6', '#6d28d9', isMobile)}>
          {resultCount} {t.resultsLabel.toLowerCase()}
        </span>
        {searchTerm && (
          <button type="button" onClick={() => onSearchChange('')} style={{ ...articleButtonStyle('#fecaca', '#b91c1c', '#fef2f2', isMobile), padding: isMobile ? '10px 12px' : '10px 14px' }}>
            <X size={16} strokeWidth={2.6} />
            {t.clearSearch}
          </button>
        )}
      </div>
    </div>
  </div>
);

export default WikiSearchBar;
