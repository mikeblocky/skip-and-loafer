import { useMemo, useState } from 'react';
import usePageTitle from './hooks/shared/usePageTitle';

const CIPHER_TEXT = 'ERRNV DQG KRQHVWB';
const CIPHER_TARGET = 'BOOKS AND HONESTY';

const GUESTS = [
  { id: 'mitsumi', name: 'Mitsumi', image: '/characters/1c.png', accent: '#f28d67' },
  { id: 'mika', name: 'Mika', image: '/characters/3c.png', accent: '#ef476f' },
  { id: 'yuzuki', name: 'Yuzuki', image: '/characters/4c.png', accent: '#14b8a6' },
  { id: 'shima', name: 'Shima', image: '/characters/2c.png', accent: '#eab308' },
];

const CHARACTER_PUZZLES = [
  {
    id: 'sunrise',
    clue: 'Who would burst in first with open-hearted encouragement and a notebook full of effort?',
    answer: 'mitsumi',
  },
  {
    id: 'honest',
    clue: 'Who hides real care behind sharp honesty and a perfectly arranged exterior?',
    answer: 'mika',
  },
  {
    id: 'poise',
    clue: 'Who reads the room with calm elegance and makes it feel easier to breathe?',
    answer: 'yuzuki',
  },
  {
    id: 'observer',
    clue: 'Who notices people quietly, then shows up at exactly the right moment?',
    answer: 'shima',
  },
];

const REVEAL_FRIENDS = [
  { name: 'Mitsumi', image: '/characters/1c.png', className: 'makoto-scene__friend--mitsumi' },
  { name: 'Shima', image: '/characters/2c.png', className: 'makoto-scene__friend--shima' },
  { name: 'Mika', image: '/characters/3c.png', className: 'makoto-scene__friend--mika' },
  { name: 'Yuzuki', image: '/characters/4c.png', className: 'makoto-scene__friend--yuzuki' },
];

const createInitialAnswers = () => (
  CHARACTER_PUZZLES.reduce((answers, puzzle) => {
    answers[puzzle.id] = '';
    return answers;
  }, {})
);

const normalizeText = (value) => value.replace(/[^a-z]/gi, '').toUpperCase();

const decodeCaesar = (value, shift) => value.replace(/[A-Z]/gi, (character) => {
  const start = character >= 'a' && character <= 'z' ? 97 : 65;
  const offset = character.charCodeAt(0) - start;
  const nextOffset = (offset - shift + 26 * 3) % 26;
  return String.fromCharCode(start + nextOffset);
});

const getStageNumber = (stage) => {
  switch (stage) {
    case 'puzzle':
      return 2;
    case 'reveal':
      return 3;
    default:
      return 1;
  }
};

