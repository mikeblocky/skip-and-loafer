import { motion } from 'framer-motion';
import { Package, PawPrint, UserCheck } from 'lucide-react';
import { triggerHaptic } from '../../../utils/haptics';
import { toMysteryLabelCase } from '../quizGame/ui';

const cardBaseStyle = {
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '14px',
};

const MysteryMenuCard = ({ isMobile, icon: Icon, option, onSelect }) => (
  <motion.button
    onClick={() => {
      triggerHaptic('selection');
      onSelect(option.view);
    }}
    whileHover={{ scale: 1.06, rotate: option.hoverRotate, y: -6 }}
    whileTap={{ scale: 0.9, y: 12 }}
    className="sketchbook-border paper-interact"
    style={{
      ...cardBaseStyle,
      background: option.theme.background,
      border: `3.5px solid ${option.theme.border}`,
      borderBottom: `9.5px solid ${option.theme.borderBottom}`,
      padding: isMobile ? '24px 20px' : '32px 48px',
      borderRadius: '28px',
      width: isMobile ? 'min(100%, 320px)' : '280px',
      boxShadow: option.theme.shadow,
    }}
  >
    <Icon size={isMobile ? 42 : 54} color={option.theme.borderBottom} strokeWidth={3.5} />
    <span style={{ fontSize: isMobile ? '1.45rem' : '1.65rem', color: option.theme.titleColor }}>
      {toMysteryLabelCase(option.title)}
    </span>
    <span style={{ color: option.theme.borderBottom, fontSize: isMobile ? '1rem' : '1.1rem' }}>
      {option.description}
    </span>
  </motion.button>
);

const MysteryMenu = ({ isMobile, t, animalQuizCopy, onSelectView, uiLanguage }) => {
  const animalQuizTitle = uiLanguage === 'ja'
    ? 'あなたはどの動物？'
    : animalQuizCopy.menuTitle;
  const animalQuizDescription = uiLanguage === 'ja'
    ? 'サトノスケ、オシオ、オミソに近い本能を探す深めのクイズです。'
    : animalQuizCopy.menuDescription;

  const menuOptions = [

    {
      view: 'quiz',
      icon: UserCheck,
      title: t.mystery.whoAreYou,
      description: t.mystery.whoAreYouDesc,
      hoverRotate: 2,
      theme: {
        background: '#eff6ff',
        border: '#60a5fa',
        borderBottom: '#2563eb',
        titleColor: '#1e40af',
        shadow: '0 12px 32px rgba(37, 99, 235, 0.15)',
      },
    },
    {
      view: 'animalQuiz',
      icon: PawPrint,
      title: animalQuizTitle,
      description: animalQuizDescription,
      hoverRotate: -1,
      theme: {
        background: '#ecfdf5',
        border: '#34d399',
        borderBottom: '#059669',
        titleColor: '#047857',
        shadow: '0 12px 32px rgba(5, 150, 105, 0.15)',
      },
    },
  ];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: isMobile ? '32px' : '48px',
        justifyContent: 'center',
        padding: isMobile ? '20px 0' : '40px 0',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: isMobile ? '1.1rem' : '1.4rem', color: '#6b7280', margin: 0 }}>{t.mystery.subtitle}</p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '24px' : '32px',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {menuOptions.map((option) => (
          <MysteryMenuCard
            key={option.view}
            isMobile={isMobile}
            icon={option.icon}
            option={option}
            onSelect={onSelectView}
          />
        ))}
      </div>
    </div>
  );
};

export default MysteryMenu;
