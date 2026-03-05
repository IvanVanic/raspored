export interface Slot {
  subject_id: string;
  start: string;
  end: string;
  type: "P" | "V";
  group: string | null;
  prof: string;
  room: string;
  status: "M" | "E";
}

export interface Subject {
  id: string;
  full_name: string;
  short_name: string;
  semester: "II" | "IV";
  status: "M" | "E";
  slots: Array<{
    day: string;
    start: string;
    end: string;
    type: string;
    group: string | null;
    prof: string;
    room: string;
  }>;
  assigned_group: string | null;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface ScheduleData {
  meta: {
    title: string;
    program: string;
    faculty: string;
    year: string;
    semester: string;
    generated: string;
  };
  status_definitions: Record<string, string>;
  type_definitions: Record<string, string>;
  subjects: Subject[];
  personal_schedule: Record<string, Slot[]>;
  day_time_slots: TimeSlot[];
  days_order: string[];
}

export interface WeekTopic {
  week: number;
  lecture: string;
  exercise: string;
}

export interface GradingInfo {
  component: string;
  maxPoints: number;
  note?: string;
}

export interface CurriculumEntry {
  subjectId: string;
  weeks: WeekTopic[];
  grading: GradingInfo[];
  exams: string[];
}

export type UrgencyLevel = "critical" | "approaching" | "ambient";

export type SemesterPhase = "settling" | "active" | "endgame";

export interface CriticalDate {
  subjectId: string;
  label: string;
  date: Date | null;
  week: number;
  type: "kolokvij" | "obrana" | "kviz" | "ispit" | "laboratorij" | "predaja" | "zadavanje" | "domaca_zadaca" | "kontrolna";
  urgency: UrgencyLevel;
}

export type EventType = CriticalDate["type"];

export interface TemporalContext {
  currentWeek: number;
  dayOfWeek: number;
  dayName: string | null;
  timeOfDay: "morning" | "afternoon" | "evening";
  isWeekend: boolean;
  semesterProgress: number;
  semesterPhase: SemesterPhase;
  smartDefaultDay: number;
}
