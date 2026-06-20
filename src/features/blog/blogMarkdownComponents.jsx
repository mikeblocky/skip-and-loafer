import { Children, isValidElement } from 'react';

const ALLOWED_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

function sanitizeUrl(value, { allowRelative = true } = {}) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (allowRelative && (raw.startsWith('/') || raw.startsWith('#'))) return raw;

  try {
    const parsed = new URL(raw);
    return ALLOWED_URL_PROTOCOLS.has(parsed.protocol) ? parsed.href : '';
  } catch {
    return '';
  }
}

function sanitizeMediaUrl(value) {
  const raw = sanitizeUrl(value);
  return raw.startsWith('http') || raw.startsWith('/') ? raw : '';
}

export const createBlogMarkdownComponents = ({
  isMobile,
  readerTheme,
  bodyFontScale,
  headingFontScale,
  paragraphLineHeight,
  listLineHeight,
  openImageBySrc,
}) => ({
  h1: ({ children }) => (
    <h1 style={{ margin: '6px 0 10px 0', color: readerTheme.heading, fontFamily: 'Sniglet, var(--font-main)', fontSize: isMobile ? `${1.26 * headingFontScale}rem` : `${1.46 * headingFontScale}rem`, lineHeight: 1.24, letterSpacing: '0.012em', fontWeight: 400, transition: 'font-size 0.3s ease, color 0.3s ease' }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ margin: '16px 0 8px 0', color: readerTheme.heading, fontFamily: 'Sniglet, var(--font-main)', fontSize: isMobile ? `${1.11 * headingFontScale}rem` : `${1.28 * headingFontScale}rem`, lineHeight: 1.28, letterSpacing: '0.01em', fontWeight: 400, transition: 'font-size 0.3s ease, color 0.3s ease' }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ margin: '14px 0 8px 0', color: readerTheme.heading, fontFamily: 'Sniglet, var(--font-main)', fontSize: isMobile ? `${1.05 * headingFontScale}rem` : `${1.16 * headingFontScale}rem`, lineHeight: 1.24, letterSpacing: '0.008em', fontWeight: 400, transition: 'font-size 0.3s ease, color 0.3s ease' }}>
      {children}
    </h3>
  ),
  p: ({ children }) => {
    const nodes = Children.toArray(children).filter((child) => {
      if (typeof child !== 'string') return true;
      return child.trim().length > 0;
    });

    const isCaptionLine = nodes.length === 1
      && isValidElement(nodes[0])
      && nodes[0].type === 'em';

    if (isCaptionLine) {
      return (
        <div
          style={{
            margin: '-12px auto 16px auto',
            background: '#fff',
            border: `2.5px solid ${readerTheme.codeBorder}`,
            borderTop: 'none',
            borderRadius: '0 0 16px 16px',
            padding: isMobile ? '8px 14px 10px 14px' : '10px 16px 12px 16px',
            width: 'fit-content',
            maxWidth: 'min(100%, 760px)',
            textAlign: 'center',
            boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
          }}
        >
          <em style={{ color: readerTheme.subtle, fontFamily: 'Sniglet, var(--font-main)', fontWeight: 400, fontSize: isMobile ? `${0.82 * bodyFontScale}rem` : `${0.88 * bodyFontScale}rem`, letterSpacing: '0.01em' }}>
            {nodes[0].props.children}
          </em>
        </div>
      );
    }
 
    const hasBlockMedia = nodes.some((child) => {
      if (!isValidElement(child)) return false;
      const tagName = typeof child.type === 'string'
        ? child.type
        : (child.props?.node?.tagName || '').toLowerCase();
 
      return ['img', 'figure', 'video', 'iframe', 'div', 'table'].includes(tagName);
    });
 
    if (hasBlockMedia) {
      return (
        <div style={{ margin: '0 0 16px 0' }}>
          {children}
        </div>
      );
    }
 
    return (
      <p style={{ margin: '0 0 16px 0', color: readerTheme.text, fontFamily: 'Sniglet, var(--font-main)', fontWeight: 400, fontSize: isMobile ? `${0.94 * bodyFontScale}rem` : `${1.02 * bodyFontScale}rem`, lineHeight: paragraphLineHeight + 0.08, letterSpacing: '0.01em', transition: 'all 0.3s ease', opacity: 0.96 }}>
        {children}
      </p>
    );
  },
  hr: () => (
    <hr style={{ border: 0, borderTop: `3px dashed ${readerTheme.panelBorder}`, margin: '20px 0', opacity: 0.5 }} />
  ),
  blockquote: ({ children }) => (
    <blockquote style={{ margin: '14px 0', padding: '12px 16px', borderLeft: `6px solid ${readerTheme.quoteBorder}`, background: readerTheme.quoteBg, borderRadius: '16px', color: readerTheme.quoteText, fontFamily: 'Sniglet, var(--font-main)', fontWeight: 400, fontSize: isMobile ? `${0.96 * bodyFontScale}rem` : `${1.04 * bodyFontScale}rem`, lineHeight: paragraphLineHeight + 0.08, letterSpacing: '0.01em', transition: 'all 0.3s ease' }}>
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: '0 0 16px 20px', padding: 0, color: readerTheme.text, fontFamily: 'Sniglet, var(--font-main)', fontWeight: 400, fontSize: isMobile ? `${0.94 * bodyFontScale}rem` : `${1.02 * bodyFontScale}rem`, lineHeight: listLineHeight + 0.08, letterSpacing: '0.01em', transition: 'all 0.3s ease', opacity: 0.96 }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: '0 0 16px 20px', padding: 0, color: readerTheme.text, fontFamily: 'Sniglet, var(--font-main)', fontWeight: 400, fontSize: isMobile ? `${0.94 * bodyFontScale}rem` : `${1.02 * bodyFontScale}rem`, lineHeight: listLineHeight + 0.08, letterSpacing: '0.01em', transition: 'all 0.3s ease', opacity: 0.96 }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: '8px' }}>{children}</li>
  ),
  strong: ({ children }) => (
    <strong style={{ color: readerTheme.heading, fontFamily: 'var(--font-main)', fontWeight: 400, letterSpacing: '0.01em' }}>{children}</strong>
  ),
  a: ({ href, children }) => {
    const safeHref = sanitizeUrl(href);
    if (!safeHref) return <span>{children}</span>;

    return (
      <a href={safeHref} target="_blank" rel="noopener noreferrer" style={{ color: readerTheme.link, textDecoration: 'underline', textUnderlineOffset: '3px', fontWeight: 400 }}>
        {children}
      </a>
    );
  },
  code: ({ inline, children }) => (
    inline ? (
      <code style={{ background: readerTheme.codeBg, border: `2px solid ${readerTheme.codeBorder}`, borderRadius: '8px', padding: '2px 6px', color: readerTheme.heading, fontFamily: 'monospace', fontWeight: '400', fontSize: isMobile ? `${0.75 * bodyFontScale}rem` : `${0.8 * bodyFontScale}rem` }}>
        {children}
      </code>
    ) : (
      <code style={{ color: readerTheme.heading, fontFamily: 'monospace', fontWeight: '400', fontSize: isMobile ? `${0.75 * bodyFontScale}rem` : `${0.82 * bodyFontScale}rem`, lineHeight: listLineHeight }}>
        {children}
      </code>
    )
  ),
  pre: ({ children }) => (
    <pre style={{ margin: '0 0 16px 0', background: readerTheme.codeBg, border: `2.5px solid ${readerTheme.codeBorder}`, borderBottom: `5px solid ${readerTheme.codeBorder}`, borderRadius: '16px', padding: '16px', overflowX: 'auto' }}>
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div
      style={{
        margin: '16px auto 0 auto',
        background: '#fff',
        border: `2.5px solid ${readerTheme.codeBorder}`,
        borderBottom: `5px solid ${readerTheme.codeBorder}`,
        borderRadius: '20px',
        padding: isMobile ? '12px 12px 14px 12px' : '16px 16px 20px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        overflowX: 'auto',
        width: 'fit-content',
        maxWidth: '100%',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', borderSpacing: 0 }}>{children}</table>
    </div>
  ),
  td: ({ children }) => {
    const childNodes = Children.toArray(children);
    const hasTightImage = childNodes.some((child) => (
      isValidElement(child)
      && (child.props?.['data-tight'] === true || child.props?.['data-tight'] === 'true')
    ));
 
    return (
      <td style={{ verticalAlign: 'top', padding: hasTightImage ? 0 : (isMobile ? '4px 8px' : '5px 10px') }}>
        {children}
      </td>
    );
  },
  img: ({ src, alt, ...props }) => {
    const isTight = props['data-tight'] === true || props['data-tight'] === 'true';
    const safeSrc = sanitizeMediaUrl(src);
    if (!safeSrc) return null;
 
    if (isTight) {
      return (
        <img
          src={safeSrc}
          alt={alt || ''}
          loading="lazy"
          onClick={() => openImageBySrc(safeSrc)}
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 0, cursor: 'zoom-in', margin: 0 }}
        />
      );
    }
 
    return (
      <div style={{ margin: '16px 0 12px 0', background: '#fff', border: `2.5px solid ${readerTheme.codeBorder}`, borderBottom: `5px solid ${readerTheme.codeBorder}`, borderRadius: '20px', padding: isMobile ? '12px 12px 14px 12px' : '16px 16px 20px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
        <img
          src={safeSrc}
          alt={alt || ''}
          loading="lazy"
          onClick={() => openImageBySrc(safeSrc)}
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px', cursor: 'zoom-in' }}
        />
      </div>
    );
  },
  video: ({ children, src, ...props }) => {
    const safeSrc = sanitizeMediaUrl(src);
    if (src && !safeSrc) return null;

    return (
      <div style={{ margin: '16px 0', border: '2.5px solid #e2e8f0', borderBottom: '5px solid #cbd5e1', borderRadius: '24px', overflow: 'hidden', background: '#000' }}>
        <video controls playsInline {...props} src={safeSrc || undefined} style={{ width: '100%', display: 'block' }}>
          {children}
        </video>
      </div>
    );
  },
});
