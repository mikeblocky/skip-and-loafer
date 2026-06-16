import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CalendarDays, Zap } from 'lucide-react';
import { UI_TEXT, NOTE_PALETTES, formatDate, formatReadMinutes } from './blogShared';

const statCardStyle = (background, border, bottom, text) => ({
  background,
  border: `3px solid ${border}`,
  borderBottom: `8px solid ${bottom}`,
  borderRadius: '20px',
  padding: '14px 16px',
  display: 'grid',
  gap: '8px',
  color: text,
});

const BlogListView = ({
  blogs,
  isMobile,
  t,
  locale,
  bodyFontScale,
  readerPrefs,
  sortOrder,
  onSelectBlog,
}) => {
  if (blogs.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 0',
          background: 'var(--themed-card-bg, #f8fafc)',
          borderRadius: '24px',
          border: '3px dashed var(--themed-card-border, #cbd5e1)',
          color: 'var(--themed-text-muted, #94a3b8)',
          fontFamily: 'var(--font-main)',
          fontWeight: '900',
        }}
      >
        {t.noBlogs}
      </div>
    );
  }

  const featuredBlog = blogs[0];
  const remainingBlogs = blogs.slice(1);
  const totalMinutes = blogs.reduce((sum, blog) => sum + (blog.readMinutes || 0), 0);
  const latestPreview = featuredBlog.description || t.empty || UI_TEXT.en.empty;
  const latestReadMinutes = featuredBlog.readMinutes || 1;

  return (
    <div style={{ display: 'grid', gap: isMobile ? '18px' : '22px' }}>
      <motion.div
        initial={{ opacity: 0, y: 18, rotate: -0.8 }}
        animate={{ opacity: 1, y: 0, rotate: -0.2 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
        className="sketchbook-border"
        style={{
          background: 'var(--themed-card-bg, #fff7ed)',
          border: '3.5px solid var(--themed-card-border, #fdba74)',
          borderBottom: '10px solid var(--themed-card-border, #f97316)',
          borderRadius: '30px',
          padding: isMobile ? '20px 18px' : '26px 28px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) auto',
          gap: '24px',
          boxShadow: '0 16px 34px rgba(249, 115, 22, 0.12)',
        }}
      >
        <div style={{ display: 'grid', gap: '14px', minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
            <span
              className="sketchbook-border"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--themed-badge-bg, #ffffff)',
                border: '3px solid var(--themed-badge-border, #fdba74)',
                borderBottom: '7px solid var(--themed-badge-border, #fb923c)',
                borderRadius: '999px',
                padding: '8px 12px',
                fontFamily: 'Sniglet, var(--font-main)',
                fontSize: '0.94rem',
                lineHeight: 1,
                color: 'var(--themed-text-secondary, #c2410c)',
                fontWeight: '400',
              }}
            >
              <Zap size={16} strokeWidth={2.4} fill="#fb923c30" />
              {sortOrder === 'asc' ? t.oldestLabel : t.latestLabel}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-main)',
                color: 'var(--themed-text-muted, #9a3412)',
                fontSize: '0.88rem',
                lineHeight: 1.3,
                fontWeight: '400',
              }}
            >
              {formatDate(featuredBlog.date, locale)}
            </span>
          </div>

          <h2
            style={{
              margin: 0,
              fontFamily: 'Sniglet, var(--font-main)',
              color: 'var(--themed-text-primary, #7c2d12)',
              fontSize: isMobile ? '1.7rem' : '2.35rem',
              lineHeight: 1.08,
              fontWeight: '400',
            }}
          >
            {featuredBlog.title}
          </h2>

          <p
            style={{
              margin: 0,
              color: 'var(--themed-text-secondary, #7c5f3a)',
              fontFamily: 'var(--font-hand)',
              fontWeight: '400',
              fontSize: isMobile ? `${0.92 * bodyFontScale}rem` : `${0.98 * bodyFontScale}rem`,
              lineHeight: readerPrefs.wideSpacing ? 1.72 : 1.55,
              maxWidth: '66ch',
            }}
          >
            {latestPreview || t.empty || UI_TEXT.en.empty}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <span
              className="sketchbook-border"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                border: '2.5px solid #fed7aa',
                borderBottom: '6px solid #fb923c',
                borderRadius: '999px',
                padding: '7px 11px',
                color: '#c2410c',
                fontFamily: 'var(--font-main)',
                fontSize: '0.84rem',
                lineHeight: 1,
                fontWeight: '400',
              }}
            >
              <CalendarDays size={14} strokeWidth={2.8} />
              {formatDate(featuredBlog.date, locale)}
            </span>
            <span
              className="sketchbook-border"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                border: '2.5px solid #fed7aa',
                borderBottom: '6px solid #fb923c',
                borderRadius: '999px',
                padding: '7px 11px',
                color: '#c2410c',
                fontFamily: 'var(--font-main)',
                fontSize: '0.84rem',
                lineHeight: 1,
                fontWeight: '400',
              }}
            >
              <BookOpen size={14} strokeWidth={2.8} />
              {formatReadMinutes(latestReadMinutes, t)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'end' }}>
          <motion.button
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.94, y: 6 }}
            onClick={() => onSelectBlog(featuredBlog.id)}
            className="sketchbook-border paper-interact"
            style={{
              width: isMobile ? '100%' : 'auto',
              minWidth: isMobile ? 'unset' : '160px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: '#f97316',
              border: '3.5px solid #c2410c',
              borderBottom: '9px solid #9a3412',
              borderRadius: '24px',
              padding: isMobile ? '14px 16px' : '16px 24px',
              color: '#ffffff',
              fontFamily: 'Sniglet, var(--font-main)',
              fontSize: isMobile ? '1.04rem' : '1.12rem',
              lineHeight: 1,
              fontWeight: '400',
              cursor: 'pointer',
              boxShadow: '0 14px 24px rgba(249, 115, 22, 0.2)',
            }}
          >
            {t.readPost}
            <ArrowRight size={18} strokeWidth={2.8} />
          </motion.button>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gap: '16px' }}>
          {remainingBlogs.map((blog, index) => {
            const note = NOTE_PALETTES[(index + 1) % NOTE_PALETTES.length];
            const preview = blog.description || t.empty || UI_TEXT.en.empty;
            const readMinutes = blog.readMinutes || 1;

            return (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20, rotate: index % 2 === 0 ? -0.6 : 0.6 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.05 * (index + 1) }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="sketchbook-border"
                style={{
                  background: 'var(--themed-card-bg, #ffffff)',
                  border: `3px solid var(--themed-card-border, ${note.border})`,
                  borderBottom: `9px solid var(--themed-card-border, ${note.border})`,
                  borderRadius: '26px',
                  padding: isMobile ? '18px 16px' : '20px 22px',
                  boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'auto minmax(0, 1fr) auto',
                  gap: '14px',
                  alignItems: 'start',
                }}
              >
                <div
                  className="sketchbook-border"
                  style={{
                    width: isMobile ? 'fit-content' : '56px',
                    minWidth: '56px',
                    background: `var(--themed-badge-bg, ${note.bg})`,
                    border: `3px solid var(--themed-badge-border, ${note.border})`,
                    borderBottom: `7px solid var(--themed-badge-border, ${note.border})`,
                    borderRadius: '20px',
                    padding: '10px 12px',
                    display: 'grid',
                    gap: '4px',
                    justifyItems: 'center',
                  }}
                >
                  <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: `var(--themed-text-secondary, ${note.accent})`, fontSize: '0.8rem', lineHeight: 1, fontWeight: '400' }}>
                    {String(index + 2).padStart(2, '0')}
                  </span>
                </div>

                <div style={{ minWidth: 0, display: 'grid', gap: '10px' }}>
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: 'Sniglet, var(--font-main)',
                      color: 'var(--themed-text-primary, #1e293b)',
                      fontSize: isMobile ? '1.12rem' : '1.28rem',
                      lineHeight: 1.18,
                      fontWeight: '400',
                    }}
                  >
                    {blog.title}
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span
                      className="sketchbook-border"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: `var(--themed-badge-bg, ${note.bg})`,
                        border: `2.5px solid var(--themed-badge-border, ${note.border})`,
                        borderBottom: `6px solid var(--themed-badge-border, ${note.border})`,
                        borderRadius: '999px',
                        padding: '6px 10px',
                        color: `var(--themed-text-secondary, ${note.accent})`,
                        fontFamily: 'var(--font-main)',
                        fontSize: '0.8rem',
                        lineHeight: 1,
                        fontWeight: '400',
                      }}
                    >
                      <CalendarDays size={13} strokeWidth={2.8} />
                      {formatDate(blog.date, locale)}
                    </span>
                    <span
                      className="sketchbook-border"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: `var(--themed-badge-bg, ${note.bg})`,
                        border: `2.5px solid var(--themed-badge-border, ${note.border})`,
                        borderBottom: `6px solid var(--themed-badge-border, ${note.border})`,
                        borderRadius: '999px',
                        padding: '6px 10px',
                        color: `var(--themed-text-secondary, ${note.accent})`,
                        fontFamily: 'var(--font-main)',
                        fontSize: '0.8rem',
                        lineHeight: 1,
                        fontWeight: '400',
                      }}
                    >
                      <BookOpen size={13} strokeWidth={2.8} />
                      {formatReadMinutes(readMinutes, t)}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      color: 'var(--themed-text-muted, #475569)',
                      fontFamily: 'var(--font-hand)',
                      fontWeight: '400',
                      fontSize: isMobile ? `${0.82 * bodyFontScale}rem` : `${0.86 * bodyFontScale}rem`,
                      lineHeight: readerPrefs.wideSpacing ? 1.68 : 1.48,
                    }}
                  >
                    {preview || t.empty || UI_TEXT.en.empty}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.94, y: 4 }}
                  onClick={() => onSelectBlog(blog.id)}
                  className="sketchbook-border paper-interact"
                  style={{
                    alignSelf: isMobile ? 'stretch' : 'center',
                    justifySelf: isMobile ? 'stretch' : 'end',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: `3px solid var(--themed-card-border, ${note.border})`,
                    borderBottom: `7px solid var(--themed-card-border, ${note.border})`,
                    background: `var(--themed-card-bg, ${note.bg})`,
                    borderRadius: '18px',
                    color: `var(--themed-text-secondary, ${note.accent})`,
                    fontFamily: 'Sniglet, var(--font-main)',
                    fontSize: '0.98rem',
                    lineHeight: 1,
                    fontWeight: '400',
                    padding: isMobile ? '12px 14px' : '12px 16px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.readPost}
                </motion.button>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
};

export default memo(BlogListView);
