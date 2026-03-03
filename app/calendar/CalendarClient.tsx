"use client";

import dynamic from "next/dynamic";

const CalendarPage = dynamic(
  () => import("@/components/Calendar/CalendarPage"),
  { ssr: false }
);

export default function CalendarClient() {
  return <CalendarPage />;
}