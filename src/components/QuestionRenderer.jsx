import React, { useState, useCallback, useEffect } from 'react';
import AnalogClock from './AnalogClock';
import PopupModal from './PopupModal';
import { speak, narrate, sounds } from '../utils/audio';

function Visual({ question }) {
  if (!question.visual) return null;

  if (question.visual === 'clock' && question.clockTime) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <AnalogClock
          hour={question.clockTime.hour}
          minute={question.clockTime.minute}
          mode="display"
          size={190}
        />
      </div>
    );
  }

  return null;
}

export default function QuestionRenderer({ question, onAnswer, disabled, audioEnabled }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showHintModal, setShowHintModal] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [failedAttempt, setFailedAttempt] = useState(null);

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setShowHintModal(false);
    setAttemptCount(0);
    setFailedAttempt(null);
  }, [question]);

  const readQuestionAudio = useCallback(() => {
    if (question?.questionText) {
      speak(question.questionText, true);
    }
  }, [question]);

  const handleOptionClick = useCallback((option) => {
    if (disabled) return;
    setSelectedOption(option);
    sounds.click();

    const isCorrect = String(option) === String(question.correctAnswer);
    const newCount = attemptCount + 1;
    setAttemptCount(newCount);

    if (isCorrect) {
      setTimeout(() => {
        onAnswer(true, newCount);
        setSelectedOption(null);
      }, 500);
    } else {
      setFailedAttempt(option);
      // Give feedback for incorrect attempt
      setTimeout(() => {
        onAnswer(false, newCount);
        if (newCount < 2) {
          // Allow another attempt after showing hint!
          setShowHintModal(true);
        }
      }, 800);
    }
  }, [disabled, question, attemptCount, onAnswer]);

  const readHintAudio = () => {
    const hintText = `${question.hint1 || ''} ${question.hint2 || ''}`;
    if (hintText.trim()) {
      speak(hintText, true);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Category Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{
          background: 'var(--coral)',
          color: 'white',
          padding: '6px 18px',
          borderRadius: 'var(--radius-full)',
          fontSize: '1rem',
          fontWeight: 800,
          letterSpacing: '0.5px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          ⏰ <strong>TIME CHALLENGE</strong>
        </div>
      </div>

      {/* Question Text */}
      <h3 className="question-text" style={{ margin: '8px 0 16px' }}>
        {question.questionText}
      </h3>

      {/* Visual Component */}
      <Visual question={question} />

      {/* Options Grid */}
      {question.options && (
        <div className="options-grid">
          {question.options.map((opt, i) => {
            let cls = 'option-btn';
            if (disabled) cls += ' disabled';
            if (selectedOption === opt) {
              cls += String(opt) === String(question.correctAnswer) ? ' correct' : ' wrong';
            } else if (disabled && String(opt) === String(question.correctAnswer)) {
              cls += ' correct';
            } else if (failedAttempt === opt) {
              cls += ' wrong';
            }

            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleOptionClick(opt)}
                disabled={disabled}
              >
                <strong>{opt}</strong>
              </button>
            );
          })}
        </div>
      )}

      {/* Action Row with Hint Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => {
            setShowHintModal(true);
            readHintAudio();
          }}
          style={{ gap: '6px', padding: '8px 20px', fontSize: '1rem' }}
        >
          💡 <strong>Need a Hint?</strong>
        </button>
      </div>

      {/* Hint Modal Popup */}
      <PopupModal
        isOpen={showHintModal}
        onClose={() => setShowHintModal(false)}
        type="hint"
        title="Helpful Hint"
        icon="💡"
        primaryAction={{
          label: 'Got it! Try Again',
          onClick: () => setShowHintModal(false)
        }}
      >
        <div style={{ textAlign: 'left', lineHeight: '1.6', fontSize: '1.15rem' }}>
          {question.hint1 && (
            <p style={{ marginBottom: 10 }}>
              🔹 <strong>Step 1:</strong> {question.hint1}
            </p>
          )}
          {question.hint2 && (
            <p style={{ marginBottom: 12 }}>
              🔹 <strong>Step 2:</strong> {question.hint2}
            </p>
          )}
          <button
            className="btn btn-outline btn-sm"
            onClick={readHintAudio}
            style={{ marginTop: 8, padding: '6px 14px', fontSize: '0.95rem' }}
          >
            🔊 <strong>Listen to Hint</strong>
          </button>
        </div>
      </PopupModal>
    </div>
  );
}
