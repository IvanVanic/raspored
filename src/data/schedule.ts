import scheduleData from "@/data/schedule-data.json";
import type { ScheduleData } from "@/data/types";

export const data = scheduleData as unknown as ScheduleData;
export const subjectMap = new Map(data.subjects.map((s) => [s.id, s]));
