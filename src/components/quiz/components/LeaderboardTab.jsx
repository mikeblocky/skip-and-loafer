import { ListRow } from '../../sync/syncSharedComponents';

const LeaderboardTab = ({ isMobile, t, usingGlobalLeaderboard, displayedLeaderboard }) => (
  <div style={{ display: 'grid', gap: '10px' }}>
    <ListRow
      index={0}
      noteColor={2}
      numberLine1="TOP"
      numberLine2="10"
      title={usingGlobalLeaderboard ? t.globalBoard : t.localBoard}
      isMobile={isMobile}
      subtitle={<span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.68rem' : '0.76rem', color: '#6b7280' }}>{t.boardSource}: {usingGlobalLeaderboard ? 'API' : 'Local cache'}</span>}
    />

    {displayedLeaderboard.length === 0 && (
      <ListRow
        index={1}
        noteColor={4}
        numberLine1="—"
        numberLine2="—"
        title={t.noLeaderboard}
        isMobile={isMobile}
      />
    )}

    {displayedLeaderboard.map((entry, index) => (
      <ListRow
        key={`${entry.name}-${index}`}
        index={index + 2}
        noteColor={index}
        numberLine1="#"
        numberLine2={String(index + 1)}
        title={entry.name}
        isMobile={isMobile}
        rightContent={(
          <div style={{ display: 'grid', justifyItems: 'end', gap: '2px' }}>
            <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', color: '#374151', fontSize: isMobile ? '0.7rem' : '0.8rem' }}>{t.bestScore}: {entry.bestScore} {t.points}</span>
            <span style={{ fontFamily: 'var(--font-hand)', color: '#9ca3af', fontSize: isMobile ? '0.65rem' : '0.75rem' }}>{t.played}: {entry.played}</span>
          </div>
        )}
      />
    ))}
  </div>
);

export default LeaderboardTab;
