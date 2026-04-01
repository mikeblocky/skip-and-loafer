import { UserCheck } from 'lucide-react';
import { QuizIntroCard } from './QuizStagePrimitives';

const QuizIntro = ({ isMobile, t, onStart }) => {
  return (
    <QuizIntroCard
      isMobile={isMobile}
      icon={UserCheck}
      title={t.mystery.whoAreYou}
      description={t.mystery.whoAreYouDesc}
      actionLabel={t.quiz.startBtn}
      onStart={onStart}
    />
  );
};

export default QuizIntro;
