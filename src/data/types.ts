export interface Slot {
  subject_id: string;
  start: string;
  end: string;
  type: "P" | "V";
  group: string | null;
  prof: string;
  room: string;
  status: "M" | "E";
  note?: string;
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
  group_reason: string;
  active_slots_summary: string;
  notes?: string;
}

export interface ClashResolved {
  description: string;
  resolution: string;
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
    student_context: string;
    generated: string;
  };
  status_definitions: Record<string, string>;
  type_definitions: Record<string, string>;
  subjects: Subject[];
  personal_schedule: Record<string, Slot[]>;
  clashes_resolved: ClashResolved[];
  day_time_slots: TimeSlot[];
  days_order: string[];
  display_notes: string[];
}
