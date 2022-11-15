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

const firebaseConfig = {
  apiKey: `${process.env.REACT_APP_API_KEY}`,
  authDomain: `${process.env.REACT_APP_authDomain}`,
  projectId: `${process.env.REACT_APP_projectId}`,
  storageBucket: `${process.env.REACT_APP_storageBucket}`,
  messagingSenderId: `${process.env.REACT_APP_messagingSenderId}`,
  appId: `${process.env.REACT_APP_appId}`,
  measurementId: `${process.env.REACT_APP_measurementId}`,
};

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

const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      name,
      authProvider: "local",
      email,
    });
    Create(name, email);
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
  signOut(auth);
};

/*
const [longitude, setLong] = useState("");
const [latitude, setLat] = useState("");
*/

function Create(username, email) {
  setDoc(doc(db, databaseCollection, email), {
    username: username,
    email: email,
    // initialize to zero start
    longitude: 0.0,
    latitude: 0.0,
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

function getSepcificDataWithID() {
  getDoc(doc(db, databaseCollection, "zADXQKcjaLlMygyyafHP"))
    .then((docData) => {
      // Data saved successfully!

      if (docData.exists()) {
        // console.log(docData.data());
        console.log(docData.data().username);
        console.log(docData.data().email);
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

function getAlldata() {
  getDocs(collection(db, databaseCollection)).then((docSnap) => {
    let locationmap = [];
    docSnap.forEach((doc) => {
      locationmap.push({ ...doc.data(), id: doc.id });
    });
    console.log("Document data:", locationmap);
  });
}

export {
  auth,
  db,
  signInWithGoogle,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordReset,
  logout,
  getAlldata,
};
