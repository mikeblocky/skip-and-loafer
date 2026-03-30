// src/pages/ChatPage.jsx
import { CHAT_FONT_FAMILY } from '../features/chat/chatConstants';
import { useChatManager } from '../features/chat/hooks/useChatManager';
import { ChatLobby } from '../features/chat/components/ChatLobby';
import { ChatActiveRoom } from '../features/chat/components/ChatActiveRoom';

export const ChatPage = ({ isMobile, uiLanguage = 'en', syncData }) => {
  const { state, actions, refs } = useChatManager(isMobile, uiLanguage, syncData);
  const pagePadding = state.room
    ? (isMobile ? '4px 10px' : '10px 24px 6px 24px')
    : (isMobile ? '8px 12px' : '24px 32px 12px 32px');

  return (
    <div
      className="planner-container planner-page"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        minHeight: isMobile ? 'calc(100dvh - 90px)' : 'calc(100vh - 80px)',
        padding: pagePadding,
        fontFamily: CHAT_FONT_FAMILY,
        fontWeight: 400,
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {state.room && (
        <div 
          style={{ 
            display: 'flex', 
            width: '100%', 
            maxWidth: '1600px',
            height: '100%', 
            padding: isMobile ? '0' : '2px 0 12px', 
            gap: '12px' 
          }}
        >
          <div style={{ flex: 1, minWidth: 0, height: '100%', width: '100%' }}>
            <ChatActiveRoom 
              isMobile={isMobile} 
              copy={state.copy} 
              state={{...state, ...refs}} 
              actions={actions} 
            />
          </div>
        </div>
      )}
      {!state.room && (
         <div style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '1600px', flex: 1, height: '100%', minHeight: 0 }}>
           <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <ChatLobby isMobile={isMobile} copy={state.copy} state={state} actions={actions} />
           </div>
         </div>
      )}
    </div>
  );
};

export default ChatPage;
