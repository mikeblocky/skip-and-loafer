import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Images, Info, Quote, Sparkles } from 'lucide-react';
import { WikiSectionTables } from './WikiTable';
import { WikiHighlightsPanel, WikiRelationshipPanel } from './WikiDetailPanels';
import { backButtonStyle, renderBadge, articleButtonStyle, sectionCardStyle, subsectionCardStyle } from './wikiStyleFns';
import { getSectionContents, getAnchorId, getEntryVersions, scrollToSection } from './wikiHelpers';

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

      <motion.div initial={{ opacity: 0, y: 18, rotate: -0.4 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} className="sketchbook-border" style={{ background: '#ffffff', border: `3.5px solid ${category.border}`, borderBottom: `10px solid ${category.border}`, borderRadius: '30px', padding: isMobile ? '20px 18px' : '24px 26px', display: 'grid', gap: '14px', boxShadow: '0 16px 30px rgba(15,23,42,0.08)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {renderBadge(entry.infobox?.subtitle || category.title, category.border, category.border, category.surface, category.accent)}
        </div>
        <div style={{ display: 'grid', gap: '10px' }}>
          <h1 style={{ margin: 0, fontFamily: '"Sniglet", "Coming Soon", cursive', color: '#0f172a', fontSize: isMobile ? '1.8rem' : '2.35rem', fontWeight: '400', lineHeight: 1.05 }}>
            {entry.title}
          </h1>
          <p style={{ margin: 0, color: '#475569', fontFamily: 'var(--font-main)', fontWeight: '700', fontSize: isMobile ? '0.96rem' : '1rem', lineHeight: 1.62, maxWidth: '76ch' }}>
            {entry.lead}
          </p>
        </div>
      </motion.div>

      {entry.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {entry.tags.map((tag) => renderBadge(tag, '#dbeafe', '#93c5fd', '#eff6ff', '#1d4ed8'))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 320px', gap: isMobile ? '18px' : '22px', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: '16px', order: isMobile ? 2 : 1 }}>
          <div className="sketchbook-border" style={{ background: '#ffffff', border: '3px solid #dbeafe', borderBottom: '8px solid #93c5fd', borderRadius: '24px', padding: isMobile ? '16px' : '18px 20px', display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8' }}>
              <Info size={18} strokeWidth={2.6} />
              <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: '1rem' }}>{t.sectionContents}</span>
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {sectionIds.map((section) => (
                <button key={section.id} type="button" onClick={() => scrollToSection(section.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: section.level === 1 ? '18px' : '0', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: section.level === 1 ? '#475569' : '#334155', fontFamily: 'var(--font-main)', fontWeight: '800', fontSize: section.level === 1 ? (isMobile ? '0.82rem' : '0.86rem') : (isMobile ? '0.86rem' : '0.9rem'), lineHeight: 1.35 }}>
                  <span style={{ minWidth: '30px', height: '30px', borderRadius: '10px', border: section.level === 1 ? '2px solid #dbeafe' : '2px solid #bfdbfe', borderBottom: section.level === 1 ? '4px solid #cbd5e1' : '4px solid #93c5fd', background: section.level === 1 ? '#f8fafc' : '#eff6ff', color: section.level === 1 ? '#475569' : '#1d4ed8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: '0.78rem' }}>
                    {section.number}
                  </span>
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          </div>

          {displaySections.map((section, index) => (
            <motion.section key={section.title} id={getAnchorId(section.title)} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 * index }} className="sketchbook-border" style={{ ...sectionCardStyle(isMobile), scrollMarginTop: '22px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                {renderBadge(`${t.sectionLabel} ${index + 1}`, '#cbd5e1', '#94a3b8', '#f8fafc', '#334155')}
              </div>
              <h2 style={{ margin: 0, fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: isMobile ? '1.28rem' : '1.46rem', color: '#0f172a', fontWeight: '400', lineHeight: 1.12 }}>
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} style={{ margin: 0, color: '#334155', fontFamily: 'var(--font-main)', fontWeight: '700', fontSize: isMobile ? '0.9rem' : '0.94rem', lineHeight: 1.7 }}>
                  {paragraph}
                </p>
              ))}
              <WikiSectionTables isMobile={isMobile} tables={section.tables} />
              {section.subsections?.map((subsection, subsectionIndex) => (
                <div key={`${section.title}-${subsection.title}-${subsectionIndex}`} className="sketchbook-border" id={getAnchorId(`${section.title}-${subsection.title}`)} style={{ ...subsectionCardStyle(isMobile), scrollMarginTop: '22px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                    {renderBadge(`${t.subsectionLabel} ${index + 1}.${subsectionIndex + 1}`, '#bfdbfe', '#60a5fa', '#eff6ff', '#1d4ed8')}
                  </div>
                  <h3 style={{ margin: 0, fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: isMobile ? '1.08rem' : '1.18rem', color: '#1d4ed8', fontWeight: '400', lineHeight: 1.18 }}>
                    {subsection.title}
                  </h3>
                  {subsection.paragraphs.map((paragraph) => (
                    <p key={`${subsection.title}-${paragraph}`} style={{ margin: 0, color: '#334155', fontFamily: 'var(--font-main)', fontWeight: '700', fontSize: isMobile ? '0.88rem' : '0.92rem', lineHeight: 1.68 }}>
                      {paragraph}
                    </p>
                  ))}
                  <WikiSectionTables isMobile={isMobile} tables={subsection.tables} />
                </div>
              ))}
            </motion.section>
          ))}

          <WikiHighlightsPanel isMobile={isMobile} t={t} entry={entry} />
          <WikiRelationshipPanel isMobile={isMobile} t={t} category={category} entry={entry} />

          {entry.related?.length > 0 && (
            <div className="sketchbook-border" style={{ background: '#ffffff', border: '3px solid #fde68a', borderBottom: '8px solid #fbbf24', borderRadius: '24px', padding: isMobile ? '18px 16px' : '20px 22px', display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309' }}>
                <Sparkles size={18} strokeWidth={2.6} />
                <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: '1rem' }}>{t.relatedArticles}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {entry.related.map((related) => (
                  <motion.button key={`${related.categoryId}:${related.entryId}`} type="button" onClick={() => onSelectRelated(related.categoryId, related.entryId)} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.96, y: 2 }} style={{ ...articleButtonStyle('#fde68a', '#92400e', '#fffbeb', isMobile), padding: '10px 14px' }}>
                    {related.label}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {entry.quote && (
            <div className="sketchbook-border" style={{ background: '#ffffff', border: '3px solid #c4b5fd', borderBottom: '8px solid #8b5cf6', borderRadius: '24px', padding: isMobile ? '18px 16px' : '20px 22px', display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6d28d9' }}>
                <Quote size={18} strokeWidth={2.6} />
                <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: '1rem' }}>{t.quoteLabel}</span>
              </div>
              <blockquote style={{ margin: 0, color: '#334155', fontFamily: 'var(--font-main)', fontWeight: '800', fontSize: isMobile ? '0.96rem' : '1rem', lineHeight: 1.7 }}>
                "{entry.quote.text}"
              </blockquote>
              <p style={{ margin: 0, color: '#6d28d9', fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: '0.9rem' }}>
                {entry.quote.author}
              </p>
            </div>
          )}

          {galleryItems.length > 0 && (
            <div className="sketchbook-border" style={{ background: '#ffffff', border: '3px solid #a7f3d0', borderBottom: '8px solid #34d399', borderRadius: '24px', padding: isMobile ? '18px 16px' : '20px 22px', display: 'grid', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857' }}>
                  <Images size={18} strokeWidth={2.6} />
                  <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: '1rem' }}>{entry.galleryTitle || t.galleryLabel}</span>
                </div>
                {renderBadge(`${galleryItems.length} images`, '#a7f3d0', '#34d399', '#ecfdf5', '#047857')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
                {galleryItems.map((imageSrc, index) => (
                  <motion.button key={imageSrc} type="button" onClick={() => onOpenGallery(galleryItems, imageSrc, `${entry.title} gallery image ${index + 1}`)} whileHover={{ y: -4, scale: 1.01 }} whileTap={{ scale: 0.97, y: 1 }} className="sketchbook-border" style={{ padding: 0, overflow: 'hidden', background: '#ffffff', border: '3px solid #bbf7d0', borderBottom: '7px solid #86efac', borderRadius: '18px', cursor: 'pointer' }}>
                    <img src={imageSrc} alt={`${entry.title} gallery image ${index + 1}`} style={{ display: 'block', width: '100%', height: isMobile ? '118px' : '138px', objectFit: 'cover', objectPosition: 'center' }} />
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="sketchbook-border" style={{ background: '#ffffff', border: `3px solid ${category.border}`, borderBottom: `10px solid ${category.border}`, borderRadius: '26px', padding: isMobile ? '16px' : '18px', display: 'grid', gap: '14px', position: isMobile ? 'relative' : 'sticky', top: isMobile ? 'auto' : '22px', boxShadow: '0 12px 24px rgba(15,23,42,0.08)', order: isMobile ? 1 : 2 }}>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ borderRadius: '20px', overflow: 'hidden', border: `3px solid ${category.border}`, borderBottom: `8px solid ${category.border}`, background: category.surface }}>
              <img src={activeVersion?.src || entry.image} alt={entry.title} style={{ display: 'block', width: '100%', height: isMobile ? '240px' : '280px', objectFit: 'cover', objectPosition: 'center top', background: category.surface }} />
            </div>
            <div style={{ display: 'grid', gap: '6px' }}>
              <h3 style={{ margin: 0, fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: isMobile ? '1.14rem' : '1.2rem', lineHeight: 1.12, color: '#0f172a', textAlign: 'center' }}>
                {entry.infobox?.title || entry.title}
              </h3>
              {entry.infobox?.subtitle && (
                <p style={{ margin: 0, textAlign: 'center', color: category.accent, fontFamily: 'var(--font-main)', fontWeight: '800', fontSize: '0.84rem', lineHeight: 1.35 }}>
                  {entry.infobox.subtitle}
                </p>
              )}
              {(activeVersion?.caption || entry.infobox?.caption) && (
                <p style={{ margin: 0, color: '#64748b', fontFamily: 'var(--font-main)', fontWeight: '700', fontSize: '0.76rem', lineHeight: 1.45, textAlign: 'center' }}>
                  {activeVersion?.caption || entry.infobox.caption}
                </p>
              )}
            </div>
          </div>

          {versions.length > 1 && (
            <div className="sketchbook-border" style={{ background: '#f8fafc', border: '2.5px solid #dbeafe', borderBottom: '7px solid #93c5fd', borderRadius: '20px', padding: '14px', display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8' }}>
                <Images size={16} strokeWidth={2.6} />
                <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: '0.98rem' }}>{t.versionsLabel}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {versions.map((version, index) => {
                  const isActive = version.src === (activeVersion?.src || '');
                  return (
                    <button key={version.id || version.src} type="button" onClick={() => setActiveVersionSrc(version.src)} style={{ ...articleButtonStyle(isActive ? category.border : '#dbeafe', isActive ? category.accent : '#1d4ed8', isActive ? category.surface : '#eff6ff', isMobile), padding: '10px 12px' }}>
                      {version.label || `${t.versionLabel} ${index + 1}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ borderRadius: '20px', overflow: 'hidden', border: '2.5px solid #e2e8f0', borderBottom: '7px solid #cbd5e1', background: '#f8fafc' }}>
            {infoboxFacts.map((fact, index) => (
              <div key={`${fact.label}-${fact.value}`} style={{ display: 'grid', gridTemplateColumns: '108px minmax(0, 1fr)', gap: '10px', padding: '12px 14px', borderTop: index === 0 ? 'none' : '1px solid #dbeafe', alignItems: 'start' }}>
                <div style={{ color: '#1d4ed8', fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: '0.86rem', lineHeight: 1.2 }}>
                  {fact.label}
                </div>
                <div style={{ color: '#334155', fontFamily: 'var(--font-main)', fontWeight: '800', fontSize: '0.82rem', lineHeight: 1.45, minWidth: 0 }}>
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

export default WikiDetailView;
