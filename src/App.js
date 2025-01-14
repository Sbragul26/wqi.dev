import React, { useState, useEffect } from "react";

function App() {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [usrLocation, setUsrLocation] = useState(null);
  const [locationDetails, setLocationDetails] = useState({});

  const containerStyle = {
    display: "flex",
    height: "100vh",
    margin: 0,
  };

  const leftSectionStyle = {
    backgroundColor: "#1E1F3B",
    width: "15%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 10px",
  };

  const rightSectionStyle = {
    backgroundColor: "#2C2E5A",
    width: "85%",
    padding: "20px",
    color: "white",
  };

  const menuItemStyle = (item) => ({
    padding: hoveredItem === item ? "15px 50px" : "5px 10px",
    color: hoveredItem === item ? "black" : "white",
    backgroundColor: hoveredItem === item ? "white" : "#1E1F3B",
    borderRadius: "15px",
    cursor: "pointer",
    margin: "10px 0",
    transition: "background-color 0.3s, color 0.3s, padding 0.3s",
  });

  const searchBarStyle = {
    display: "flex",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "5px 10px",
    width: "1300px",
    marginBottom: "20px",
  };

  const inputStyle = {
    border: "none",
    outline: "none",
    flexGrow: 1,
    padding: "5px",
    color: "black",
  };

  const iconStyle = {
    width: "25px",
    height: "25px",
    marginRight: "10px",
    cursor: "pointer",
  };

  const breadcrumbContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    fontSize: "18px",
  };

  const breadcrumbStyle = {
    flexGrow: 1,
  };

  const langDropdownStyle = {
    cursor: "pointer",
    marginLeft: "10px",
  };

  const menuItems = ["Dashboard", "Rankings", "Pollutants", "Predictions", "Settings", "Profile"];

  const showToast = (message) => {
    const toast = document.getElementById("toast");
    toast.innerHTML = message;
    toast.className = "show";
    setTimeout(() => {
      toast.className = toast.className.replace("show", "");
    }, 5000);
  };

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUsrLocation(location);
          reverseGeocode(location.latitude, location.longitude);
        },
        (error) => {
          showToast("Error: Unable to fetch location");
        }
      );
    } else {
      showToast("Geolocation is not supported by this browser.");
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=e2de14a0dbee4e70b6037144b6bc8f04`);
      const data = await response.json();
      const state = data.results[0].components.state;
      const district = data.results[0].components.county;
      const city = data.results[0].components.city || data.results[0].components.town || data.results[0].components.village;
      const location = { state, district, city };
      setLocationDetails(location);
      showToast(`Location: ${district}, ${state}`);
    } catch (error) {
      showToast("Error: Unable to fetch location details");
    }
  };

  const handleLocationClick = () => {
    fetchLocation();
  };

  return (
    <div style={containerStyle}>
      <div id="toast" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "#333", color: "#fff", padding: "10px 20px", borderRadius: "5px", visibility: "hidden" }}></div>
      <div style={leftSectionStyle}>
        {menuItems.map((item) => (
          <div
            key={item}
            style={menuItemStyle(item)}
            onMouseEnter={() => setHoveredItem(item)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {item}
          </div>
        ))}
      </div>
      <div style={rightSectionStyle}>
        <div style={searchBarStyle}>
          <input type="text" placeholder="Search by dam, reservoir, place, city..." style={inputStyle} />
          <img src="loc_pointer.png" alt="Location Icon" style={iconStyle} onClick={handleLocationClick} />
        </div>
        <div style={breadcrumbContainerStyle}>
        <div style={breadcrumbStyle}>
          Dashboard
          {locationDetails.state ? ` > ${locationDetails.state}` : ""}
          {locationDetails.state && locationDetails.district ? ` > ${locationDetails.district}` : ""}
          {locationDetails.state && locationDetails.district && locationDetails.city ? ` > ${locationDetails.city}` : ""}
        </div>


          <div style={langDropdownStyle}>Lang ▼</div>
        </div>

      </div>
    </div>
  );
}

export default App;
