import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import WikiSearchBar from './WikiSearchBar';
import { backButtonStyle, renderBadge, articleButtonStyle, getCategoryIcon } from './wikiStyleFns';

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

      <motion.div initial={{ opacity: 0, y: 18, rotate: -0.6 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} className="sketchbook-border" style={{ background: category.surface, border: `3.5px solid ${category.border}`, borderBottom: `10px solid ${category.border}`, borderRadius: '30px', padding: isMobile ? '20px 18px' : '26px 28px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) auto', gap: '20px', boxShadow: `0 16px 34px ${category.accent}14` }}>
        <div style={{ display: 'grid', gap: '12px', minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', border: `3px solid ${category.border}`, borderBottom: `7px solid ${category.border}`, background: '#ffffff', color: category.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} strokeWidth={2.6} />
            </div>
            {renderBadge('Category', '#cbd5e1', '#94a3b8', '#ffffff', '#475569')}
          </div>
          <h2 style={{ margin: 0, fontFamily: '"Sniglet", "Coming Soon", cursive', color: '#0f172a', fontSize: isMobile ? '1.7rem' : '2.2rem', lineHeight: 1.08, fontWeight: '400' }}>
            {category.title}
          </h2>
          <p style={{ margin: 0, color: '#475569', fontFamily: 'var(--font-main)', fontWeight: '700', fontSize: isMobile ? '0.92rem' : '0.98rem', lineHeight: 1.58, maxWidth: '68ch' }}>
            {category.description}
          </p>
        </div>
        {featuredEntry ? (
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'end' }}>
            <motion.button type="button" onClick={() => onSelectEntry(featuredEntry.id)} whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.94, y: 6 }} className="sketchbook-border paper-interact" style={{ minWidth: isMobile ? '100%' : '172px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#ffffff', border: `3.5px solid ${category.border}`, borderBottom: `9px solid ${category.border}`, borderRadius: '24px', padding: isMobile ? '14px 16px' : '16px 20px', color: category.accent, fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: isMobile ? '1.02rem' : '1.08rem', fontWeight: '400', cursor: 'pointer' }}>
              {t.openEntry}
              <ArrowRight size={18} strokeWidth={2.8} />
            </motion.button>
          </div>
        ) : null}
      </motion.div>

      <WikiSearchBar isMobile={isMobile} t={t} searchTerm={searchTerm} onSearchChange={onSearchChange} resultCount={entries.length} />

      {featuredEntry ? (
        <>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }} className="sketchbook-border" style={{ background: '#ffffff', border: `3.5px solid ${category.border}`, borderBottom: `10px solid ${category.border}`, borderRadius: '28px', padding: isMobile ? '18px 16px' : '20px 22px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) auto', gap: '18px', alignItems: 'center' }}>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {renderBadge('Featured article', category.border, category.border, category.surface, category.accent)}
              </div>
              <h3 style={{ margin: 0, fontFamily: '"Sniglet", "Coming Soon", cursive', color: '#0f172a', fontSize: isMobile ? '1.28rem' : '1.48rem', lineHeight: 1.12, fontWeight: '400' }}>
                {featuredEntry.title}
              </h3>
              <p style={{ margin: 0, color: '#475569', fontFamily: 'var(--font-main)', fontWeight: '700', fontSize: isMobile ? '0.84rem' : '0.9rem', lineHeight: 1.52 }}>
                {featuredEntry.description}
              </p>
            </div>
            <motion.button type="button" onClick={() => onSelectEntry(featuredEntry.id)} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.94, y: 4 }} style={articleButtonStyle(category.border, category.accent, category.surface, isMobile)}>
              {t.openEntry}
            </motion.button>
          </motion.div>

          <div style={{ display: 'grid', gap: '14px' }}>
            {remainingEntries.map((entry, index) => (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 20, rotate: index % 2 === 0 ? -0.5 : 0.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.05 * (index + 1) }} whileHover={{ y: -4, scale: 1.005 }} className="sketchbook-border" style={{ background: '#ffffff', border: `3px solid ${category.border}`, borderBottom: `8px solid ${category.border}`, borderRadius: '24px', padding: isMobile ? '16px' : '18px 20px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '56px minmax(0, 1fr) auto', gap: '14px', alignItems: 'start', boxShadow: '0 10px 18px rgba(15,23,42,0.05)' }}>
                <div style={{ width: '56px', minWidth: '56px', height: '56px', borderRadius: '18px', border: `3px solid ${category.border}`, borderBottom: `7px solid ${category.border}`, background: category.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: category.accent, fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: '0.92rem', fontWeight: '400' }}>
                  {String(index + 2).padStart(2, '0')}
                </div>
                <div style={{ display: 'grid', gap: '8px', minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontFamily: '"Sniglet", "Coming Soon", cursive', color: '#0f172a', fontSize: isMobile ? '1.08rem' : '1.22rem', lineHeight: 1.16, fontWeight: '400' }}>
                    {entry.title}
                  </h3>
                  <p style={{ margin: 0, color: '#475569', fontFamily: 'var(--font-main)', fontWeight: '700', fontSize: isMobile ? '0.82rem' : '0.86rem', lineHeight: 1.48 }}>
                    {entry.description}
                  </p>
                </div>
                <motion.button type="button" onClick={() => onSelectEntry(entry.id)} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.94, y: 4 }} style={articleButtonStyle(category.border, category.accent, category.surface, isMobile)}>
                  {t.openEntry}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="sketchbook-border" style={{ background: '#ffffff', border: '3px dashed #cbd5e1', borderBottom: '8px solid #cbd5e1', borderRadius: '24px', padding: isMobile ? '22px 18px' : '28px 30px', textAlign: 'center', color: '#64748b', fontFamily: 'var(--font-main)', fontWeight: '800', lineHeight: 1.5 }}>
          {t.noResults}
        </div>
      )}
    </div>
  );
};

export default WikiCategoryView;
