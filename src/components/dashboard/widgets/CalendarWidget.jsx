import React from 'react';
import MiniCalendar from "../../dashboard/MiniCalendar";

export default function CalendarWidget({ completions }) {
  return <MiniCalendar completions={completions} />;
}