import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { auth, logInWithEmailAndPassword, signInWithGoogle } from "./firebase";
// import { useAuthState } from "react-firebase-hooks/auth";
// import "./Login.css";


//calling api backend
const logInWithEmailAndPassword = async(email, password) => {
    try {
        const response = await axios.post("http://localhost:8000/login", {email, password});
        return response.data;
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

const registerWithEmailAndPassword = async(name, email, password) => {
    try {
        const response = await axios.post("http://localhost:8000/register", {name, email, password});
        return response;
    }  catch (err) {
        console.error(err);
        alert(err.message);
    }
}

const fetchUserMarkers = async()=>{
    try{
        const response = await axios.get("http://localhost:8000/userMarkers");
        return response.data;
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
} 

const updateLocation = async(email, longitude, latitude) => {   
    try {
        const response = await axios.post("http://localhost:8000/updateLocation", {email, longitude, latitude});
        return response.data;
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}


export { logInWithEmailAndPassword, registerWithEmailAndPassword, fetchUserMarkers, updateLocation };