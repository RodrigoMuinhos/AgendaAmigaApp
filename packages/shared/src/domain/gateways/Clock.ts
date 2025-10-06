export interface Clock {
  nowUTC(): Date;
  todayAt(timezone: string, hours: number, minutes: number): Date;
  at(timezone: string, date: Date, hours: number, minutes: number): Date;
}
