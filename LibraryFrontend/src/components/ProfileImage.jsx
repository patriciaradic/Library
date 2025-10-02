import React from "react";
import "../styles/ProfileImage.css";

const ProfileImage = ({ name, size }) => {
  const nameParts = name.split(" ");
  const firstNameInitial = nameParts[0] ? nameParts[0][0] : "";
  const lastNameInitial = nameParts[1] ? nameParts[1][0] : "";

  const colorPalette = ["007BFF", "1E0B99", "7966F4", "CCF5AC", "F1558E", "0496FF", "CBDFBD", "F19C79"];
  const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];

  const fontSize = size/2;

  return (
    <span 
      className="user-profile-image"
      style={{ 
        backgroundColor: "#" + `${randomColor}` , 
        width: size.toString()+"px",   
        height: size.toString()+"px", 
        fontSize: fontSize.toString()+"px", 
      }}>
        {firstNameInitial}
        {lastNameInitial}
    </span>
  );
};
export default ProfileImage;


