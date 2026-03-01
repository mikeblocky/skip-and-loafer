import { ListRow } from '../../sync/syncSharedComponents';
import { getDifficultyLabel, getQuestionSetLabel } from '../quizUtils';

const HistoryTab = ({ isMobile, t, displayedHistory }) => (
  <div style={{ display: 'grid', gap: '10px' }}>
    <ListRow
      index={0}
      noteColor={3}
      numberLine1="LOG"
      numberLine2="H"
      title={t.historyTitle}
      isMobile={isMobile}
    />

    {displayedHistory.length === 0 && (
      <ListRow
        index={1}
        noteColor={5}
        numberLine1="—"
        numberLine2="—"
        title={t.noHistory}
        isMobile={isMobile}
      />
    )}

    {displayedHistory.map((item, index) => (
      <ListRow
        key={item.id || `${item.playedAt}-${index}`}
        index={index + 2}
        noteColor={index + 6}
        numberLine1="TRY"
        numberLine2={String(index + 1)}
        title={`${item.name} • ${item.score}/${item.total}`}
        isMobile={isMobile}
        subtitle={
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-hand)', color: '#6b7280', fontSize: isMobile ? '0.65rem' : '0.75rem' }}>{t.historyDifficulty}: {getDifficultyLabel(item.difficultyMode, t)}</span>
            <span style={{ fontFamily: 'var(--font-hand)', color: '#6b7280', fontSize: isMobile ? '0.65rem' : '0.75rem' }}>{t.historySet}: {getQuestionSetLabel(item.questionSet, t)}</span>
          </div>
        }
        rightContent={(
          <span style={{ fontFamily: 'var(--font-hand)', color: '#9ca3af', fontSize: isMobile ? '0.62rem' : '0.72rem' }}>
            {new Date(item.playedAt || Date.now()).toLocaleDateString()}
          </span>
        )}
      />
    ))}
  </div>
);

export default HistoryTab;
