import { motion } from 'framer-motion';
import { ArrowUpDown, Newspaper } from 'lucide-react';
import { UI_TEXT } from './blogShared';
import { getHeaderRowStyle, getSortButtonStyle } from './blogStyles';

const BlogPageHeader = ({
  isMobile,
  hasSelectedBlog,
  title,
  totalPosts,
  totalMinutes,
  t,
  sortOrder,
  onToggleSortOrder,
  sortOldToNewLabel,
  sortNewToOldLabel,
}) => {
  const pillStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 22px',
    minWidth: '112px',
    minHeight: '54px',
    background: '#ffffff',
    borderRadius: '999px',
    fontFamily: '"Sniglet", "Coming Soon", cursive',
    fontSize: isMobile ? '0.94rem' : '1.1rem',
    fontWeight: '400',
    lineHeight: 1,
    boxShadow: '0 10px 20px rgba(15, 23, 42, 0.1)',
  };

  const statsPillPalette = {
    border: '3px solid #93c5fd',
    borderBottom: '8.5px solid #2563eb',
    color: '#1d4ed8',
  };

  const mainPillPalette = {
    border: '3.5px solid #f97316',
    borderBottom: '9.5px solid #f97316',
    color: '#f97316',
    padding: '10px 24px',
    borderRadius: '24px',
    gap: '12px',
    boxShadow: '0 8px 18px rgba(249, 115, 22, 0.12)',
  };

  const sortButtonStyle = {
    border: '3px solid #f97316',
    borderBottom: '8px solid #f97316',
    background: '#ffffff',
    color: '#f97316',
    borderRadius: '16px',
    padding: '15px 26px',
    minHeight: '54px',
    fontSize: '1.1rem',
    gap: '10px',
    boxShadow: '0 10px 20px rgba(249, 115, 22, 0.1)',
  };

  const postsPillPalette = {
    border: '3px solid #fbbf24',
    borderBottom: '8.5px solid #f59e0b',
    color: '#92400e',
  };

  const minutesPillPalette = {
    border: '3px solid #93c5fd',
    borderBottom: '8.5px solid #2563eb',
    color: '#1d4ed8',
  };

  return (
    <div
      style={{
        ...getHeaderRowStyle(isMobile),
        marginBottom: isMobile ? '28px' : '32px',
        position: 'relative',
        display: isMobile ? 'flex' : (!hasSelectedBlog ? 'grid' : 'flex'),
        gridTemplateColumns: !isMobile && !hasSelectedBlog ? '1fr auto 1fr' : undefined,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: isMobile && !hasSelectedBlog ? 'column' : 'row',
        gap: isMobile && !hasSelectedBlog ? '20px' : 0,
        width: '100%',
      }}
    >
      {!hasSelectedBlog && (
        <div 
          style={{ 
            gridColumn: !isMobile ? 1 : 'auto', 
            justifySelf: !isMobile ? 'start' : 'center',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            order: isMobile ? 2 : 1,
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, x: isMobile ? 0 : -20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            style={{ ...pillStyle, ...postsPillPalette }}
          >
            {totalPosts} { (t.postsLabel || 'Posts').toLowerCase() }
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0, x: isMobile ? 0 : -10 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            style={{ ...pillStyle, ...minutesPillPalette }}
          >
            {totalMinutes} {t.minuteUnit || 'min'}
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          ...pillStyle,
          ...mainPillPalette,
          fontSize: isMobile ? '1.45rem' : '1.35rem',
          letterSpacing: '0.2px',
          zIndex: 1,
          gridColumn: !isMobile && !hasSelectedBlog ? 2 : 'auto',
          order: isMobile ? 1 : 2,
        }}
      >
        <Newspaper size={isMobile ? 28 : 24} strokeWidth={2.5} style={{ color: '#f97316' }} />
        <span>{title}</span>
      </motion.div>

      {!hasSelectedBlog && (
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.94, y: 6 }}
          onClick={onToggleSortOrder}
          style={{
            ...pillStyle,
            ...sortButtonStyle,
            margin: 0,
            justifySelf: !isMobile ? 'end' : 'auto',
            gridColumn: !isMobile ? 3 : 'auto',
            order: 3,
            cursor: 'pointer',
          }}
        >
          <ArrowUpDown size={18} strokeWidth={2.5} />
          {sortOrder === 'asc'
            ? (sortOldToNewLabel || UI_TEXT.en.sortOldToNew)
            : (sortNewToOldLabel || UI_TEXT.en.sortNewToOld)}
        </motion.button>
      )}
    </div>
  );
};

export default BlogPageHeader;
