import React, { useEffect, useState } from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import { EVENTS } from "./Events";
import { Card } from "@mui/material";
import {
  getSpecificDataWithID,
  updateUserProfileCalendarEvent,
} from "./firebase";
import { useLocation } from "react-router-dom";

/* 
if no curly braces use same name - it is an object then you say userEmail.name, UserEmail.email
if multiple props then will you receive in an object prop.email - use curly braces so if you use curly brace. passing as location hook instead of directly passing props from the component.  we are using location hook to fetch useremail through home js component.  Events in useEffect render first so all the events can be seen in the component. We might not have email when it first loads then it return exception because email not present need to check first that it is loaded. In Calendar Scheduler userFirbaseEvent has the value of the Events created associated with the email user. The user_email and setUser.. is passed with the get Specific DatatWithId to firebase.  Firebase then puts the data associated with email into setUserFirebaseEvent and then it available in userFirebaseEvent
In line 26 passing state setUserFirebaseEvent

*/
function CalendarScheduler() {
  const [userFirebaseEvent, setUserFirebaseEvent] = useState();
  const Location = useLocation();
  if (Location.state) {
    console.log("email:", Location.state.user_email);
  }
  /* Email Coming from home component.  getSpecificDataWithID */
  useEffect(() => {
    if (Location.state) {
      getSpecificDataWithID(Location.state.user_email, setUserFirebaseEvent);
      if (userFirebaseEvent) {
        console.log("UserFirebaseEvent:", userFirebaseEvent);
      }
    }
  }, []);
  const handleConfirm = async (event, action) => {
    console.log("event", event);
    console.log("action", action);
    let returnedEvent;

    if (action === "edit") {
      returnedEvent = event;
    } else if (action === "create") {
      returnedEvent = {
        ...event,
        event_id: Math.random(),
      };
    }
    /* call the firebase component to update current user with latest current calender event.  Use Location.state instead of more specific Location.state_email because at the time it will not exist and will generate error.*/
    if (Location.state) {
      console.log("email:", Location.state.user_email);
    }

    updateUserProfileCalendarEvent(returnedEvent, Location.state.user_email);
    return returnedEvent;
  };

  const returnEvents = () => {
    let myObject = [{}];
    if (userFirebaseEvent && userFirebaseEvent.events[0]) {
      console.log("UserFirebaseEvent:", userFirebaseEvent);
      const endDate = new Date(userFirebaseEvent.userEventEnd.seconds * 1000);
      const startDate = new Date(
        userFirebaseEvent.userEventStart.seconds * 1000
      );
      console.log("End Date:", endDate);
      // in javascript to make a number instead of string append 1 in front of number
      const adjustStartMonth = +startDate.getMonth() + +1;
      const adjustEndMonth = +endDate.getMonth() + +1;
      const formattedEndDate =
        endDate.getFullYear() +
        " " +
        adjustEndMonth +
        " " +
        endDate.getDate() +
        " " +
        endDate.getHours() +
        ":" +
        endDate.getMinutes();

      const formattedStartDate =
        startDate.getFullYear() +
        " " +
        adjustStartMonth +
        " " +
        startDate.getDate() +
        " " +
        startDate.getHours() +
        ":" +
        startDate.getMinutes();

      let newmyObject = [
        {
          end: new Date(formattedEndDate),
          start: new Date(formattedStartDate),
          event_id: "1",
          title: userFirebaseEvent.userEventTitle,
        },
      ];

      console.log("data:", newmyObject);
      return newmyObject;
    } else {
      return [];
    }
  };
  return (
    <Card sx={{ maxWidth: 700 }}>
      {userFirebaseEvent ? (
        <Scheduler
          view="week"
          events={returnEvents()}
          selectedDate={new Date(2023, 7, 4)}
          onConfirm={handleConfirm}
        />
      ) : null}
    </Card>
  );
}

export default CalendarScheduler;
