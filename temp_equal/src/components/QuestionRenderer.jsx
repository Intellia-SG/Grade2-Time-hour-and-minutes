import React, { useState, useCallback } from 'react';
import EqualGroupDiagram from './EqualGroupDiagram';

// Visual aids for equal group questions
function Visual({ question }) {
  if (!question.visual) return null;

  if (question.visual === 'groupDiagram') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <EqualGroupDiagram
          numGroups={question.numGroups}
          groupSize={question.groupSize}
          missingSlot={question.missingSlot}
          objectEmoji={question.objectEmoji || '⭐'}
          animated={true}
          size="small"
        />
      </div>
    );
  }

  if (question.visual === 'picture') {
    // Render emoji groups visually
    if (question.numGroups && question.groupSize) {
      return (
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', margin: '20px 0' }}>
          {Array.from({ length: question.numGroups }, (_, gi) => (
            <div key={gi} style={{
              display: 'flex', gap: 4, padding: '8px 12px',
              background: 'rgba(255,255,255,0.06)', borderRadius: 12,
              border: '2px solid rgba(255,255,255,0.1)',
            }}>
              {Array.from({ length: question.groupSize }, (_, di) => (
                <span key={di} style={{ fontSize: '1.6rem' }}>{question.objectEmoji || '⭐'}</span>
              ))}
            </div>
          ))}
        </div>
      );
    }
    return null;
  }

  // sentence: no extra visual
  return null;
}

// Main Question Renderer
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
      <div style={{ display: 'inline-block', background: 'var(--coral)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, marginBottom: 12, letterSpacing: '0.5px' }}>
        🍓 EQUAL GROUPS
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