function MakotoBirthday() {
  usePageTitle('Makoto');

  const [stage, setStage] = useState('cipher');
  const [cipherShift, setCipherShift] = useState(0);
  const [cipherMessage, setCipherMessage] = useState('');
  const [answers, setAnswers] = useState(createInitialAnswers);
  const [puzzleMessage, setPuzzleMessage] = useState('');
  const [revealKey, setRevealKey] = useState(0);

  const decodedPreview = useMemo(() => decodeCaesar(CIPHER_TEXT, cipherShift), [cipherShift]);
  const confetti = useMemo(
    () => Array.from({ length: 18 }, (_, index) => ({
      id: index,
      left: `${5 + ((index * 89) % 92)}%`,
      delay: `${(index % 6) * 0.22}s`,
      duration: `${3.6 + (index % 5) * 0.32}s`,
      color: ['#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'][index % 4],
      rotate: `${-18 + index * 7}deg`,
    })),
    [],
  );

  const submitCipher = () => {
    if (normalizeText(decodedPreview) === normalizeText(CIPHER_TARGET)) {
      setCipherMessage('');
      setStage('puzzle');
      return;
    }

    setCipherMessage('The margin note is still scrambled. Makoto would shift it back three places.');
  };

  const chooseGuest = (puzzleId, guestId) => {
    setAnswers((current) => ({
      ...current,
      [puzzleId]: guestId,
    }));
    setPuzzleMessage('');
  };

  const submitPuzzle = () => {
    const isComplete = CHARACTER_PUZZLES.every((puzzle) => answers[puzzle.id] === puzzle.answer);

    if (!isComplete) {
      setPuzzleMessage('A few guest notes are matched to the wrong person. Check the character vibes again.');
      return;
    }

    setPuzzleMessage('');
    setRevealKey((value) => value + 1);
    setStage('reveal');
  };

  const restartExperience = () => {
    setStage('cipher');
    setCipherShift(0);
    setCipherMessage('');
    setAnswers(createInitialAnswers());
    setPuzzleMessage('');
    setRevealKey(0);
  };

  return (
    <main className="makoto-secret-page">
      <div className="makoto-secret-page__wash" aria-hidden="true" />
      <section className="makoto-secret-page__content">
        <header className="makoto-secret-page__header">
          <p className="makoto-secret-page__eyebrow">Hidden notebook page</p>
          <h1 className="makoto-secret-page__title">Makoto&apos;s birthday notebook</h1>
          <p className="makoto-secret-page__intro">
            Crack the cipher, match the guest list, and let the surprise finally open.
          </p>
          <div className="makoto-secret-page__meta">
            <progress value={getStageNumber(stage)} max="3" className="makoto-secret-page__progress">
              {getStageNumber(stage)} / 3
            </progress>
            <span>Stage {getStageNumber(stage)} of 3</span>
          </div>
        </header>

        <article className="makoto-notebook">
          <div className="makoto-notebook__shadow" aria-hidden="true" />
          <div className="makoto-notebook__binding" aria-hidden="true">
            {Array.from({ length: 10 }, (_, index) => (
              <span key={index} className="makoto-notebook__ring" />
            ))}
          </div>
          <section className="makoto-notebook__paper">
            {stage === 'cipher' && (
              <div className="makoto-sheet makoto-sheet--intro">
                <p className="makoto-sheet__label">Phase 1 · Cryptography</p>
                <h2 className="makoto-sheet__title">Shift the notebook margin back into place</h2>
                <p className="makoto-sheet__copy">
                  The note was pushed three letters forward. Roll the wheel backward until Makoto&apos;s
                  real words appear.
                </p>

                <section className="makoto-cipher-card" aria-label="Cipher puzzle">
                  <div>
                    <p className="makoto-cipher-card__label">Encoded note</p>
                    <output className="makoto-cipher-card__code">{CIPHER_TEXT}</output>
                  </div>

                  <div className="makoto-cipher-card__controls">
                    <button
                      type="button"
                      className="makoto-button makoto-button--secondary"
                      onClick={() => setCipherShift((value) => (value + 25) % 26)}
                    >
                      Shift back
                    </button>
                    <div className="makoto-cipher-card__dial" aria-live="polite">
                      <span className="makoto-cipher-card__dial-label">Current shift</span>
                      <strong>{cipherShift}</strong>
                    </div>
                    <button
                      type="button"
                      className="makoto-button makoto-button--secondary"
                      onClick={() => setCipherShift((value) => (value + 1) % 26)}
                    >
                      Shift forward
                    </button>
                  </div>

                  <div>
                    <p className="makoto-cipher-card__label">Preview</p>
                    <output className="makoto-cipher-card__preview">{decodedPreview}</output>
                  </div>
                </section>

                {cipherMessage && (
                  <p className="makoto-sheet__feedback" role="status">
                    {cipherMessage}
                  </p>
                )}

                <div className="makoto-sheet__actions">
                  <button type="button" className="makoto-button" onClick={submitCipher}>
                    Turn to the next page
                  </button>
                  <a href="/" className="makoto-link-button">
                    Back to tracker
                  </a>
                </div>
              </div>
            )}

            {stage === 'puzzle' && (
              <div className="makoto-sheet">
                <p className="makoto-sheet__label">Phase 2 · Character puzzle</p>
                <h2 className="makoto-sheet__title">Match each note to the friend who would show up</h2>
                <p className="makoto-sheet__copy">
                  Makoto&apos;s guest list is written in feelings, not names. Read the clue, then choose the
                  classmate who fits it best.
                </p>

                <div className="makoto-puzzle-list">
                  {CHARACTER_PUZZLES.map((puzzle, index) => (
                    <section key={puzzle.id} className="makoto-puzzle-card">
                      <p className="makoto-puzzle-card__count">Clue {index + 1}</p>
                      <p className="makoto-puzzle-card__prompt">{puzzle.clue}</p>

                      <div className="makoto-guest-grid" role="group" aria-label={`Choices for clue ${index + 1}`}>
                        {GUESTS.map((guest) => {
                          const isSelected = answers[puzzle.id] === guest.id;
                          return (
                            <button
                              key={`${puzzle.id}-${guest.id}`}
                              type="button"
                              className={`makoto-guest-card${isSelected ? ' makoto-guest-card--selected' : ''}`}
                              style={{ '--makoto-accent': guest.accent }}
                              onClick={() => chooseGuest(puzzle.id, guest.id)}
                              aria-pressed={isSelected}
                            >
                              <img src={guest.image} alt="" className="makoto-guest-card__image" />
                              <span className="makoto-guest-card__name">{guest.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>

                {puzzleMessage && (
                  <p className="makoto-sheet__feedback" role="status">
                    {puzzleMessage}
                  </p>
                )}

                <div className="makoto-sheet__actions">
                  <button type="button" className="makoto-button" onClick={submitPuzzle}>
                    Open the surprise
                  </button>
                  <button
                    type="button"
                    className="makoto-link-button makoto-link-button--button"
                    onClick={() => setStage('cipher')}
                  >
                    Recheck the cipher
                  </button>
                </div>
              </div>
            )}

            {stage === 'reveal' && (
              <div className="makoto-sheet makoto-sheet--reveal">
                <p className="makoto-sheet__label">Phase 3 · Reveal</p>
                <h2 className="makoto-sheet__title">The notebook opens all the way</h2>
                <p className="makoto-sheet__copy">
                  Everyone finally steps into the margin and the birthday message lands where it belongs.
                </p>

                <section key={revealKey} className="makoto-scene" aria-label="Makoto birthday reveal">
                  <div className="makoto-scene__confetti" aria-hidden="true">
                    {confetti.map((piece) => (
                      <span
                        key={piece.id}
                        className="makoto-scene__confetti-piece"
                        style={{
                          '--left': piece.left,
                          '--delay': piece.delay,
                          '--duration': piece.duration,
                          '--color': piece.color,
                          '--rotate': piece.rotate,
                        }}
                      />
                    ))}
                  </div>

                  <p className="makoto-scene__banner">Happy Birthday, Makoto</p>

                  <div className="makoto-scene__floor" aria-hidden="true" />

                  {REVEAL_FRIENDS.map((friend) => (
                    <figure key={friend.name} className={`makoto-scene__friend ${friend.className}`}>
                      <img src={friend.image} alt={friend.name} className="makoto-scene__friend-image" />
                    </figure>
                  ))}

                  <figure className="makoto-scene__makoto">
                    <img src="/characters/5c.png" alt="Makoto" className="makoto-scene__friend-image" />
                  </figure>

                  <aside className="makoto-scene__note">
                    <p className="makoto-scene__note-label">Birthday note</p>
                    <p>
                      Happy birthday to the quiet reader in the middle of the noise. May this year bring soft
                      courage, honest rooms, and people who keep showing up.
                    </p>
                  </aside>
                </section>

                <div className="makoto-sheet__actions">
                  <button
                    type="button"
                    className="makoto-button"
                    onClick={() => setRevealKey((value) => value + 1)}
                  >
                    Replay the reveal
                  </button>
                  <button
                    type="button"
                    className="makoto-link-button makoto-link-button--button"
                    onClick={restartExperience}
                  >
                    Start over
                  </button>
                  <a href="/" className="makoto-link-button">
                    Back to tracker
                  </a>
                </div>
              </div>
            )}
          </section>
        </article>
      </section>
    </main>
  );
}

export default MakotoBirthday;
