export const POLL_INTERVAL_MS = 3000;
export const ACTIVE_ROOM_POLL_INTERVAL_MS = 1200;
export const MAX_MESSAGE_LENGTH = 500;
export const DRAWING_WIDTH = 560;
export const DRAWING_HEIGHT = 560;
export const MAX_DRAWING_DATA_URL_LENGTH = 250000;
export const TYPING_DEBOUNCE_MS = 1200;
export const DRAWING_COLORS = ['#1f2937', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export const DEFAULT_CHAT_COPY = {
  title: 'Character chat',
  subtitle: 'Pick a portrait card, open a room or join one with a code, and chat in one shared thread.',
  roomRule: 'Each room stays active until the creator ends it. Anyone with the room code can join the thread.',
  safetyTitle: 'Safety first',
  safetyNotice: [
    'Only role-play with clear consent and with people you trust.',
    'Do not pressure anyone into romance, sexual content, personal disclosure, or continued contact.',
    'Stop immediately if the chat becomes abusive, humiliating, threatening, manipulative, or bullying.',
    'Do not share real private information, location, school, workplace, passwords, or financial details.',
    'Leave the room and block/report the person if you feel unsafe, distressed, or targeted.',
  ],
  yourRooms: 'Your rooms',
  publicRooms: 'Public rooms',
  roomDirectory: 'Room directory',
  featuredRooms: 'Discover live public rooms and your saved spaces in one list.',
  searchRooms: 'Search rooms',
  roomInfoTitle: 'Room info',
  roomInfoHint: 'Open the full chat view to talk, draw, and manage the live room without exposing the room code.',
  roomMessagesLabel: 'Messages',
  roomUpdatedLabel: 'Last update',
  roomCharacterLabel: 'Character',
  roomMembersLabel: 'Members',
  visibilityLabel: 'Visibility',
  publicRoom: 'Public',
  privateRoom: 'Private',
  visibilityHint: 'Room visibility is still code-based. Only people with the room code can enter.',
  publicHint: 'Public rooms are visible to everyone here. Private rooms stay local unless you have the code.',
  noRoomsSaved: 'Rooms you create or join on this device will stay here until they end.',
  noPublicRooms: 'No public rooms are live right now.',
  openChat: 'Open chat',
  copyChat: 'Copy chat',
  roomControls: 'Room controls',
  peopleLabel: 'People',
  luckyPick: "I'm feeling lucky",
  exitCharacter: 'Exit character',
  createLabel: 'Create room',
  joinLabel: 'Join room',
  reconnectLabel: 'Reconnect',
  roomTitleLabel: 'Room title',
  roomTitleRequired: 'Add a room name before opening the room.',
  roomCodeLabel: 'Room code',
  portraitLabel: 'Choose your portrait card',
  roomTitlePlaceholder: 'After school rooftop',
  roomCodePlaceholder: 'ABCD-1234',
  messagePlaceholder: 'Message...',
  createAction: 'Open room',
  joinAction: 'Enter room',
  copyCode: 'Copy code',
  refresh: 'Refresh',
  leaveView: 'Leave view',
  endRoom: 'End room',
  you: 'You',
  waiting: 'Waiting for more players to join.',
  activePlayers: 'Players',
  liveRoom: 'Live room',
  latestUpdate: 'Latest update',
  noMessages: 'The room is open. Drop the first message when you are ready.',
  sendAction: 'Send',
  lastRoom: 'Last active room',
  reconnectHint: 'Reconnect to the last room you joined from this browser.',
  noSavedRoom: 'No active room saved',
  drawingLabel: 'Drawing',
  drawAction: 'Draw',
  clearDrawing: 'Clear',
  removeDrawing: 'Remove',
  drawingBrush: 'Brush',
  drawingUndo: 'Undo',
  drawingDone: 'Done',
};

export const PANEL_STYLE = {
  background: '#fffefc',
  border: '3px solid #cbd5e1',
  borderBottom: '8px solid #94a3b8',
  borderRadius: '28px',
  boxShadow: '0 18px 42px rgba(15, 23, 42, 0.12)',
};

export const CHAT_FONT_FAMILY = '"Sniglet", "Coming Soon", cursive';

export const INPUT_STYLE = {
  width: '100%',
  border: '2.5px solid #dbe7f3',
  borderBottom: '5px solid #c7d7ea',
  borderRadius: '16px',
  background: '#ffffff',
  color: '#1e293b',
  padding: '12px 14px',
  fontFamily: CHAT_FONT_FAMILY,
  fontSize: '1.04rem',
  fontWeight: 400,
  lineHeight: 1.4,
  outline: 'none',
};

export const BUTTON_STYLE = {
  border: '3px solid #0f172a',
  borderBottom: '7px solid #0f172a',
  borderRadius: '18px',
  cursor: 'pointer',
  fontFamily: CHAT_FONT_FAMILY,
  fontWeight: 400,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  lineHeight: 1,
};

export const SPIN_ICON_STYLE = {
  animation: 'spin 0.9s linear infinite',
};
