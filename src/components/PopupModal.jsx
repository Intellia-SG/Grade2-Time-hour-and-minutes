import React, { useEffect } from 'react';
import { sounds } from '../utils/audio';

/**
 * Reusable animated popup modal for:
 * - Instructions
 * - Hints
 * - Success messages
 * - Error/Retry messages
 * - Achievement Unlocks
 * - Exit Confirmation
 * - Completion Summaries
 */
export default function PopupModal({
  isOpen,
  onClose,
  type = 'info', // 'info' | 'hint' | 'success' | 'error' | 'achievement' | 'confirm'
  title,
  icon,
  children,
  primaryAction,
  secondaryAction,
}) {
  useEffect(() => {
    if (isOpen) {
      if (type === 'success' || type === 'achievement') sounds.correct();
      else if (type === 'error') sounds.wrong();
      else if (type === 'hint' || type === 'info') sounds.click();
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const typeStyles = {
    info: { border: '2px solid rgba(255,193,7,0.4)', headerBg: 'rgba(255,193,7,0.15)' },
    hint: { border: '2px solid var(--gold)', headerBg: 'rgba(255,193,7,0.2)' },
    success: { border: '2px solid var(--green)', headerBg: 'rgba(76,175,80,0.2)' },
    error: { border: '2px solid var(--red)', headerBg: 'rgba(239,83,80,0.2)' },
    achievement: { border: '2px solid var(--gold-light)', headerBg: 'linear-gradient(135deg, rgba(255,193,7,0.3), rgba(255,112,67,0.3))' },
    confirm: { border: '2px solid var(--coral)', headerBg: 'rgba(255,112,67,0.2)' },
  };

  const currentStyle = typeStyles[type] || typeStyles.info;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`popup-modal ${type}`}
        style={{ border: currentStyle.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="popup-modal-header" style={{ background: currentStyle.headerBg }}>
          <span className="popup-modal-icon">{icon || (type === 'hint' ? '💡' : type === 'success' ? '🎉' : type === 'error' ? '💡' : type === 'achievement' ? '🏆' : 'ℹ️')}</span>
          <h3 className="popup-modal-title"><strong>{title}</strong></h3>
          {onClose && (
            <button className="popup-modal-close" onClick={onClose} aria-label="Close modal">
              ✕
            </button>
          )}
        </div>

        <div className="popup-modal-body">
          {children}
        </div>

        {(primaryAction || secondaryAction) && (
          <div className="popup-modal-actions">
            {secondaryAction && (
              <button
                className="btn btn-outline btn-sm"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button
                className={`btn ${type === 'success' || type === 'achievement' ? 'btn-green' : 'btn-primary'} btn-sm`}
                onClick={primaryAction.onClick}
              >
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
