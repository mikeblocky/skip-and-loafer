import { motion } from 'framer-motion';
import { ArrowUpDown, Newspaper } from 'lucide-react';
import { UI_TEXT } from './blogShared';
import PaperPageHeader from '../../components/shared/paper/PaperPageHeader';
import PaperHeadingBadge from '../../components/shared/paper/PaperHeadingBadge';

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
  // Hide the page header and badge completely inside the blog reader to save maximum screen space
  if (hasSelectedBlog) {
    return null;
  }

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
    boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)',
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
    <PaperPageHeader
      isMobile={isMobile}
      leftSlot={(
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0, x: isMobile ? 0 : -20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            style={{ ...pillStyle, ...postsPillPalette }}
          >
            {totalPosts} {(t.postsLabel || 'Posts').toLowerCase()}
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
      center={(
        <PaperHeadingBadge
          isMobile={isMobile}
          icon={Newspaper}
          title={title}
          palette={{
            borderColor: '#f97316',
            bottomColor: '#f97316',
            shadow: '0 8px 18px rgba(249, 115, 22, 0.1)',
          }}
          titleColor="#f97316"
          iconColor="#f97316"
        />
      )}
      rightSlot={(
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.94, y: 6 }}
          onClick={onToggleSortOrder}
          style={{
            ...pillStyle,
            ...sortButtonStyle,
            margin: 0,
            cursor: 'pointer',
          }}
        >
          <ArrowUpDown size={18} strokeWidth={2.5} />
          {sortOrder === 'asc'
            ? (sortOldToNewLabel || UI_TEXT.en.sortOldToNew)
            : (sortNewToOldLabel || UI_TEXT.en.sortNewToOld)}
        </motion.button>
      )}
      gapMobile="14px"
      paddingMobile="0"
      paddingDesktop="0"
      marginBottomMobile="20px"
      marginBottomDesktop="24px"
    />
  );
};

export default BlogPageHeader;
