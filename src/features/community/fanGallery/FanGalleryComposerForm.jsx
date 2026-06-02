import { ImagePlus, LoaderCircle, Shield, Upload, UserRound } from 'lucide-react';
import {
  COMMUNITY_FONT_FAMILY,
  COMMUNITY_INPUT_STYLE,
  COMMUNITY_PANEL_STYLE,
  COMMUNITY_TEXTAREA_STYLE,
  createCommunityButtonStyle,
} from '../communityTheme';

const FanGalleryComposerForm = ({
  copy,
  name,
  description,
  preparedImage,
  isPreparing,
  isSubmitting,
  onNameChange,
  onDescriptionChange,
  onFileChange,
  onClose,
  onSubmit,
}) => (
  <form onSubmit={onSubmit} style={{ display: 'grid', gap: '12px' }}>
    <p style={{ margin: 0, color: 'var(--text-secondary, #334155)', lineHeight: 1.6 }}>
      {copy.subtitle}
    </p>

    <label style={{ display: 'grid', gap: '8px' }}>
      <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: 'var(--themed-text-secondary, #1d4ed8)', fontSize: '0.95rem' }}>
        {copy.artistLabel}
      </span>
      <div style={{ position: 'relative' }}>
        <input
          className="sketchbook-border"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={copy.artistPlaceholder}
          maxLength={60}
          style={{ ...COMMUNITY_INPUT_STYLE, paddingLeft: '44px' }}
        />
        <UserRound
          size={18}
          strokeWidth={2.3}
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--keycap-color, #2563eb)' }}
        />
      </div>
    </label>

    <label style={{ display: 'grid', gap: '8px' }}>
      <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: 'var(--themed-text-secondary, #1d4ed8)', fontSize: '0.95rem' }}>
        {copy.descriptionLabel}
      </span>
      <textarea
        className="sketchbook-border"
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        placeholder={copy.descriptionPlaceholder}
        maxLength={240}
        style={{ ...COMMUNITY_TEXTAREA_STYLE, minHeight: '112px' }}
      />
    </label>

    <div
      className="sketchbook-border"
      style={{
        ...COMMUNITY_PANEL_STYLE,
        borderStyle: 'dashed',
        borderWidth: '2.5px',
        borderColor: 'var(--themed-card-border, #93c5fd)',
        borderBottomColor: 'var(--themed-card-inactive-border, #60a5fa)',
        background: 'var(--surface-shell, #f8fbff)',
        padding: '14px',
        display: 'grid',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: 'var(--themed-text-secondary, #1d4ed8)', fontSize: '0.95rem' }}>
          {copy.uploadLabel}
        </span>
        <label
          className="sketchbook-border"
          style={{
            ...createCommunityButtonStyle({
              borderColor: 'var(--themed-card-border, #93c5fd)',
              bottomColor: 'var(--themed-card-inactive-border, #60a5fa)',
              background: 'var(--surface-card, #ffffff)',
              color: 'var(--keycap-color, #2563eb)',
            }),
            padding: '12px 16px',
            cursor: 'pointer',
          }}
        >
          {isPreparing ? <LoaderCircle size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Upload size={18} strokeWidth={2.5} />}
          <span style={{ marginLeft: '8px' }}>{isPreparing ? copy.preparing : copy.uploadLabel}</span>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', alignItems: 'start', gap: '10px', color: 'var(--text-secondary, #475569)', lineHeight: 1.55, fontSize: '0.9rem' }}>
        <Shield size={18} strokeWidth={2.3} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--keycap-color, #2563eb)' }} />
        <span>{copy.uploadHint}</span>
      </div>

      <div
        className="sketchbook-border"
        style={{
          ...COMMUNITY_PANEL_STYLE,
          borderColor: 'var(--themed-card-border, #bfdbfe)',
          borderBottomColor: 'var(--themed-card-inactive-border, #60a5fa)',
          background: 'var(--surface-card, #ffffff)',
          padding: '12px',
          minHeight: '220px',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
        }}
      >
        {preparedImage?.dataUrl ? (
          <img
            className="sketchbook-border"
            src={preparedImage.dataUrl}
            alt={copy.previewAlt}
            style={{ width: '100%', height: '100%', maxHeight: '320px', objectFit: 'contain' }}
          />
        ) : (
          <div style={{ color: '#94a3b8', fontFamily: COMMUNITY_FONT_FAMILY, textAlign: 'center', lineHeight: 1.5 }}>
            {isPreparing ? copy.preparing : copy.previewPlaceholder}
          </div>
        )}
      </div>

      {preparedImage && (
        <div style={{ color: 'var(--text-secondary, #475569)', fontSize: '0.92rem', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--themed-text-secondary, #1d4ed8)' }}>{copy.dimensionsLabel}:</strong>{' '}
          {preparedImage.width} x {preparedImage.height}
        </div>
      )}
    </div>

    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
      <button
        className="sketchbook-border"
        type="button"
        onClick={onClose}
        style={createCommunityButtonStyle({
          borderColor: 'var(--surface-border, #cbd5e1)',
          bottomColor: 'var(--surface-border-strong, #94a3b8)',
          background: 'var(--surface-card, #ffffff)',
          color: 'var(--text-secondary, #475569)',
        })}
      >
        {copy.close}
      </button>
      <button
        className="sketchbook-border"
        type="submit"
        disabled={isSubmitting || isPreparing}
        style={{
          ...createCommunityButtonStyle({
            borderColor: '#93c5fd',
            bottomColor: '#2563eb',
            background: '#2563eb',
          }),
          opacity: isSubmitting || isPreparing ? 0.72 : 1,
        }}
      >
        {isSubmitting ? <LoaderCircle size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ImagePlus size={18} strokeWidth={2.5} />}
        <span style={{ marginLeft: '8px' }}>{isSubmitting ? copy.posting : copy.submit}</span>
      </button>
    </div>
  </form>
);

export default FanGalleryComposerForm;
