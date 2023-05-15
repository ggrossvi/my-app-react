import React from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import { EVENTS } from "./Events";
import { Card } from "@mui/material";

function CalendarScheduler() {
  return (
    <Card sx={{ maxWidth: 700 }}>
      <Scheduler
        view="week"
        events={EVENTS}
        selectedDate={new Date(2021, 4, 5)}
      />
    </Card>
  );
}

export default CalendarScheduler;
