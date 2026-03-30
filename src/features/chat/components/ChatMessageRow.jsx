import { memo, useState } from 'react';
// cache-buster: v1.0.2 - Force reload of read indicators
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, PencilLine, Send, ImagePlus, Smile, X, LoaderCircle } from 'lucide-react';
import { CHAT_FONT_FAMILY, SPIN_ICON_STYLE } from '../chatConstants';
import { formatTime } from '../chatStorage';
import { getPaletteByIndex } from '../chatPalette';
import { getSystemMessageText } from '../chatUtils';
import { triggerHaptic } from '../../../utils/haptics';
import { ChatFaceAvatar } from './ChatAvatars';

export const ReadReceiptList = memo(({ messageId, lastReadMap, participants, activeParticipantId, palette, allMessages, isOwnMessage }) => {
  if (!messageId) return null;
  const currentReadMap = lastReadMap || {};

  // Determine which participants have read THIS message or any LATER message
  const myIndex = allMessages?.findIndex(m => m.id === messageId) ?? -1;
  const readers = (participants || [])
    .filter((p) => {
      if (p.id === activeParticipantId) return false;
      const pLastReadId = currentReadMap[p.id];
      if (!pLastReadId) return false;
      
      const pLastReadIndex = allMessages?.findIndex(m => m.id === pLastReadId) ?? -1;
      return pLastReadIndex >= myIndex;
    })
    .map((p) => p.characterName);

  if (!isOwnMessage) return null; // Only show receipts for your own messages

  if (!readers.length) {
    return (
      <div style={{ fontSize: '0.68rem', color: '#cbd5e1', fontFamily: CHAT_FONT_FAMILY, fontStyle: 'italic', marginTop: '2px' }}>
        Sent
      </div>
    );
  }

  const isFullyRead = (participants && participants.length > 1) && (readers.length === (participants.length - 1));
  const textColor = isFullyRead ? (palette?.text || '#3b82f6') : '#94a3b8';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginTop: '2px',
        whiteSpace: 'nowrap',
        color: textColor,
        fontFamily: CHAT_FONT_FAMILY,
        fontSize: '0.72rem',
        fontWeight: 500,
        opacity: 0.85
      }}
    >
      {readers.length === 1 
        ? `${readers[0]} seen` 
        : `Seen by ${readers.length}`}
    </div>
  );
});

