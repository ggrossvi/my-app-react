import { initializeApp } from "firebase/app";
import { databaseCollection } from "./constants";
import React from "react";
import { useState } from "react";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: `${process.env.REACT_APP_API_KEY}`,
  authDomain: `${process.env.REACT_APP_authDomain}`,
  projectId: `${process.env.REACT_APP_projectId}`,
  storageBucket: `${process.env.REACT_APP_storageBucket}`,
  messagingSenderId: `${process.env.REACT_APP_messagingSenderId}`,
  appId: `${process.env.REACT_APP_appId}`,
  measurementId: `${process.env.REACT_APP_measurementId}`,
};

// steps for storage
// 1.reference to storage object
// 2. upload object and get a link to it.
// 3. adding the link to database firebase object

let locationmap = [];
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name: user.displayName,
        authProvider: "google",
        email: user.email,
      });
    }
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const logInWithEmailAndPassword = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const registerWithEmailAndPassword = async (
  name,
  email,
  password,
  status,
  userDescription
) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      name,
      authProvider: "local",
      email,
    });
    Create(name, email, status, userDescription);
    // getSepcificDataWithID();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent!");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const logout = () => {
  console.log("logout occured");
  signOut(auth);
};

/*
const [longitude, setLong] = useState("");
const [latitude, setLat] = useState("");
*/

function Create(username, email, userDescription, status) {
  setDoc(doc(db, databaseCollection, email), {
    username: username,
    email: email,
    // initialize to zero start
    longitude: 0.0,
    latitude: 0.0,
    userDescription: "",
    status: "",
    imageUrl: "",
    events: [], // so more than one can be added
  })
    .then(() => {
      // Data saved successfully!
      console.log("data submitted");
    })
    .catch((error) => {
      // The write failed...
      console.log(error);
    });
}

export default function Update(latitude, longitude, email) {
  if (email && longitude && latitude) {
    updateDoc(doc(db, databaseCollection, email), {
      longitude: longitude,
      latitude: latitude,
    })
      .then(() => {
        // Data saved successfully!
        console.log("data updated");
      })
      .catch((error) => {
        // The write failed...
        console.log(error);
      });
  }
}
// if you use export default you can only use one export default function in a file
function updateUserProfile(userStatus, userDescription, email, url) {
  if (email) {
    updateDoc(doc(db, databaseCollection, email), {
      userStatus: userStatus,
      userDescription: userDescription,
      imageUrl: url,
    })
      .then(() => {
        // Data saved successfully!
        console.log("data updated");
      })
      .catch((error) => {
        // The write failed...
        console.log(error);
      });
  }
}

function getUserdataWithID(email, event) {
  if (email) {
    getDoc(doc(db, databaseCollection, email), {
      /* this function gets called from calendar component use effect (1st one that gets invoked before the page get loaded) hook before component is loaded and will return events for particular email */
    })
      .then(() => {
        // Data saved successfully!
        console.log("data updated");
      })
      .catch((error) => {
        // The write failed...
        console.log(error);
      });
  }
}
// create event in calendar, pass event into updateUser..., append latest event to the existing event
function updateUserProfileCalendarEvent(event, email) {
  //need to do a call to get previous data
  getDoc(doc(db, databaseCollection, email))
    .then((docData) => {
      // Data saved successfully!

      if (docData.exists()) {
        let userData = docData.data();
        let newEvent = {
          userEventTitle: event.title,
          userEventID: event.event_id,
          userEventStart: event.start,
          userEventEnd: event.end,
        };
        // the spread operator appends the newEvent after the comma within the array
        let updatedEvents = [...userData.events, newEvent];
        if (email) {
          updateDoc(doc(db, databaseCollection, email), {
            events: updatedEvents,
          })
            .then(() => {
              // Data saved successfully!
              console.log("data updated");
            })
            .catch((error) => {
              // The write failed...
              console.log(error);
            });
        } else {
          console.log("No such data!");
        }
      }
    })
    .catch((error) => {
      // The write failed...
      console.log(error);
    });
}

// fetch the events that are specific to the user with this email
function getSpecificDataWithID(email, setUserFirebaseEvent) {
  getDoc(doc(db, databaseCollection, email))
    .then((docData) => {
      // Data saved successfully!

      if (docData.exists()) {
        // console.log(docData.data());
        // firebase is filling in the setUserFirebaseEvent setUserFirebase Event contains the event data
        setUserFirebaseEvent(docData.data());
        console.log("data:", docData.data());

        // setName(docData.data().username);
        // setEmail(docData.data().email);
      } else {
        console.log("No such data!");
      }
    })
    .catch((error) => {
      // The write failed...
      console.log(error);
    });
}

function GetAlldata() {
  const [fire, setFire] = useState([]);
  locationmap.length = 0;
  getDocs(collection(db, databaseCollection)).then((docSnap) => {
    docSnap.forEach((doc) => {
      locationmap.push({ ...doc.data(), id: doc.id });
      // setting locationmap into the state
    });

    setFire(locationmap);
    console.log("Document data:", fire);
  });
  // return the updated variable
  return fire;
}

export {
  auth,
  db,
  signInWithGoogle,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordReset,
  logout,
  GetAlldata,
  updateUserProfile,
  updateUserProfileCalendarEvent,
  getSpecificDataWithID,
};
export const storage = getStorage(app);
