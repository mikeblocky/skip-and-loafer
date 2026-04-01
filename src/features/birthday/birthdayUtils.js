export const isBirthdayToday = (month, day, referenceDate = new Date()) =>
  referenceDate.getMonth() + 1 === month && referenceDate.getDate() === day;

export const hasBirthdayPassed = (month, day, referenceDate = new Date()) =>
  new Date(referenceDate.getFullYear(), month - 1, day, 23, 59, 59) <
  new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

export const getDaysUntilBirthday = (month, day, referenceDate = new Date()) => {
  const year = referenceDate.getFullYear();
  let birthday = new Date(year, month - 1, day);

  if (birthday.getMonth() === referenceDate.getMonth() && birthday.getDate() === referenceDate.getDate()) {
    return 0;
  }

  if (birthday < referenceDate) {
    birthday = new Date(year + 1, month - 1, day);
  }

  return Math.ceil((birthday - referenceDate) / 864e5);
};

export const getBirthdayStatus = (month, day, referenceDate = new Date()) => ({
  isToday: isBirthdayToday(month, day, referenceDate),
  passed: hasBirthdayPassed(month, day, referenceDate),
  daysUntil: getDaysUntilBirthday(month, day, referenceDate),
});

export const buildBirthdayMonthLabels = (locale, year = new Date().getFullYear()) =>
  Array.from({ length: 12 }, (_, index) => {
    const date = new Date(year, index, 1);
    return new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
  });

export const groupBirthdaysByMonth = (birthdays) => {
  const grouped = {};

  for (let month = 1; month <= 12; month += 1) {
    grouped[month] = [];
  }

  birthdays.forEach((birthday) => {
    grouped[birthday.month].push(birthday);
  });

  Object.values(grouped).forEach((entries) => {
    entries.sort((left, right) => left.day - right.day);
  });

  return grouped;
};

export const findTodayBirthday = (birthdays, referenceDate = new Date()) =>
  birthdays.find((birthday) => isBirthdayToday(birthday.month, birthday.day, referenceDate)) || null;

export const findNextBirthday = (birthdays, referenceDate = new Date()) =>
  birthdays
    .filter((birthday) => !isBirthdayToday(birthday.month, birthday.day, referenceDate))
    .slice()
    .sort(
      (left, right) =>
        getDaysUntilBirthday(left.month, left.day, referenceDate) -
        getDaysUntilBirthday(right.month, right.day, referenceDate),
    )[0] || null;
