export interface Holiday {
  title: string;
  start: string;
  end?: string;
  display?: 'background' | 'block' | 'list-item';
  color?: string;
  textColor?: string;
  allDay?: boolean;
}

export const HOLIDAYS_2026: Holiday[] = [
  { title: '신정', start: '2026-01-01', allDay: true },
  { title: '설날 연휴', start: '2026-02-16', end: '2026-02-19', allDay: true }, // 16, 17, 18
  { title: '삼일절', start: '2026-03-01', allDay: true },
  { title: '대체공휴일 (삼일절)', start: '2026-03-02', allDay: true },
  { title: '어린이날', start: '2026-05-05', allDay: true },
  { title: '부처님오신날', start: '2026-05-24', allDay: true },
  { title: '대체공휴일 (부처님오신날)', start: '2026-05-25', allDay: true },
  { title: '현충일', start: '2026-06-06', allDay: true },
  { title: '광복절', start: '2026-08-15', allDay: true },
  { title: '대체공휴일 (광복절)', start: '2026-08-17', allDay: true },
  { title: '추석 연휴', start: '2026-09-24', end: '2026-09-27', allDay: true }, // 24, 25, 26
  { title: '개천절', start: '2026-10-03', allDay: true },
  { title: '대체공휴일 (개천절)', start: '2026-10-05', allDay: true },
  { title: '한글날', start: '2026-10-09', allDay: true },
  { title: '성탄절', start: '2026-12-25', allDay: true },
];
