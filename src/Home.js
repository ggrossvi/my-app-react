import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ReactDOM from "react-dom";
import React, { Component } from "react";
import "./index.css";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { usePosition } from "use-position";
import { InfoWindow } from "@react-google-maps/api";
import { Circle } from "@react-google-maps/api";
import update from "./firebase";
import { getAlldata } from "./firebase";
import { databaseCollection } from "./constants";
import { initializeApp } from "firebase/app";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import logout from "./firebase";

function Home() {
  console.log(`${process.env.REACT_APP_googleMapsApiKey}`);
  const { isLoaded } = useLoadScript({
    //   googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    googleMapsApiKey: `${process.env.REACT_APP_googleMapsApiKey}`,
  });

  if (!isLoaded) return <div>Loading...</div>;
  if ("geolocation" in navigator) {
    console.log("Available");
  } else {
    console.log("Not Available");
  }

  return <Maps />;
}

function PopulateLocationInformation(latitude, longitude) {
  // useLocation fetches props from Login page use this because different from when using with component because using within navigation Use position gives coordinates, UseLocation access the parameter is grabbed from navigation hook
  const location = useLocation();
  console.log(location.state.user_email, "This is location info");
  update(latitude, longitude, location.state.user_email);
}

function Maps() {
  const [selected, setSelected] = useState(null);

  const watch = true;
  // once access is allowed then it populates lat and long
  const { latitude, longitude } = usePosition(watch, {
    enableHighAccuracy: true,
  });

  //  const center = useMemo(() => ({ lat: latitude, lng: longitude}), []);

  const center = { lat: latitude, lng: longitude };
  PopulateLocationInformation(latitude, longitude);

  const firebaseConfig = {
    apiKey: `${process.env.REACT_APP_API_KEY}`,
    authDomain: `${process.env.REACT_APP_authDomain}`,
    projectId: `${process.env.REACT_APP_projectId}`,
    storageBucket: `${process.env.REACT_APP_storageBucket}`,
    messagingSenderId: `${process.env.REACT_APP_messagingSenderId}`,
    appId: `${process.env.REACT_APP_appId}`,
    measurementId: `${process.env.REACT_APP_measurementId}`,
  };

  // get coordinates in array
  const [markers, setFire] = useState([]);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  var locationmap = [];
  useEffect(() => {
    const docs = getDocs(collection(db, databaseCollection)).then((docSnap) => {
      docSnap.forEach((doc) => {
        locationmap.push({ ...doc.data(), id: doc.id });
      });
      setFire(locationmap);
      //return locationmap;
      console.log("fireeeee", markers);
    });
  }, []);

  console.log("locationCoordinates:", markers);

  // navigator.geolocation.getCurrentPosition(function(position) {
  //   console.log("Latitude is :", position.coords.latitude);
  //  console.log("Longitude is :", position.coords.longitude);
  // });

  //  this.setSelected({ lat: parseFloat(latitude), lng: parseFloat(longitude)});
  const options = {
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: 600,
    zIndex: 1,
  };

  const [clickbutton, setClickButton] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (clickbutton === true) navigate("/");
  }, [clickbutton]);

  const handleOnClick = () => {
    logout();
    setClickButton(true);
  };
  // radius is in meters
  return (
    <div>
      <h1>
        Share Location App{" "}
        <span role="img" aria-label="map">
          ???????
        </span>
      </h1>
      <button onClick={handleOnClick} style={{ float: "right" }}>
        Logout
      </button>
      <GoogleMap
        // options = {options}
        id="circle-example"
        zoom={12}
        center={{ lat: parseFloat(latitude), lng: parseFloat(longitude) }}
        mapContainerClassName="map-container"
      >
        <Circle center={center} radius={10} options={options} />

        {markers &&
          markers.map(({ email, latitude, longitude }) => (
            <React.Fragment>
              <Marker
                key={email}
                position={{
                  lat: parseFloat(latitude),
                  lng: parseFloat(longitude),
                }}
                onClick={() => {
                  setSelected({
                    lat: parseFloat(latitude),
                    lng: parseFloat(longitude),
                  });
                  console.log(selected);
                }}
                icon={{
                  url: "/personicon.png",
                  scaledSize: new window.google.maps.Size(25, 25),
                }}
              />
              {selected && (
                <InfoWindow
                  //    position={{lat: selected.lat, lng:selected.lng}}
                  position={{
                    lat: parseFloat(latitude),
                    lng: parseFloat(longitude),
                  }}
                  onCloseClick={() => {
                    console.log(selected);
                    setSelected(null);
                  }}
                >
                  <div>
                    {latitude}, {longitude}
                  </div>
                </InfoWindow>
              )}
            </React.Fragment>
          ))}

        <Circle
          center={{ lat: parseFloat(latitude), lng: parseFloat(longitude) }}
          radius={500000}
        />
      </GoogleMap>
    </div>
  );
}

export default Home;
