import { useMemo } from 'react';
import usePageTitle from '../hooks/shared/usePageTitle';
import APP_UI_TEXT_GLOBAL from '../config/appUiText';
import BirthdayBackgroundDecor from '../features/birthday/BirthdayBackgroundDecor';
import BirthdayFeaturedHero from '../features/birthday/BirthdayFeaturedHero';
import BirthdayFooter from '../features/birthday/BirthdayFooter';
import BirthdayHeader from '../features/birthday/BirthdayHeader';
import BirthdayMonthCard from '../features/birthday/BirthdayMonthCard';
import { getBirthdayLocale, getBirthdayText } from '../features/birthday/birthdayCopy';
import { BIRTHDAYS } from '../features/birthday/birthdayData';
import {
  buildBirthdayMonthLabels,
  findNextBirthday,
  findTodayBirthday,
  groupBirthdaysByMonth,
} from '../features/birthday/birthdayUtils';

const BirthdayPage = ({ isMobile, uiLanguage = 'en', reduceMotion = false, simplifyVisuals = false }) => {
  const t = getBirthdayText(uiLanguage);
  const tGlobal = APP_UI_TEXT_GLOBAL[uiLanguage] || APP_UI_TEXT_GLOBAL.en;

  usePageTitle(tGlobal.tabs?.birthdays?.label || 'Birthdays');

  const locale = getBirthdayLocale(uiLanguage);
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const monthLabels = useMemo(
    () => buildBirthdayMonthLabels(locale, currentYear),
    [locale, currentYear],
  );
  const birthdaysByMonth = useMemo(() => groupBirthdaysByMonth(BIRTHDAYS), []);

  const todayBirthday = findTodayBirthday(BIRTHDAYS, today);
  const nextBirthday = findNextBirthday(BIRTHDAYS, today);
  const featuredBirthday = todayBirthday || nextBirthday;

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        padding: isMobile ? '24px 16px 40px 16px' : '28px 40px 60px 40px',
        background: '#ffffff',
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #eef1f6 32px)',
        backgroundSize: '100% 32px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
        position: 'relative',
      }}
    >
      <BirthdayHeader isMobile={isMobile} title={t.title} />

      <BirthdayFeaturedHero
        isMobile={isMobile}
        featuredBirthday={featuredBirthday}
        isBirthdayToday={Boolean(todayBirthday)}
        t={t}
        referenceDate={today}
        uiLanguage={uiLanguage}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: isMobile ? '24px' : '32px',
          width: '100%',
          zIndex: 5,
        }}
      >
        {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
          <BirthdayMonthCard
            key={month}
            month={month}
            birthdays={birthdaysByMonth[month]}
            isMobile={isMobile}
            isCurrentMonth={month === currentMonth}
            t={t}
            monthLabels={monthLabels}
            reduceMotion={reduceMotion}
            referenceDate={today}
            uiLanguage={uiLanguage}
          />
        ))}
      </div>

      <BirthdayFooter
        isMobile={isMobile}
        count={BIRTHDAYS.length}
        label={t.characters}
        year={currentYear}
      />

      <BirthdayBackgroundDecor
        reduceMotion={reduceMotion}
        simplifyVisuals={simplifyVisuals}
      />
    </div>
  );
};

export default BirthdayPage;
