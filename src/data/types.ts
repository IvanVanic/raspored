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
