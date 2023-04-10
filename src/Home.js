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
import { logout } from "./firebase";
import { Avatar } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import Slider from "@mui/material/Slider";

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
  if (location.state) {
    console.log(location.state.user_email, "This is location info");
    update(latitude, longitude, location.state.user_email);
  }
}

function Maps() {
  const [selected, setSelected] = useState(null);
  const [clickbutton, setClickButton] = useState(false);
  const navigate = useNavigate();
  const [openInfoWindowMarkerId, setopenInfoWindowMarkerId] = useState("");
  const location = useLocation();
  const [isPaneOpenLeft, setIsPaneOpenLeft] = useState(false);
  const [sliderRange, setSliderRange] = useState(500);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [avatarImage, setAvatarImage] = useState("");

  useEffect(() => {
    if (clickbutton === true) navigate("/");
  }, [clickbutton]);

  const handleOnClick = () => {
    logout();
    setClickButton(true);
  };

  const watch = true;
  // once access is allowed then it populates lat and long
  const { latitude, longitude } = usePosition(watch, {
    enableHighAccuracy: true,
  });
  //markerId has to be unique so email is unique so calling from inside marker
  const toggleOpen = (markerId) => {
    setopenInfoWindowMarkerId(markerId);
  };
  //  const center = useMemo(() => ({ lat: latitude, lng: longitude}), []);
  // current location pass to function
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
      // setFire stores data in the markers
      setFire(locationmap);

      //return locationmap;
      console.log("fireeeee", markers);
    });
  }, []);

  console.log("locationCoordinates:", markers);

  // map fetched from database
  var returnMarkers =
    markers &&
    markers.filter((markers) => {
      var locationlatlng = new window.google.maps.LatLng(
        markers.latitude,
        markers.longitude
      );
      console.log("location latlng:", locationlatlng);
      // current coordinates
      var fromlocationlatlng = new window.google.maps.LatLng(
        latitude,
        longitude
      );

      //compute distance from current coodinates to firestore markers
      let distance = window.google.maps.geometry.spherical.computeDistanceBetween(
        fromlocationlatlng,
        locationlatlng
      );
      console.log("Distance fetched", distance);
      // sets the markers that show up based on what range in slider we select
      if (distance < sliderRange) {
        return distance;
      }
    });

  console.log("Return Markers:", returnMarkers);

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
  // assigning an arrow function to const variable
  const handleSliderChange = (event, value) => {
    event.preventDefault();
    console.log("Event", event.target.value);
    console.log("Value", value);
    setSliderRange(value);
  };

  // radius is in meters
  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={() => {
                setIsPaneOpenLeft(true);
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Share Location App{" "}
              <span role="img" aria-label="map">
                🗺️
              </span>
            </Typography>
            {/* change width and color */}
            <Slider
              defaultValue={50}
              min={500}
              onChange={handleSliderChange}
              max={8000}
              aria-label="Default"
              valueLabelDisplay="auto"
            />
            <Button color="inherit" onClick={handleOnClick}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      </Box>

      {/* <h1>
        <button
          onClick={handleOnClick}
          style={{
            float: "right",
            color: "grey",
            background: "blue",
          }}
        >
          Logout
        </button>
      </h1> */}
      <GoogleMap
        // options = {options}
        id="circle-example"
        zoom={12}
        center={{
          lat: parseFloat(latitude),
          lng: parseFloat(longitude),
        }}
        mapContainerClassName="map-container"
      >
        <Circle center={center} radius={10} options={options} />
        // first returnMarkers checks if there are markers it Filter markers
        down to vicinity // 2nd returnMarkers.map goes through markers each user
        and puts email lat&long
        {returnMarkers &&
          returnMarkers.map(
            ({
              email,
              latitude,
              longitude,
              userStatus,
              username,
              userDescription,
              imageUrl,
            }) => (
              <React.Fragment>
                {/* unique key is for the whole map the one under marker is for just the marker*/}
                key={email}
                <Marker
                  key={email}
                  position={{
                    lat: parseFloat(latitude),
                    lng: parseFloat(longitude),
                  }}
                  onClick={(props, marker) => {
                    toggleOpen(email);
                    setSelected(
                      true

                      // lat: parseFloat(latitude),
                      // lng: parseFloat(longitude),
                    );
                    console.log(selected);
                  }}
                  icon={{
                    url: "/personicon.png",
                    scaledSize: new window.google.maps.Size(25, 25),
                  }}
                />
                {/* set to true for the marker selected through email id Edit /toggle block comment */}
                {openInfoWindowMarkerId === email && (
                  <InfoWindow
                    //    position={{lat: selected.lat, lng:selected.lng}}
                    position={{
                      lat: parseFloat(latitude),
                      lng: parseFloat(longitude),
                    }}
                    onCloseClick={() => {
                      console.log(selected);
                      // when you close it setopenInfoWindowMarkerId clears data and sets to none
                      setopenInfoWindowMarkerId("");
                      // null apps stops working if use so better use false
                      setSelected(false);
                    }}
                  >
                    <div class="gm-style">
                      {/* if exists return latitude and if not set to 0.0 */}
                      {/* {latitude?latitude:0.0}, {longitude?longitude:0.0} */}

                      {location.state ? (
                        <Avatar alt="profile picture" src={imageUrl} />
                      ) : (
                        ""
                      )}
                      <Button
                        variant="text"
                        /* if we click on button we will check whether info window is open -create state set to true if you click  */
                        onClick={() => {
                          setIsRightPanelOpen(true);
                          setAvatarImage(imageUrl);
                        }}
                      >
                        {username}
                      </Button>

                      <br />
                      {/*  location.state exists - not undefined props exist if no props not coming from register page.    */}
                      {location.state ? userStatus : ""}
                      <br />
                      {location.state ? userDescription : ""}
                    </div>
                  </InfoWindow>
                )}
              </React.Fragment>
            )
          )}
        <Circle
          center={{
            lat: parseFloat(latitude),
            lng: parseFloat(longitude),
          }}
          radius={500000}
        />
      </GoogleMap>
      <SlidingPane
        closeIcon={<div>Some div containing custom close icon.</div>}
        isOpen={isPaneOpenLeft}
        title="Hey, it is optional pane title.  I can be React component too."
        from="left"
        width="200px"
        onRequestClose={() => setIsPaneOpenLeft(false)}
      >
        <div>Slide to change the radius.</div>
        <Slider
          defaultValue={50}
          min={500}
          onChange={handleSliderChange}
          max={8000}
          aria-label="Default"
          valueLabelDisplay="auto"
        />
      </SlidingPane>
      <SlidingPane
        closeIcon={<div>User Information</div>}
        isOpen={isRightPanelOpen}
        title="User Information"
        width="30%"
        onRequestClose={() => setIsRightPanelOpen(false)}
      >
        <Avatar alt="profile picture" src={avatarImage} />
      </SlidingPane>
    </div>
  );
}

export default Home;
