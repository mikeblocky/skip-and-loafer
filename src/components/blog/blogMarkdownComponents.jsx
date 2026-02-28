import { Children, isValidElement } from 'react';

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
    <h1 style={{ margin: '6px 0 10px 0', color: readerTheme.heading, fontFamily: 'var(--font-main)', fontSize: isMobile ? `${1.1 * headingFontScale}rem` : `${1.3 * headingFontScale}rem`, lineHeight: 1.2, transition: 'font-size 0.3s ease, color 0.3s ease' }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ margin: '16px 0 8px 0', color: readerTheme.heading, fontFamily: 'var(--font-main)', fontSize: isMobile ? `${1 * headingFontScale}rem` : `${1.16 * headingFontScale}rem`, lineHeight: 1.25, transition: 'font-size 0.3s ease, color 0.3s ease' }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ margin: '14px 0 8px 0', color: readerTheme.heading, fontFamily: 'var(--font-main)', fontSize: isMobile ? `${0.95 * headingFontScale}rem` : `${1.05 * headingFontScale}rem`, transition: 'font-size 0.3s ease, color 0.3s ease' }}>
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
            margin: '-6px auto 14px auto',
            background: '#fff',
            border: `1px solid ${readerTheme.codeBorder}`,
            borderTop: 'none',
            borderRadius: '0 0 9px 9px',
            padding: isMobile ? '5px 10px 7px 10px' : '6px 12px 8px 12px',
            width: 'fit-content',
            maxWidth: 'min(100%, 760px)',
            textAlign: 'center',
            boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
          }}
        >
          <em style={{ color: readerTheme.subtle, fontFamily: 'var(--font-hand)', fontSize: isMobile ? `${0.72 * bodyFontScale}rem` : `${0.78 * bodyFontScale}rem` }}>
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
        <div style={{ margin: '0 0 12px 0' }}>
          {children}
        </div>
      );
    }

    return (
      <p style={{ margin: '0 0 12px 0', color: readerTheme.text, fontFamily: 'var(--font-hand)', fontSize: isMobile ? `${0.8 * bodyFontScale}rem` : `${0.88 * bodyFontScale}rem`, lineHeight: paragraphLineHeight, transition: 'font-size 0.3s ease, line-height 0.3s ease, color 0.3s ease' }}>
        {children}
      </p>
    );
  },
  hr: () => (
    <hr style={{ border: 0, borderTop: `1px dashed ${readerTheme.panelBorder}`, margin: '14px 0' }} />
  ),
  blockquote: ({ children }) => (
    <blockquote style={{ margin: '10px 0', padding: '8px 10px', borderLeft: `3px solid ${readerTheme.quoteBorder}`, background: readerTheme.quoteBg, borderRadius: '8px', color: readerTheme.quoteText, fontFamily: 'var(--font-hand)', fontSize: isMobile ? `${0.78 * bodyFontScale}rem` : `${0.85 * bodyFontScale}rem`, lineHeight: paragraphLineHeight, transition: 'font-size 0.3s ease, line-height 0.3s ease, color 0.3s ease, background 0.3s ease, border-color 0.3s ease' }}>
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: '0 0 12px 16px', padding: 0, color: readerTheme.text, fontFamily: 'var(--font-hand)', fontSize: isMobile ? `${0.8 * bodyFontScale}rem` : `${0.88 * bodyFontScale}rem`, lineHeight: listLineHeight, transition: 'font-size 0.3s ease, line-height 0.3s ease, color 0.3s ease' }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: '0 0 12px 16px', padding: 0, color: readerTheme.text, fontFamily: 'var(--font-hand)', fontSize: isMobile ? `${0.8 * bodyFontScale}rem` : `${0.88 * bodyFontScale}rem`, lineHeight: listLineHeight, transition: 'font-size 0.3s ease, line-height 0.3s ease, color 0.3s ease' }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: '4px' }}>{children}</li>
  ),
  strong: ({ children }) => (
    <strong style={{ color: readerTheme.heading }}>{children}</strong>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" style={{ color: readerTheme.link, textDecoration: 'underline', textUnderlineOffset: '2px', fontWeight: 'bold' }}>
      {children}
    </a>
  ),
  code: ({ inline, children }) => (
    inline ? (
      <code style={{ background: readerTheme.codeBg, border: `1px solid ${readerTheme.codeBorder}`, borderRadius: '6px', padding: '1px 5px', color: readerTheme.heading, fontFamily: 'monospace', fontSize: isMobile ? `${0.72 * bodyFontScale}rem` : `${0.78 * bodyFontScale}rem` }}>
        {children}
      </code>
    ) : (
      <code style={{ color: readerTheme.heading, fontFamily: 'monospace', fontSize: isMobile ? `${0.72 * bodyFontScale}rem` : `${0.8 * bodyFontScale}rem`, lineHeight: listLineHeight }}>
        {children}
      </code>
    )
  ),
  pre: ({ children }) => (
    <pre style={{ margin: '0 0 12px 0', background: readerTheme.codeBg, border: `1px solid ${readerTheme.codeBorder}`, borderRadius: '8px', padding: '10px', overflowX: 'auto' }}>
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div
      style={{
        margin: '12px auto 0 auto',
        background: '#fff',
        border: `1px solid ${readerTheme.codeBorder}`,
        borderRadius: '10px 10px 0 0',
        borderBottom: 'none',
        padding: isMobile ? '8px 8px 10px 8px' : '10px 10px 12px 10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
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
      <td style={{ verticalAlign: 'top', padding: hasTightImage ? 0 : (isMobile ? '0 4px' : '0 6px') }}>
        {children}
      </td>
    );
  },
  img: ({ src, alt, ...props }) => {
    const isTight = props['data-tight'] === true || props['data-tight'] === 'true';

    if (isTight) {
      return (
        <img
          src={src}
          alt={alt || ''}
          loading="lazy"
          onClick={() => openImageBySrc(src)}
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 0, cursor: 'zoom-in', margin: 0 }}
        />
      );
    }

    return (
      <div style={{ margin: '12px 0 8px 0', background: '#fff', border: `1px solid ${readerTheme.codeBorder}`, borderRadius: '10px', padding: isMobile ? '8px 8px 10px 8px' : '10px 10px 12px 10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <img
          src={src}
          alt={alt || ''}
          loading="lazy"
          onClick={() => openImageBySrc(src)}
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '6px', cursor: 'zoom-in' }}
        />
      </div>
    );
  },
  video: ({ children, ...props }) => (
    <div style={{ margin: '12px 0', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
      <video controls playsInline {...props} style={{ width: '100%', display: 'block' }}>
        {children}
      </video>
    </div>
  ),
  iframe: ({ ...props }) => (
    <div style={{ margin: '12px 0', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
      <iframe title="Embedded media" loading="lazy" {...props} style={{ width: '100%', minHeight: isMobile ? '200px' : '360px', border: 0, display: 'block' }} />
    </div>
  ),
});
