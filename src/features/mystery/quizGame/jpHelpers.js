export const formatQuizEvidenceLabel = (uiLanguage, questionText, actionText, suffix = '') => {
  const baseText = String(questionText || '').trim();
  const action = String(actionText || '').trim();
  const extra = String(suffix || '').trim();

  if (uiLanguage === 'ja') {
    return [baseText, action, extra].filter(Boolean).join(' ・ ');
  }

  return [baseText, action, extra].filter(Boolean).join(' -> ');
};

export const formatQuizBinaryLabel = (uiLanguage, isPositive) => {
  if (uiLanguage === 'ja') {
    return isPositive ? 'はい' : 'いいえ';
  }

  return isPositive ? 'yes' : 'no';
};

export const formatQuizConfidenceLabel = (uiLanguage, level) => {
  if (uiLanguage === 'ja') {
    if (level <= 1) return '低めの確信';
    if (level >= 3) return '高めの確信';
    return '中くらいの確信';
  }

  if (level <= 1) return 'low confidence';
  if (level >= 3) return 'high confidence';
  return 'medium confidence';
};
