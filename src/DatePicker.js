import { Scheduler } from "@aldabil/react-scheduler";
import { EVENTS } from "./events";

// two ways to export componentthis is inline example - you can use only use one in line export in a file
export default function DatePicker() {
  return (
    <Scheduler
      view="week"
      events={EVENTS}
      selectedDate={new Date(2021, 4, 5)}
    />
  );
}
