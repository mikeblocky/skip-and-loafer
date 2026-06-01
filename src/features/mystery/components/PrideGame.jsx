import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, MailPlus, RefreshCw, Send, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../../../utils/haptics';
import { createPaperPanelStyle } from '../../../components/shared/paper/paperTheme';

const COMMUNITY_FONT_FAMILY = 'var(--font-paper)';
const PRIDE_MESSAGES_ENDPOINT = '/api/pride/messages';
const STORAGE_NAME_KEY = 'skip_pride_message_name';

const MOODS = [
  { id: 'Proud', label: 'Proud', color: '#db2777', bg: '#fdf2f8' },
  { id: 'Loved', label: 'Loved', color: '#dc2626', bg: '#fff1f2' },
  { id: 'Seen', label: 'Seen', color: '#7c3aed', bg: '#faf5ff' },
  { id: 'Hopeful', label: 'Hopeful', color: '#0284c7', bg: '#eff6ff' },
  { id: 'Bright', label: 'Bright', color: '#ca8a04', bg: '#fefce8' },
];

const DEFAULT_MESSAGES = [
  {
    id: 'seed_mitsumi',
    name: 'Mitsumi',
    mood: 'Hopeful',
    message: 'Wishing everyone a June where they can move at their own pace and still feel welcome.',
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'seed_nao',
    name: 'Nao',
    mood: 'Seen',
    message: 'Your style, your name, your story. Keep all of it.',
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'seed_shima',
    name: 'Shima',
    mood: 'Loved',
    message: 'Pride month reminder: you do not have to perform confidence to deserve care.',
    createdAt: '2026-06-01T00:00:00.000Z',
  },
];

const normalizeMessages = (messages) => {
  return (Array.isArray(messages) ? messages : [])
    .filter((entry) => entry?.id && entry?.name && entry?.message)
    .slice(0, 80);
};

const formatMessageDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const PrideGame = ({ isMobile }) => {
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [mood, setMood] = useState(MOODS[0].id);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sentEntryId, setSentEntryId] = useState('');

  const selectedMood = useMemo(() => MOODS.find((item) => item.id === mood) || MOODS[0], [mood]);
  const remaining = 320 - message.length;

  const loadMessages = () => {
    setIsLoading(true);
    fetch(PRIDE_MESSAGES_ENDPOINT)
      .then((response) => {
        if (!response.ok) throw new Error(`Pride messages fetch failed (${response.status})`);
        return response.json();
      })
      .then((payload) => {
        const nextMessages = normalizeMessages(payload?.messages);
        setMessages(nextMessages.length ? nextMessages : DEFAULT_MESSAGES);
      })
      .catch(() => {
        setMessages((current) => (current.length ? current : DEFAULT_MESSAGES));
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    try {
      const savedName = localStorage.getItem(STORAGE_NAME_KEY);
      if (savedName) setName(savedName);
    } catch {}

    loadMessages();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedMessage) {
      triggerHaptic('impactLight');
      setError('Name and message are required.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const optimisticEntry = {
      id: `local_${Date.now()}`,
      name: trimmedName,
      message: trimmedMessage,
      mood,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => normalizeMessages([optimisticEntry, ...current]));
    setSentEntryId(optimisticEntry.id);
    setMessage('');

    try {
      localStorage.setItem(STORAGE_NAME_KEY, trimmedName);
    } catch {}

    fetch(PRIDE_MESSAGES_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmedName, message: trimmedMessage, mood }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Pride message submit failed (${response.status})`);
        return response.json();
      })
      .then((payload) => {
        const nextMessages = normalizeMessages(payload?.messages);
        if (nextMessages.length) setMessages(nextMessages);
        if (payload?.entry?.id) setSentEntryId(payload.entry.id);
        triggerHaptic('notificationSuccess');
      })
      .catch(() => {
        setError('Saved locally for now. The shared board could not be reached.');
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
      <div
        className="sketchbook-border"
        style={{
          ...createPaperPanelStyle({
            background: 'linear-gradient(90deg, #fee2e2 0%, #fffbeb 45%, #eff6ff 100%)',
            borderColor: '#fecdd3',
            bottomColor: '#db2777',
            radius: '16px',
          }),
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart size={16} fill="#db2777" color="#db2777" style={{ animation: 'pulse 2s infinite' }} />
          <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: isMobile ? '0.86rem' : '0.94rem', color: '#881337', fontWeight: 'bold' }}>
            Pride Month message wall (June 1 - 30)
          </span>
        </div>
        <motion.button
          type="button"
          onClick={loadMessages}
          whileTap={{ scale: 0.96 }}
          aria-label="Refresh Pride messages"
          style={{
            border: 'none',
            background: 'rgba(255,255,255,0.72)',
            color: '#be185d',
            borderRadius: '999px',
            width: '32px',
            height: '32px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={15} />
        </motion.button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(280px, 0.86fr) minmax(360px, 1.14fr)',
          gap: '18px',
          width: '100%',
          alignItems: 'start',
        }}
      >
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sketchbook-border"
          style={{
            ...createPaperPanelStyle({ background: '#ffffff', borderColor: '#fda4af', bottomColor: '#db2777', radius: '24px' }),
            padding: isMobile ? '18px' : '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          <div className="washi-tape washi-tape--pink" style={{ position: 'absolute', top: '-12px', left: '28px', width: '78px', height: '16px', transform: 'rotate(-4deg)', zIndex: 10 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#be185d' }}>
            <MailPlus size={20} />
            <h2 style={{ margin: 0, fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '1.32rem', fontWeight: 'bold' }}>
              Send a Pride note
            </h2>
          </div>

          <p style={{ margin: 0, fontFamily: 'var(--font-hand)', fontSize: '1rem', color: '#475569', lineHeight: 1.45 }}>
            Leave a kind message for the community. Short, warm, and readable works best.
          </p>

          <label style={{ display: 'grid', gap: '6px', fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '0.82rem', color: '#be185d', fontWeight: 'bold' }}>
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={48}
              placeholder="Your name"
              className="sketchbook-border"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #fecdd3',
                borderBottom: '4px solid #f472b6',
                borderRadius: '14px',
                fontFamily: COMMUNITY_FONT_FAMILY,
                color: '#334155',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </label>

          <div style={{ display: 'grid', gap: '8px' }}>
            <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '0.82rem', color: '#be185d', fontWeight: 'bold' }}>Mood</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {MOODS.map((item) => {
                const isSelected = item.id === mood;
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setMood(item.id);
                      triggerHaptic('selection');
                    }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '999px',
                      border: `2px solid ${isSelected ? item.color : '#e2e8f0'}`,
                      background: isSelected ? item.bg : '#ffffff',
                      color: isSelected ? item.color : '#64748b',
                      fontFamily: COMMUNITY_FONT_FAMILY,
                      fontSize: '0.78rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <label style={{ display: 'grid', gap: '6px', fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '0.82rem', color: '#be185d', fontWeight: 'bold' }}>
            Message
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value.slice(0, 320))}
              placeholder="Write something supportive..."
              rows={6}
              className="sketchbook-border"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #fecdd3',
                borderBottom: '4px solid #f472b6',
                borderRadius: '16px',
                fontFamily: 'var(--font-hand)',
                fontSize: '1.05rem',
                color: '#334155',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
                lineHeight: 1.4,
              }}
            />
          </label>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.84rem', color: remaining < 40 ? '#be123c' : '#64748b' }}>
              {remaining} characters left
            </span>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={isSubmitting ? {} : { scale: 1.02, y: -1 }}
              whileTap={isSubmitting ? {} : { scale: 0.97 }}
              className="sketchbook-border"
              style={{
                ...createPaperPanelStyle({ background: selectedMood.color, borderColor: selectedMood.color, bottomColor: selectedMood.color, radius: '16px' }),
                padding: '11px 16px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                color: '#ffffff',
                fontFamily: COMMUNITY_FONT_FAMILY,
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: isSubmitting ? 'wait' : 'pointer',
                opacity: isSubmitting ? 0.72 : 1,
              }}
            >
              <Send size={15} /> {isSubmitting ? 'Sending...' : 'Send'}
            </motion.button>
          </div>

          {error && (
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.88rem', color: '#be123c', fontWeight: 'bold' }}>
              {error}
            </span>
          )}
        </motion.form>

        <section
          className="sketchbook-border"
          style={{
            ...createPaperPanelStyle({ background: '#fff7fb', borderColor: '#fbcfe8', bottomColor: '#db2777', radius: '24px' }),
            padding: isMobile ? '16px' : '20px',
            boxSizing: 'border-box',
            minHeight: '420px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#be185d' }}>
              <Sparkles size={18} />
              <h2 style={{ margin: 0, fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '1.18rem', fontWeight: 'bold' }}>
                Community notes
              </h2>
            </div>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.86rem', color: '#64748b' }}>
              {isLoading ? 'Loading...' : `${messages.length} notes`}
            </span>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <AnimatePresence initial={false}>
              {messages.map((entry) => {
                const entryMood = MOODS.find((item) => item.id === entry.mood) || MOODS[0];
                const isFresh = sentEntryId === entry.id;

                return (
                  <motion.article
                    key={entry.id}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: isFresh ? [1, 1.02, 1] : 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="sketchbook-border"
                    style={{
                      background: '#ffffff',
                      border: `2px solid ${entryMood.color}30`,
                      borderBottom: `4px solid ${entryMood.color}`,
                      borderRadius: '18px',
                      padding: '12px 14px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '7px' }}>
                      <strong style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#334155', fontSize: '0.92rem' }}>
                        {entry.name}
                      </strong>
                      <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '0.72rem', color: entryMood.color, background: entryMood.bg, borderRadius: '999px', padding: '4px 8px', fontWeight: 'bold' }}>
                        {entryMood.label}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontFamily: 'var(--font-hand)', fontSize: '1.06rem', color: '#475569', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                      {entry.message}
                    </p>
                    <div style={{ marginTop: '8px', fontFamily: 'var(--font-hand)', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'right' }}>
                      {formatMessageDate(entry.createdAt)}
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrideGame;
