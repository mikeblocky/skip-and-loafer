import { ScanSearch } from 'lucide-react';
import { QuizLoadingCard } from './QuizStagePrimitives';

const QuizLoadingState = ({ isMobile, t }) => (
  <QuizLoadingCard
    isMobile={isMobile}
    icon={ScanSearch}
    title={t.quiz.thinking}
    subtitle={t.quiz.calculating}
  />
);

export default QuizLoadingState;
