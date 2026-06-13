import React, { useState, useCallback } from 'react';
import AnalogClock from './AnalogClock';

function Visual({ question }) {
  if (!question.visual) return null;

  if (question.visual === 'clock' && question.clockTime) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <AnalogClock
          hour={question.clockTime.hour}
          minute={question.clockTime.minute}
          mode="display"
          size={180}
        />
      </div>
    );
  }

  return null;
}

export default function QuestionRenderer({ question, onAnswer, disabled }) {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionClick = useCallback((option) => {
    if (disabled) return;
    setSelectedOption(option);
    const isCorrect = String(option) === String(question.correctAnswer);
    setTimeout(() => {
      onAnswer(isCorrect);
      setSelectedOption(null);
    }, 600);
  }, [disabled, question.correctAnswer, onAnswer]);

  return (
    <div>
      <div style={{
        display: 'inline-block',
        background: 'var(--coral)',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 700,
        marginBottom: 12,
        letterSpacing: '0.5px'
      }}>
        ⏰ TIME CHALLENGE
      </div>
      <p className="question-text">{question.questionText}</p>

      <Visual question={question} />

      {question.options && (
        <div className="options-grid">
          {question.options.map((opt, i) => {
            let cls = 'option-btn';
            if (disabled) cls += ' disabled';
            if (selectedOption === opt) {
              cls += String(opt) === String(question.correctAnswer) ? ' correct' : ' wrong';
            } else if (disabled && String(opt) === String(question.correctAnswer)) {
              cls += ' correct';
            }
            return (
              <button key={i} className={cls} onClick={() => handleOptionClick(opt)}>
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
