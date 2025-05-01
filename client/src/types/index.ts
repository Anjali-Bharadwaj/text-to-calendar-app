export interface EventData {
  title: string;
  dateTime: {
    start: string; // ISO string
    end: string;   // ISO string
  };
  location?: string;
  description?: string;
}
