export type Period = 'Day' | 'Week' | 'Month' | 'Custom';

interface Options {
  complete_assignments?: number[];
  rolling_period: boolean;
  start_date: number;
  start_hour: number;
  start_minutes: number;
  period: Period;
  sidebar: boolean;
  dash_courses: boolean;
  due_date_headings: boolean;
  show_locked_assignments: boolean;
  show_confetti: boolean;
  theme_color: string;
  dark_mode: boolean;
  custom_period: number;
}

export default Options;
