import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CalendarDays, NotebookText, Rows3 } from 'lucide-react';
import { UI_TEXT, NOTE_PALETTES, formatDate, formatReadMinutes, getPreview, getReadMinutes } from './blogShared';

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
  onSelectBlog,
}) => {
  if (blogs.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 0',
          background: '#f8fafc',
          borderRadius: '24px',
          border: '3px dashed #cbd5e1',
          color: '#94a3b8',
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
  const totalMinutes = blogs.reduce((sum, blog) => sum + getReadMinutes(blog.content), 0);
  const latestPreview = featuredBlog.description || getPreview(featuredBlog.content);
  const latestReadMinutes = getReadMinutes(featuredBlog.content);

  return (
    <div style={{ display: 'grid', gap: isMobile ? '18px' : '22px' }}>
      <motion.div
        initial={{ opacity: 0, y: 18, rotate: -0.8 }}
        animate={{ opacity: 1, y: 0, rotate: -0.2 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="sketchbook-border"
        style={{
          background: '#fff7ed',
          border: '3.5px solid #fdba74',
          borderBottom: '10px solid #f97316',
          borderRadius: '30px',
          padding: isMobile ? '20px 18px' : '26px 28px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.3fr) minmax(240px, 0.7fr)',
          gap: '18px',
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
                background: '#ffffff',
                border: '3px solid #fdba74',
                borderBottom: '7px solid #fb923c',
                borderRadius: '999px',
                padding: '8px 12px',
                fontFamily: 'Sniglet, var(--font-main)',
                fontSize: '0.94rem',
                lineHeight: 1,
                color: '#c2410c',
                fontWeight: '400',
              }}
            >
              <NotebookText size={16} strokeWidth={2.4} />
              {t.listHint || UI_TEXT.en.listHint}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-main)',
                color: '#9a3412',
                fontSize: '0.88rem',
                lineHeight: 1.3,
                fontWeight: '700',
              }}
            >
              {formatDate(featuredBlog.date, locale)}
            </span>
          </div>

          <h2
            style={{
              margin: 0,
              fontFamily: 'Sniglet, var(--font-main)',
              color: '#7c2d12',
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
              color: '#7c5f3a',
              fontFamily: 'var(--font-main)',
              fontWeight: '700',
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
                fontWeight: '800',
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
                fontWeight: '800',
              }}
            >
              <BookOpen size={14} strokeWidth={2.8} />
              {formatReadMinutes(latestReadMinutes, t)}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '12px', alignContent: 'start' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
            <div className="sketchbook-border" style={statCardStyle('#ffffff', '#fecdd3', '#f472b6', '#9d174d')}>
              <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.92rem', lineHeight: 1, fontWeight: '400' }}>
                {t.postsLabel || 'Posts'}
              </span>
              <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontSize: isMobile ? '1.55rem' : '1.7rem', lineHeight: 1, fontWeight: '400' }}>
                {blogs.length}
              </span>
            </div>
            <div className="sketchbook-border" style={statCardStyle('#ffffff', '#bfdbfe', '#60a5fa', '#1d4ed8')}>
              <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontSize: '0.92rem', lineHeight: 1, fontWeight: '400' }}>
                {t.totalLabel || 'Total time'}
              </span>
              <span style={{ fontFamily: 'Sniglet, var(--font-main)', fontSize: isMobile ? '1.55rem' : '1.7rem', lineHeight: 1, fontWeight: '400' }}>
                {totalMinutes} {t.minuteUnit || 'min'}
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.94, y: 6 }}
            onClick={() => onSelectBlog(featuredBlog.id)}
            className="sketchbook-border paper-interact"
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: '#f97316',
              border: '3.5px solid #c2410c',
              borderBottom: '9px solid #9a3412',
              borderRadius: '24px',
              padding: isMobile ? '14px 16px' : '16px 18px',
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

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.28fr) minmax(250px, 0.72fr)', gap: '18px' }}>
        <div style={{ display: 'grid', gap: '16px' }}>
          {remainingBlogs.map((blog, index) => {
            const note = NOTE_PALETTES[(index + 1) % NOTE_PALETTES.length];
            const preview = blog.description || getPreview(blog.content);
            const readMinutes = getReadMinutes(blog.content);

            return (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20, rotate: index % 2 === 0 ? -0.6 : 0.6 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.05 * (index + 1) }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="sketchbook-border"
                style={{
                  background: '#ffffff',
                  border: `3px solid ${note.border}`,
                  borderBottom: `9px solid ${note.border}`,
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
                    background: note.bg,
                    border: `3px solid ${note.border}`,
                    borderBottom: `7px solid ${note.border}`,
                    borderRadius: '20px',
                    padding: '10px 12px',
                    display: 'grid',
                    gap: '4px',
                    justifyItems: 'center',
                  }}
                >
                  <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: note.accent, fontSize: '0.8rem', lineHeight: 1, fontWeight: '400' }}>
                    {String(index + 2).padStart(2, '0')}
                  </span>
                  <Rows3 size={16} strokeWidth={2.6} color={note.accent} />
                </div>

                <div style={{ minWidth: 0, display: 'grid', gap: '10px' }}>
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: 'Sniglet, var(--font-main)',
                      color: '#1e293b',
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
                        background: note.bg,
                        border: `2.5px solid ${note.border}`,
                        borderBottom: `6px solid ${note.border}`,
                        borderRadius: '999px',
                        padding: '6px 10px',
                        color: note.accent,
                        fontFamily: 'var(--font-main)',
                        fontSize: '0.8rem',
                        lineHeight: 1,
                        fontWeight: '800',
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
                        background: note.bg,
                        border: `2.5px solid ${note.border}`,
                        borderBottom: `6px solid ${note.border}`,
                        borderRadius: '999px',
                        padding: '6px 10px',
                        color: note.accent,
                        fontFamily: 'var(--font-main)',
                        fontSize: '0.8rem',
                        lineHeight: 1,
                        fontWeight: '800',
                      }}
                    >
                      <BookOpen size={13} strokeWidth={2.8} />
                      {formatReadMinutes(readMinutes, t)}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      color: '#475569',
                      fontFamily: 'var(--font-main)',
                      fontWeight: '700',
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
                    border: `3px solid ${note.border}`,
                    borderBottom: `7px solid ${note.border}`,
                    background: note.bg,
                    borderRadius: '18px',
                    color: note.accent,
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

        <motion.div
          initial={{ opacity: 0, y: 20, rotate: 0.8 }}
          animate={{ opacity: 1, y: 0, rotate: 0.2 }}
          transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.1 }}
          className="sketchbook-border"
          style={{
            background: '#f8fbff',
            border: '3px solid #bfdbfe',
            borderBottom: '9px solid #60a5fa',
            borderRadius: '28px',
            padding: isMobile ? '18px 16px' : '20px 18px',
            boxShadow: '0 14px 24px rgba(96, 165, 250, 0.12)',
            display: 'grid',
            gap: '14px',
            alignContent: 'start',
          }}
        >
          <div style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#1d4ed8', fontSize: '1.06rem', lineHeight: 1, fontWeight: '400' }}>
              {t.header}
            </span>
            <span style={{ fontFamily: 'var(--font-main)', color: '#64748b', fontSize: '0.86rem', lineHeight: 1.45, fontWeight: '700' }}>
              {t.listHint || UI_TEXT.en.listHint}
            </span>
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {blogs.map((blog, index) => {
              const note = NOTE_PALETTES[index % NOTE_PALETTES.length];
              return (
                <button
                  key={`rail-${blog.id}`}
                  onClick={() => onSelectBlog(blog.id)}
                  className="sketchbook-border paper-interact"
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: `3px solid ${note.border}`,
                    borderBottom: `7px solid ${note.border}`,
                    borderRadius: '18px',
                    padding: '12px 14px',
                    display: 'grid',
                    gap: '6px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#1e293b', fontSize: '0.96rem', lineHeight: 1.15, fontWeight: '400' }}>
                    {blog.title}
                  </span>
                  <span style={{ fontFamily: 'var(--font-main)', color: note.accent, fontSize: '0.78rem', lineHeight: 1, fontWeight: '800' }}>
                    {formatDate(blog.date, locale)}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogListView;
