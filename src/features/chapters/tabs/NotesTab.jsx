import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, Trash2, Edit3, Check } from 'lucide-react';
import { triggerHaptic } from '../../../utils/haptics';
import { CHAPTERS, SIDE_WORKS } from '../../../data/chapters';

void motion;

const NotesTab = ({
  isMobile,
  chapterNotes = {},
  onSaveNote,
  t,
}) => {
  const [editingChapter, setEditingChapter] = useState(null);
  const [editText, setEditText] = useState('');

  // Extract all non-empty notes and sort them by chapter number
  const notesList = useMemo(() => {
    return Object.entries(chapterNotes)
      .map(([numStr, text]) => {
        const number = parseFloat(numStr);
        // Find matching chapter in main story or side works
        const chapter = CHAPTERS.find(c => c.number === number) || SIDE_WORKS.find(c => c.number === number);
        return {
          number,
          text,
          chapter,
        };
      })
      .filter(n => n.text && n.text.trim() !== '')
      .sort((a, b) => a.number - b.number);
  }, [chapterNotes]);

  const handleStartEdit = (number, currentText) => {
    triggerHaptic('selection');
    setEditingChapter(number);
    setEditText(currentText);
  };

  const handleSaveEdit = (number) => {
    triggerHaptic('notificationSuccess');
    onSaveNote?.(number, editText);
    setEditingChapter(null);
    setEditText('');
  };

  const handleDeleteNote = (number) => {
    if (window.confirm(t.clearNoteConfirm || 'Delete this note?')) {
      triggerHaptic('impactLight');
      onSaveNote?.(number, '');
    }
  };



  return (
    <div
      style={{
        padding: isMobile ? '16px 10px 80px 10px' : '28px 40px 48px 40px',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
    >
      <AnimatePresence mode="wait">
        {notesList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              padding: '64px 20px',
              textAlign: 'center',
              opacity: 0.6,
            }}
          >
            <StickyNote size={48} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
            <p
              style={{
                fontFamily: 'var(--font-paper)',
                fontSize: '1.2rem',
                margin: 0,
                color: 'var(--text-secondary)',
              }}
            >
              {t.writeNotePlaceholder || 'Jot down some thoughts while reading chapters!'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
              width: '100%',
              zIndex: 5,
            }}
          >
            {notesList.map((note, idx) => {
              const isEditing = editingChapter === note.number;

              return (
                <motion.div
                  key={note.number}
                  className="no-override"
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4, rotate: (idx % 2 === 0 ? 0.5 : -0.5) }}
                  style={{
                    background: 'var(--note-bg)',
                    border: '2px solid var(--note-border)',
                    borderBottom: '4px solid var(--note-border-bottom)',
                    padding: '20px',
                    borderRadius: '16px',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '200px',
                    position: 'relative',
                  }}
                >
                  {/* Scrapbook pin/tape deco */}
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%) rotate(1deg)',
                    width: '60px',
                    height: '18px',
                    background: 'rgba(255,255,255,0.4)',
                    backdropFilter: 'blur(1.5px)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px dashed rgba(0,0,0,0.1)',
                    zIndex: 2,
                  }} />

                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-paper)',
                          fontWeight: '400',
                          fontSize: '1.05rem',
                          color: 'var(--note-text)',
                          lineHeight: '1.2',
                          flex: 1,
                        }}
                      >
                        {SIDE_WORKS.some(c => c.number === note.number) ? (t.sideWorks || 'Side Work') : `${t.chapterRange || 'Chapter'} ${note.number}`}
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          onClick={() => isEditing ? handleSaveEdit(note.number) : handleStartEdit(note.number, note.text)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--note-text)',
                            cursor: 'pointer',
                            padding: '4px',
                            opacity: 0.7,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isEditing ? <Check size={16} strokeWidth={2.5} /> : <Edit3 size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.number)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--note-text)',
                            cursor: 'pointer',
                            padding: '4px',
                            opacity: 0.7,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Note Content */}
                    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {isEditing ? (
                        <textarea
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={4}
                          style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            outline: 'none',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-paper)',
                            fontSize: '0.94rem',
                            lineHeight: '1.4',
                            color: 'var(--note-text)',
                            padding: '8px',
                            resize: 'none',
                            margin: '4px 0 0 0',
                          }}
                        />
                      ) : (
                        <p
                          style={{
                            fontFamily: 'var(--font-hand)',
                            fontSize: '1rem',
                            color: 'var(--note-text)',
                            margin: '4px 0 0 0',
                            lineHeight: '1.4',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {note.text}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesTab;
