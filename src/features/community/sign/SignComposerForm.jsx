import { LoaderCircle, Send, UserRound } from 'lucide-react';
import {
  COMMUNITY_FONT_FAMILY,
  COMMUNITY_INPUT_STYLE,
  COMMUNITY_TEXTAREA_STYLE,
  createCommunityButtonStyle,
} from '../communityTheme';

const SignComposerForm = ({
  copy,
  name,
  message,
  isSubmitting,
  onNameChange,
  onMessageChange,
  onClose,
  onSubmit,
}) => (
  <form onSubmit={onSubmit} style={{ display: 'grid', gap: '12px' }}>
    <p style={{ margin: 0, color: '#7c2d12', lineHeight: 1.6 }}>
      {copy.subtitle}
    </p>

    <label style={{ display: 'grid', gap: '8px' }}>
      <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#9a3412', fontSize: '0.95rem' }}>
        {copy.nameLabel}
      </span>
      <div style={{ position: 'relative' }}>
        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={copy.namePlaceholder}
          maxLength={48}
          style={{ ...COMMUNITY_INPUT_STYLE, paddingLeft: '44px' }}
        />
        <UserRound
          size={18}
          strokeWidth={2.3}
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#f97316' }}
        />
      </div>
    </label>

    <label style={{ display: 'grid', gap: '8px' }}>
      <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#9a3412', fontSize: '0.95rem' }}>
        {copy.messageLabel}
      </span>
      <textarea
        value={message}
        onChange={(event) => onMessageChange(event.target.value)}
        placeholder={copy.messagePlaceholder}
        maxLength={280}
        style={COMMUNITY_TEXTAREA_STYLE}
      />
    </label>

    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={onClose}
        style={createCommunityButtonStyle({
          borderColor: '#cbd5e1',
          bottomColor: '#94a3b8',
          background: '#ffffff',
          color: '#475569',
        })}
      >
        {copy.close}
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          ...createCommunityButtonStyle({
            borderColor: '#fdba74',
            bottomColor: '#f97316',
            background: '#f97316',
          }),
          opacity: isSubmitting ? 0.72 : 1,
        }}
      >
        {isSubmitting ? <LoaderCircle size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Send size={18} strokeWidth={2.5} />}
        {isSubmitting ? copy.posting : copy.submit}
      </button>
    </div>
  </form>
);

export default SignComposerForm;
