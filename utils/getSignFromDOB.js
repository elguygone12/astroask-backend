export default function getSignFromDOB(dob) {
  const [dd, mm, yyyy] = dob.split('-').map(Number);
  const m = mm;
  const d = dd;

  const zodiacDates = [
    { sign: 'capricorn', start: [1, 1], end: [1, 19] },
    { sign: 'aquarius', start: [1, 20], end: [2, 18] },
    { sign: 'pisces', start: [2, 19], end: [3, 20] },
    { sign: 'aries', start: [3, 21], end: [4, 19] },
    { sign: 'taurus', start: [4, 20], end: [5, 20] },
    { sign: 'gemini', start: [5, 21], end: [6, 20] },
    { sign: 'cancer', start: [6, 21], end: [7, 22] },
    { sign: 'leo', start: [7, 23], end: [8, 22] },
    { sign: 'virgo', start: [8, 23], end: [9, 22] },
    { sign: 'libra', start: [9, 23], end: [10, 22] },
    { sign: 'scorpio', start: [10, 23], end: [11, 21] },
    { sign: 'sagittarius', start: [11, 22], end: [12, 21] },
    { sign: 'capricorn', start: [12, 22], end: [12, 31] },
  ];

  for (const z of zodiacDates) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if ((m === sm && d >= sd) || (m === em && d <= ed) || (sm < em && m > sm && m < em)) {
      return z.sign;
    }
  }
  return 'aries'; // default fallback
}
