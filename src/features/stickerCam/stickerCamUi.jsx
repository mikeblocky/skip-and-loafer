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

function ToolBtn({ color, onClick, children }) {
  return (
    <button onClick={onClick}
      style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'6px 10px', minHeight:36, background:`${color}1a`, border:`1.5px solid ${color}44`, borderBottom:`3px solid ${color}66`, borderRadius:10, color, fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.8rem', cursor:'pointer', whiteSpace:'nowrap', flex:'0 0 auto', transition:'background 0.12s, transform 0.1s' }}
      onMouseEnter={e => { e.currentTarget.style.background=`${color}2e`; e.currentTarget.style.transform='translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background=`${color}1a`; e.currentTarget.style.transform=''; }}
    >{children}</button>
  );
}

export { CtrlBtn, Sep, StatusChip, ToolBtn };