export const ChatMessageRow = memo(({ 
  message, author, palette, isOwnMessage, isMobile, fallbackPortraitSrc, 
  copy, index, onSelectReply, onSelectEdit, onRemixDrawing, onReact,
  isOwnParticipant, allMessages, lastReadMap, participants, activeParticipantId,
  onScrollToMessage, messageDirection = 'right'
}) => {
  const [showPicker, setShowPicker] = useState(false);

  if (message.type === 'system') {
      const systemText = getSystemMessageText(message, participants);
      return (
        <div style={{ alignSelf: 'center', padding: '8px 14px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.94)', border: '1px solid rgba(148, 163, 184, 0.38)', color: '#64748b', fontSize: '0.92rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400, textAlign: 'center', maxWidth: '88%', boxShadow: '0 8px 22px rgba(15, 23, 42, 0.05)', backdropFilter: 'blur(6px)' }}>
           {systemText}
        </div>
      );
  }

  const isDrawingMessage = !!message.drawing;
  const bubbleBackground = isOwnMessage ? `${palette.bg}` : '#ffffff';
  const bubbleColor = isOwnMessage ? palette.text : '#1e293b';
  const bubbleBorder = `1.5px solid ${palette.border}`;
  const bubbleBottomBorder = `3.5px solid ${palette.border}`;
  const avatarSrc = author?.portraitSrc || fallbackPortraitSrc;
  const avatarName = author?.characterName || 'Character';
  const drawingPreviewSize = isMobile ? 260 : 380;

  const parentId = message.repliedToId || message.replyToId;
  const repliedMessage = (parentId && Array.isArray(allMessages)) 
    ? allMessages.find(m => String(m.id) === String(parentId)) 
    : null;
  const repliedAuthor = repliedMessage ? (participants || []).find(p => p.id === repliedMessage.authorId) : null;
  const repliedPalette = repliedAuthor ? (repliedAuthor.paletteIndex !== undefined ? getPaletteByIndex(repliedAuthor.paletteIndex) : getPaletteByIndex(Math.max((participants || []).findIndex(p => p.id === repliedAuthor.id), 0))) : palette;
  const handleReply = () => {
    triggerHaptic('tap');
    onSelectReply({ ...message, senderName: avatarName });
  };
  const handleEdit = () => {
    triggerHaptic('tap');
    onSelectEdit({ ...message, senderName: avatarName });
  };
  const handleRemix = () => {
    triggerHaptic('selection');
    onRemixDrawing(message.drawing);
  };
  const handleTogglePicker = (event) => {
    event.stopPropagation();
    triggerHaptic('selection');
    setShowPicker((current) => !current);
  };
  const handleReactEmoji = (emoji) => {
    triggerHaptic('tap');
    onReact(message.id, emoji);
    setShowPicker(false);
  };
  const handleScrollToReplied = (event) => {
    event.stopPropagation();
    triggerHaptic('selection');
    onScrollToMessage(repliedMessage.id);
  };

  return (
    <motion.div
      id={`chat-msg-${message.id}`}
      initial={{ opacity: 0, x: (isOwnMessage && messageDirection === 'right') ? 20 : -20, scale: 0.96 }}
      animate={{ 
        opacity: message.sending ? [0.6, 0.8, 0.6] : 1, 
        x: 0, 
        scale: 1 
      }}
      transition={message.sending ? { duration: 1.5, repeat: Infinity } : { delay: Math.min(index * 0.015, 0.12), duration: 0.25, ease: 'easeOut' }}
      style={{
        display: 'flex',
        justifyContent: (isOwnMessage && messageDirection === 'right') ? 'flex-end' : 'flex-start',
        width: '100%',
        padding: isMobile ? '0 2px' : '0 4px',
        position: 'relative',
        filter: message.sending ? 'grayscale(0.3)' : 'none',
      }}
    >
      <div
        style={{
          minWidth: 0,
          maxWidth: isDrawingMessage 
            ? (isMobile ? '88%' : '60%') 
            : (isOwnMessage ? (isMobile ? '78%' : '48%') : (isMobile ? '82%' : '56%')),
          display: 'grid',
          gap: '2px',
          justifyItems: isOwnMessage ? 'end' : 'start',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
            alignItems: 'center',
            gap: '6px',
            width: '100%',
          }}
        >
          {isOwnMessage ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}>
                <div style={{ fontSize: isMobile ? '0.74rem' : '0.8rem', color: palette.border, fontWeight: 400, fontFamily: CHAT_FONT_FAMILY, marginBottom: '1px', padding: '0 4px' }}>
                  {copy.you}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {!message.sending && (
                    <div style={{ position: 'relative', display: 'flex', gap: '4px' }}>
                      <button onClick={handleReply} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }} title="Reply">
                        <Send size={12} style={{ transform: 'rotate(180deg) scaleY(-1)' }} />
                      </button>
                      <button onClick={handleEdit} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }} title="Edit">
                        <PencilLine size={12} />
                      </button>
                      {isDrawingMessage && (
                        <button onClick={handleRemix} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }} title="Remix Drawing">
                          <ImagePlus size={12} />
                        </button>
                      )}
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          onClick={handleTogglePicker}
                          style={{ background: showPicker ? '#f1f5f9' : 'transparent', border: 'none', color: showPicker ? '#0f172a' : '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                          title="React"
                        >
                          {showPicker ? <X size={12} /> : <Smile size={12} />}
                        </button>
                        <AnimatePresence>
                          {showPicker && (
                            <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }} style={{ position: 'absolute', bottom: '100%', right: 0, background: '#ffffff', display: 'flex', gap: '6px', padding: '8px 12px', borderRadius: '24px', boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)', border: '1.5px solid #dbe7f3', zIndex: 1000, marginBottom: '10px', pointerEvents: 'auto' }}>
                              {['❤️', '😂', '👍', '😮', '😢', '🔥'].map(emoji => (
                                <button key={emoji} onClick={() => handleReactEmoji(emoji)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', padding: '4px', transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)', pointerEvents: 'auto', fontFamily: '"Noto Color Emoji", sans-serif' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                  {emoji}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                  <ChatFaceAvatar src={avatarSrc} name={avatarName} palette={palette} size={isMobile ? 28 : 34} interactive={false} />
                </div>
              </div>
            </>
          ) : (
            <>
              <ChatFaceAvatar src={avatarSrc} name={avatarName} palette={palette} size={isMobile ? 28 : 34} interactive={false} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }}>
                <div style={{ fontSize: isMobile ? '0.74rem' : '0.8rem', color: palette.border, fontWeight: 400, fontFamily: CHAT_FONT_FAMILY, marginBottom: '1px', padding: '0 4px' }}>
                  {author?.characterName || 'Guest'}
                </div>
                {!message.sending && (
                  <div style={{ position: 'relative', display: 'flex', gap: '4px' }}>
                    <button onClick={handleReply} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }} title="Reply">
                      <Send size={12} style={{ transform: 'rotate(180deg) scaleY(-1)' }} />
                    </button>
                    {isDrawingMessage && (
                      <button onClick={handleRemix} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }} title="Remix Drawing">
                        <ImagePlus size={12} />
                      </button>
                    )}
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button
                        onClick={handleTogglePicker}
                        style={{ background: showPicker ? '#f1f5f9' : 'transparent', border: 'none', color: showPicker ? '#0f172a' : '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                        title="React"
                      >
                        {showPicker ? <X size={12} /> : <Smile size={12} />}
                      </button>
                      <AnimatePresence>
                        {showPicker && (
                          <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }} style={{ position: 'absolute', bottom: '100%', left: 0, background: '#ffffff', display: 'flex', gap: '6px', padding: '8px 12px', borderRadius: '24px', boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)', border: '1.5px solid #dbe7f3', zIndex: 1000, marginBottom: '10px', pointerEvents: 'auto' }}>
                            {['❤️', '😂', '👍', '😮', '😢', '🔥'].map(emoji => (
                              <button key={emoji} onClick={() => handleReactEmoji(emoji)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', padding: '4px', transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)', pointerEvents: 'auto', fontFamily: '"Noto Color Emoji", sans-serif' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                {emoji}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        <div
          style={{
            width: '100%',
            background: bubbleBackground,
            color: bubbleColor,
            borderRadius: isOwnMessage ? '16px 16px 8px 16px' : '16px 16px 16px 8px',
            padding: isDrawingMessage ? '4px' : (isMobile ? '6px 10px' : '7px 11px'),
            border: bubbleBorder,
            borderBottom: bubbleBottomBorder,
            boxShadow: '0 8px 16px rgba(15, 23, 42, 0.05)',
            display: 'grid',
            gap: '0',
            overflow: 'visible',
          }}
        >
          {repliedMessage && (
            <div 
              onClick={handleScrollToReplied}
              style={{ background: isOwnMessage ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.06)', padding: '8px 12px', borderRadius: '14px', fontSize: '0.84rem', borderLeft: `3.5px solid ${repliedPalette.border}`, marginBottom: '10px', opacity: 0.9, maxWidth: '100%', overflow: 'hidden', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', transition: 'background 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.background = isOwnMessage ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = isOwnMessage ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.06)'}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 600, opacity: 0.8, marginBottom: '2px', color: repliedPalette.border, fontFamily: CHAT_FONT_FAMILY }}>
                   {repliedMessage.authorId === activeParticipantId ? copy.you : (repliedAuthor?.characterName || 'Reply')}
                </div>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.8 }}>
                  {repliedMessage.text || (repliedMessage.drawing ? '' : '...')}
                </div>
              </div>
              {repliedMessage.drawing && (
                <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: '1.5px solid rgba(15, 23, 42, 0.08)', flexShrink: 0 }}>
                  <img src={repliedMessage.drawing} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#fff' }} />
                </div>
              )}
            </div>
          )}

          {message.drawing && (
            <div style={{ width: '100%', maxWidth: `${drawingPreviewSize}px`, justifySelf: isOwnMessage ? 'end' : 'start', borderRadius: '16px', overflow: 'hidden', background: '#ffffff', border: '1px solid rgba(15, 23, 42, 0.08)', aspectRatio: '1 / 1' }}>
              <img src={message.drawing} alt={copy.drawingLabel} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#ffffff' }} />
            </div>
          )}
          {!!message.text && (
            <div style={{ lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: isMobile ? '0.96rem' : '1.02rem', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400, padding: isDrawingMessage ? '4px 6px 6px' : '0', marginTop: message.drawing ? '6px' : '0' }}>
              {message.text}
            </div>
          )}
              {message.reactions && Object.keys(message.reactions).length > 0 && !message.sending && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', marginBottom: '2px', justifyContent: isOwnMessage ? 'flex-end' : 'flex-start', position: 'relative', zIndex: 1, minHeight: '20px' }}>
                  {Object.entries(message.reactions).map(([emoji, users]) => {
                    const hasReacted = users.includes(activeParticipantId);
                    return (
                      <button key={emoji} onClick={() => onReact(message.id, emoji)} style={{ background: hasReacted ? `${palette.border}44` : 'rgba(255,255,255,0.76)', border: `1.5px solid ${hasReacted ? palette.border : 'rgba(148, 163, 184, 0.24)'}`, borderRadius: '12px', padding: '3px 8px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', transition: 'all 0.1s ease-out', boxShadow: hasReacted ? `0 2px 8px ${palette.border}22` : 'none', pointerEvents: 'auto' }}>
                        <span style={{ fontFamily: '"Noto Color Emoji", sans-serif' }}>{emoji}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 400, color: hasReacted ? palette.text : '#64748b' }}>{users.length}</span>
                      </button>
                    );
                  })}
                </div>
              )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isOwnMessage ? 'flex-end' : 'flex-start', width: '100%', padding: isOwnMessage ? '0 6px 0 0' : '0 0 0 4px' }}>
          {message.sending ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '0.8rem', fontFamily: CHAT_FONT_FAMILY }}>
              <LoaderCircle size={10} style={SPIN_ICON_STYLE} />
              Sending...
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem', letterSpacing: '0.01em', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400 }}>{formatTime(message.createdAt)}</span>
                {message.isEdited && (
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', opacity: 0.7, fontFamily: CHAT_FONT_FAMILY, fontStyle: 'italic' }}>· edited</span>
                )}
              </div>
              {isOwnMessage && message.id && (
                 <ReadReceiptList 
                   messageId={message.id} 
                   lastReadMap={lastReadMap} 
                   participants={participants} 
                   activeParticipantId={activeParticipantId} 
                   palette={palette} 
                   allMessages={allMessages}
                   isOwnMessage={isOwnMessage}
                 />
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
});
