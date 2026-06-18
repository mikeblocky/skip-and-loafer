import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import PaperPageHeader from '../../components/shared/paper/PaperPageHeader';
import PaperHeadingBadge from '../../components/shared/paper/PaperHeadingBadge';
import WikiSearchBar from './WikiSearchBar';
import { statPillStyle, renderBadge, articleButtonStyle, getCategoryIcon } from './wikiStyleFns';

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
          <span style={statPillStyle('#93c5fd', '#2563eb', '#1d4ed8', isMobile)}>{categories.length} {t.categoriesLabel.toLowerCase()}</span>
          <span style={statPillStyle('#fbbf24', '#f59e0b', '#b45309', isMobile)}>{totalEntries} {t.entriesLabel.toLowerCase()}</span>
        </div>
      )}
      center={(
        <PaperHeadingBadge isMobile={isMobile} icon={BookOpen} title={t.header} palette={{ borderColor: '#0ea5e9', bottomColor: '#0284c7', shadow: '0 8px 18px rgba(14, 165, 233, 0.12)' }} titleColor="#0284c7" iconColor="#0284c7" />
      )}
      rightSlot={<span style={statPillStyle('#a7f3d0', '#34d399', '#047857', isMobile)}>{t.browseLabel}</span>}
      paddingMobile="0" paddingDesktop="0" marginBottomMobile="0" marginBottomDesktop="0"
    />

    <motion.div initial={{ opacity: 0, y: 18, rotate: -0.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} className="sketchbook-border" style={{ background: '#ffffff', border: '3.5px solid #93c5fd', borderBottom: '10px solid #60a5fa', borderRadius: '30px', padding: isMobile ? '20px 18px' : '26px 28px', boxShadow: '0 16px 34px rgba(15,23,42,0.08)', display: 'grid', gap: '14px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {renderBadge(t.categoriesLabel, '#93c5fd', '#60a5fa', '#ffffff', '#1d4ed8')}
      </div>
      <h2 style={{ margin: 0, fontFamily: '"Sniglet", "Coming Soon", cursive', color: '#0f172a', fontSize: isMobile ? '1.6rem' : '2.1rem', fontWeight: '400', lineHeight: 1.08 }}>
        World notes, cast pages, and story background
      </h2>
      <p style={{ margin: 0, color: '#475569', fontFamily: 'var(--font-main)', fontSize: isMobile ? '0.92rem' : '0.98rem', fontWeight: '700', lineHeight: 1.58, maxWidth: '72ch' }}>
        {t.rootIntro}
      </p>
    </motion.div>

    <WikiSearchBar isMobile={isMobile} t={t} searchTerm={searchTerm} onSearchChange={onSearchChange} resultCount={searchTerm ? globalSearchResults.length : totalEntries} />

    {searchTerm ? (
      globalSearchResults.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
          {globalSearchResults.map((entry, index) => (
            <motion.div key={`${entry.categoryId}:${entry.id}`} initial={{ opacity: 0, y: 18, rotate: index % 2 === 0 ? -0.4 : 0.4 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 18, delay: index * 0.03 }} className="sketchbook-border" style={{ background: '#ffffff', border: `3px solid ${entry.categoryBorder}`, borderBottom: `9px solid ${entry.categoryBorder}`, borderRadius: '24px', padding: isMobile ? '18px 16px' : '20px 20px 18px', display: 'grid', gap: '14px', boxShadow: '0 10px 18px rgba(15,23,42,0.06)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
                {renderBadge(entry.categoryTitle, entry.categoryBorder, entry.categoryBorder, entry.categorySurface, entry.categoryAccent)}
                {entry.tags?.[0] ? renderBadge(entry.tags[0], '#dbeafe', '#93c5fd', '#eff6ff', '#1d4ed8') : null}
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <h3 style={{ margin: 0, fontFamily: '"Sniglet", "Coming Soon", cursive', color: '#0f172a', fontSize: isMobile ? '1.18rem' : '1.32rem', fontWeight: '400', lineHeight: 1.12 }}>{entry.title}</h3>
                <p style={{ margin: 0, color: '#475569', fontFamily: 'var(--font-main)', fontWeight: '700', fontSize: isMobile ? '0.84rem' : '0.9rem', lineHeight: 1.55 }}>{entry.description}</p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <button type="button" onClick={() => onSelectEntry(entry.categoryId, entry.id)} style={articleButtonStyle(entry.categoryBorder, entry.categoryAccent, entry.categorySurface, isMobile)}>{t.openEntry}</button>
                <button type="button" onClick={() => onSelectCategory(entry.categoryId)} style={articleButtonStyle('#dbeafe', '#1d4ed8', '#eff6ff', isMobile)}>{t.openCategory}</button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="sketchbook-border" style={{ background: '#ffffff', border: '3px dashed #cbd5e1', borderBottom: '8px solid #cbd5e1', borderRadius: '24px', padding: isMobile ? '22px 18px' : '28px 30px', textAlign: 'center', color: '#64748b', fontFamily: 'var(--font-main)', fontWeight: '800', lineHeight: 1.5 }}>{t.noResults}</div>
      )
    ) : categories.length > 0 ? (
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
        {categories.map((category, index) => {
          const Icon = getCategoryIcon(category.id);
          return (
            <motion.button key={category.id} type="button" onClick={() => onSelectCategory(category.id)} whileHover={{ y: -6, scale: 1.01 }} whileTap={{ scale: 0.98, y: 2 }} className="sketchbook-border" style={{ textAlign: 'left', background: '#ffffff', border: `3px solid ${category.border}`, borderBottom: `9px solid ${category.border}`, borderRadius: '26px', padding: isMobile ? '18px 16px' : '20px 20px 18px', boxShadow: '0 12px 24px rgba(15,23,42,0.06)', display: 'grid', gap: '14px', cursor: 'pointer' }} initial={{ opacity: 0, y: 24, rotate: index % 2 === 0 ? -0.5 : 0.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 18, delay: index * 0.06 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: category.surface, border: `3px solid ${category.border}`, borderBottom: `7px solid ${category.border}`, color: category.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `inset 0 0 0 1px ${category.border}22` }}>
                  <Icon size={24} strokeWidth={2.6} />
                </div>
                {renderBadge(`${category.entries.length} ${t.entriesLabel.toLowerCase()}`, category.border, category.border, category.surface, category.accent)}
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <h3 style={{ margin: 0, fontFamily: '"Sniglet", "Coming Soon", cursive', color: '#0f172a', fontSize: isMobile ? '1.18rem' : '1.28rem', fontWeight: '400', lineHeight: 1.15 }}>{category.title}</h3>
                <p style={{ margin: 0, color: '#475569', fontFamily: 'var(--font-main)', fontWeight: '700', fontSize: isMobile ? '0.84rem' : '0.88rem', lineHeight: 1.5 }}>{category.description}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: category.accent, fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: '0.96rem', fontWeight: '400', lineHeight: 1 }}>{t.openCategory}</span>
                <ArrowRight size={18} strokeWidth={2.8} color={category.accent} />
              </div>
            </motion.button>
          );
        })}
      </div>
    ) : (
      <div className="sketchbook-border" style={{ background: '#ffffff', border: '3px dashed #cbd5e1', borderBottom: '8px solid #cbd5e1', borderRadius: '24px', padding: isMobile ? '22px 18px' : '28px 30px', textAlign: 'center', color: '#64748b', fontFamily: 'var(--font-main)', fontWeight: '800', lineHeight: 1.5 }}>{t.noResults}</div>
    )}
  </div>
);

export default WikiRootView;
