import { motion } from 'framer-motion';
import { BookOpen, CalendarDays } from 'lucide-react';
import { UI_TEXT, NOTE_PALETTES, formatDate, getPreview, getReadMinutes } from './blogShared';
import {
  EMPTY_BLOGS_STYLE,
  BLOG_CARD_TITLE_STYLE,
  BLOG_META_DOT_STYLE,
  getBlogCardStyle,
  getBlogMetaStyle,
  getReadPostButtonStyle,
} from './blogStyles';
import {
  getBlogListItemInitial,
  BLOG_LIST_ITEM_ANIMATE,
  getBlogListItemTransition,
} from './blogAnimations';
import { TAP_SCALE_DEFAULT } from '../shared/animationPresets';

const BlogListView = ({
  blogs,
  isMobile,
  t,
  locale,
  bodyFontScale,
  readerPrefs,
  onSelectBlog,
}) => (
  <>
    {blogs.length === 0 && (
      <div style={EMPTY_BLOGS_STYLE}>
        {t.noBlogs}
      </div>
    )}

    {blogs.map((blog, index) => {
      const note = NOTE_PALETTES[index % NOTE_PALETTES.length];
      const preview = blog.description || getPreview(blog.content);
      const readMinutes = getReadMinutes(blog.content);

      return (
        <motion.div
          key={blog.id}
          initial={getBlogListItemInitial(index)}
          animate={BLOG_LIST_ITEM_ANIMATE}
          transition={getBlogListItemTransition(index)}
          style={getBlogCardStyle(note, isMobile)}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px', marginBottom: '6px' }}>
              <span style={{ ...BLOG_CARD_TITLE_STYLE, fontSize: isMobile ? '0.95rem' : '1rem' }}>{blog.title}</span>
              <span style={getBlogMetaStyle(note, isMobile)}>
                <CalendarDays size={12} /> {formatDate(blog.date, locale)}
                <span style={BLOG_META_DOT_STYLE}>•</span>
                <BookOpen size={12} /> {readMinutes} {t.minutesRead}
              </span>
            </div>
            <p style={{ margin: 0, color: '#4b5563', fontFamily: 'var(--font-hand)', fontSize: isMobile ? `${0.78 * bodyFontScale}rem` : `${0.84 * bodyFontScale}rem`, lineHeight: readerPrefs.wideSpacing ? 1.55 : 1.35 }}>
              {preview || t.empty || UI_TEXT.en.empty}
            </p>
          </div>

          <motion.button
            whileTap={TAP_SCALE_DEFAULT}
            onClick={() => onSelectBlog(blog.id)}
            style={getReadPostButtonStyle(note, isMobile)}
          >
            {t.readPost}
          </motion.button>
        </motion.div>
      );
    })}
  </>
);

export default BlogListView;
