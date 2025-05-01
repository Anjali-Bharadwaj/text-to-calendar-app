import { EventData } from "@/types";

/**
 * Generate an .ics file from event data
 */
export const generateICSFile = (eventData: EventData): string => {
  // Parse dates and create ICS formatted dates
  const startDate = new Date(eventData.dateTime.start);
  const endDate = new Date(eventData.dateTime.end);
  
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const start = formatDate(startDate);
  const end = formatDate(endDate);
  
  // Create ICS content
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `SUMMARY:${eventData.title}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `LOCATION:${eventData.location || ""}`,
    `DESCRIPTION:${eventData.description || ""}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
  
  return icsContent;
};

/**
 * Download the ICS file
 */
export const downloadICS = (eventData: EventData): void => {
  const icsContent = generateICSFile(eventData);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${eventData.title.replace(/\s+/g, "_")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate Google Calendar URL
 */
export const getGoogleCalendarUrl = (eventData: EventData): string => {
  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/-|:|\.\d+/g, "");
  };
  
  const startDate = new Date(eventData.dateTime.start);
  const endDate = new Date(eventData.dateTime.end);
  
  const start = formatGoogleDate(startDate);
  const end = formatGoogleDate(endDate);
  
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventData.title,
    dates: `${start}/${end}`,
    details: eventData.description || "",
    location: eventData.location || "",
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
