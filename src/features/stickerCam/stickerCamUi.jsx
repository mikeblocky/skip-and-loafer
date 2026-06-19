function CtrlBtn({ color, onClick, title, children }) {
  return (
    <button onClick={onClick} title={title}
      style={{ background:`${color}22`, border:`1px solid ${color}55`, borderRadius:8, padding:'5px 8px', cursor:'pointer', color, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1, transition:'background 0.1s' }}
      onMouseEnter={e => { e.currentTarget.style.background = `${color}44`; }}
      onMouseLeave={e => { e.currentTarget.style.background = `${color}22`; }}
    >{children}</button>
  );
}

function Sep() {
  return <div style={{ width:1, height:18, background:'rgba(255,255,255,0.12)', flexShrink:0 }} />;
}

const StatusChip = ({ label, color }) => (
  <div style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)', border:`1px solid ${color}44`, borderRadius:10, padding:'3px 10px', display:'flex', alignItems:'center', gap:6 }}>
    <span style={{ width:7, height:7, borderRadius:'50%', background:color, flexShrink:0, boxShadow:`0 0 5px ${color}` }} />
    <span style={{ color, fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.75rem' }}>{label}</span>
  </div>
);

function ToolBtn({ color, onClick, children, title, compact = false, active = false, themed = false, darkMode = false }) {
  const background = themed
    ? (active
        ? (darkMode ? 'rgba(255,255,255,0.12)' : '#ffffff')
        : (darkMode ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #fff7ed 0%, #ecfeff 55%, #fdf2f8 100%)'))
    : (active ? `${color}33` : `${color}1a`);
  const borderColor = themed ? color : (active ? `${color}88` : `${color}44`);
  const bottomColor = themed ? color : `${color}66`;
  const shadow = themed
    ? `0 5px 0 ${color}33, 0 8px 18px ${color}18`
    : (active ? `0 0 18px ${color}2e` : 'none');

  return (
    <button onClick={onClick} title={title}
      style={{
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        gap:compact ? 0 : 5,
        padding:compact ? '0' : '6px 10px',
        width:compact ? 40 : undefined,
        minWidth:compact ? 40 : undefined,
        minHeight:36,
        background,
        border:`1.5px solid ${borderColor}`,
        borderBottom:`3px solid ${bottomColor}`,
        borderRadius:themed ? 13 : 10,
        color,
        fontFamily:'Sniglet, var(--font-hand)',
        fontSize:'0.8rem',
        cursor:'pointer',
        whiteSpace:'nowrap',
        flex:'0 0 auto',
        transition:'background 0.14s ease, transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease',
        boxShadow:shadow,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background=themed ? '#ffffff' : `${color}30`;
        e.currentTarget.style.transform='translateY(-2px) scale(1.03)';
        e.currentTarget.style.boxShadow=themed ? `0 7px 0 ${color}40, 0 10px 24px ${color}25` : `0 8px 22px ${color}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background=background;
        e.currentTarget.style.transform='';
        e.currentTarget.style.boxShadow=shadow;
      }}
      onPointerDown={e => { e.currentTarget.style.transform='translateY(1px) scale(0.96)'; }}
      onPointerUp={e => { e.currentTarget.style.transform='translateY(-2px) scale(1.03)'; }}
    >{children}</button>
  );
}

export { CtrlBtn, Sep, StatusChip, ToolBtn };
