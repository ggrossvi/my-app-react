import React, { useState, useEffect } from "react";
import "./CardProfile.css";
import { useNavigate } from "react-router-dom";
import { registerWithEmailAndPassword } from "./firebase";
import { useLocation } from "react-router-dom";
import { updateUserProfile } from "./firebase";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";
import { getDownloadURL } from "firebase/storage";

// shift option f to indent control shift f in windows

const ImgUpload = ({ onChange, src }) => (
  <label htmlFor="photo-upload" className="custom-file-upload fas">
    <div className="img-wrap img-upload">
      <img for="photo-upload" src={src} />
    </div>
    <input id="photo-upload" type="file" onChange={onChange} />
  </label>
);

const Name = ({ onChange, value }) => (
  <div className="field">
    <label htmlFor="name">Short Description:</label>
    <input
      id="name"
      type="text"
      onChange={onChange}
      maxlength="25"
      value={value}
      placeholder="Alexa"
      required
    />
  </div>
);

const Status = ({ onChange, value }) => (
  <div className="field">
    <label htmlFor="status">status:</label>
    <input
      id="status"
      type="text"
      onChange={onChange}
      maxLength="35"
      value={value}
      placeholder="It's a nice day!"
      required
    />
  </div>
);

const Profile = ({ onSubmit, src, name, status }) => (
  <div className="card">
    <form onSubmit={onSubmit}>
      <h1>Profile Card</h1>
      <label className="custom-file-upload fas">
        <div className="img-wrap">
          <img for="photo-upload" src={src} />
        </div>
      </label>
      <div className="name">{name}</div>
      <div className="status">{status}</div>
      <button type="submit" className="edit">
        Edit Profile{" "}
      </button>
    </form>
  </div>
);

const Edit = ({ onSubmit, children }) => (
  <div className="card">
    <form onSubmit={onSubmit}>
      <h1>Profile Card</h1>
      {children}
      <button type="submit" className="save">
        Save{" "}
      </button>
    </form>
  </div>
);

function CardProfile(props) {
  // use double quotes for string
  // changed class to function
  // put state into useState
  // can't call register email and register from register.js because status is here so they need to be all in one place to call them all at once.
  const [file, setFile] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    "https://github.com/OlgaKoplik/CodePen/blob/master/profile.jpg?raw=true"
  );
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [active, setActive] = useState("edit");
  const [url, setURL] = useState("");

  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    // passing user props redirect to profile page
    // naming convention Caps each Word for methods like useEffect use camelcase
    //check if location.state exists
    if (location.state) {
      if (active === "profile")
        // pass to map page user status and description
        // dashboard - home page with props being passed if props passed coming register page
        navigate("/dashboard", {
          state: {
            user_email: location.state.user_email,
            user_status: status,
            user_name: name,
          },
        }); //going to dashboard,  user state and description pass as props after state is the prop you are passing email status and description.
    }
  }, [active]);

  // functional call back functions need const before functions
  const photoUpload = (e) => {
    e.preventDefault();
    const reader = new FileReader();
    const file = e.target.files[0];
    console.log("filename:", file);
    reader.onloadend = () => {
      setFile(file);
      setImagePreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };
  const editName = (e) => {
    const name = e.target.value;
    setName(name);
  };

  const editStatus = (e) => {
    const status = e.target.value;
    // setStatus is method so you can just pass status
    setStatus(status);
  };
  // saves into database also import register with email and password
  const register = (url) => {
    updateUserProfile(status, name, location.state.user_email, url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Create a child reference
    const imagesRef = ref(storage, file.name);
    uploadBytes(imagesRef, file)
      .then(() => {
        console.log("Uploaded a blob or file!");
        getDownloadURL(imagesRef)
          .then((url) => {
            // `url` is the download URL for 'images/stars.jpg'
            setURL(url);
            console.log("this is the url we received", url);
            register(url);
          })
          .catch((error) => {
            // Handle any errors
          });
      })
      .catch((error) => {
        console.log("Error while uploading images");
      });

    // imagesRef now points to 'images'
    // active profile is active P profile is view only

    let activeP = active === "edit" ? "profile" : "edit";
    setActive(activeP);
  };
  //

  // in functional can access props directly
  // class uses this keyword but in function you don't use it to access the function.
  return (
    <div>
      {active === "edit" ? (
        <Edit onSubmit={handleSubmit}>
          <ImgUpload onChange={photoUpload} src={imagePreviewUrl} />
          <Name onChange={editName} value={name} />
          <Status onChange={editStatus} value={status} />
        </Edit>
      ) : (
        <Profile
          onSubmit={handleSubmit}
          src={imagePreviewUrl}
          name={name}
          status={status}
        />
      )}
    </div>
  );
}

export default CardProfile;

/* ReactDOM.render(
<CardProfile/>,
document.getElementById('root')
) */
