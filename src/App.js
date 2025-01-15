import React, { useState, Suspense } from "react";
const RiverMap = React.lazy(() => import('./pages/river_map'));

function App() {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [usrLocation, setUsrLocation] = useState(null);
  const [locationDetails, setLocationDetails] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [selectedTab, setSelectedTab] = useState('WQI');

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
    color: "#3498DB"
  };

  const langDropdownStyle = {
    cursor: "pointer",
    marginLeft: "10px",
  };

  const tabContainerStyle = {
    display: 'flex',
    backgroundColor: '#333',
    padding: '10px',
  };

  const tabStyle = (tab) => ({
    flex: 1,
    padding: '10px',
    textAlign: 'center',
    color: 'white',
    cursor: 'pointer',
    position: 'relative',
    borderBottom: selectedTab === tab ? '2px solid blue' : 'none',
  });

  const tabIconStyle = {
    marginRight: '5px',
  };

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  const menuItems = ["Dashboard", "Rankings", "Pollutants", "Predictions", "Settings", "Profile", "River Map"];

  const showToast = (message) => {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.style.position = "fixed";
      toast.style.bottom = "10px";
      toast.style.left = "50%";
      toast.style.transform = "translateX(-50%)";
      toast.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      toast.style.color = "white";
      toast.style.padding = "10px 20px";
      toast.style.borderRadius = "5px";
      toast.style.zIndex = "1000";
      toast.style.transition = "opacity 0.5s";
      toast.style.opacity = "0";
      document.body.appendChild(toast);
    }
    toast.innerHTML = message;
    toast.className = "show";
    toast.style.opacity = "1";
    setTimeout(() => {
      toast.style.opacity = "0";
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

  const handleMenuItemClick = (item) => {
    if (item === "River Map") {
      setShowMap(true);
    }
  };

  return (
    <div style={containerStyle}>
    <div style={{ ...leftSectionStyle, position: 'relative' }}>
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <img 
          src="menu_icon.png" 
          alt="Menu" 
          style={{ cursor: 'pointer', width: '30px', height: '30px', backgroundColor: '#1E1F3B', padding: '0px', borderRadius: '5px' }}
        />
      </div>{/*onClick={handleMenuBarClick} */}

      <div style={{ position: 'absolute', marginTop: '30px', left: '10px' }}>
        <div style={{fontSize: '22px', color: '#3498DB' }}>
          Welcome, 
        </div>
      </div>
    
      {menuItems.map((item, index) => (
      <div
        key={item}
        style={{...menuItemStyle(item),...(index === 0 ? { marginTop: '6pc' } : {}),}}
        onMouseEnter={() => setHoveredItem(item)}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => handleMenuItemClick(item)}>
        {item}
      </div>
          ))}

          {/*! logo of the wqi.dev*/}
    
      <div style={{ textAlign: 'center',position:'fixed', marginTop: '700px' }}>{/*Error may occur in marginTop */}
        <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#3498DB' }}>
          W<span style={{ position: 'relative' }}>Q</span>I<span style={{ fontSize: '24px', verticalAlign: 'super' }}>®</span>
        </span>
        <div style={{ fontSize: '16px', color: '#3498DB' }}>
          Real-time River and Reservoir Quality data of India
        </div>
      </div>
    </div>


      
      <div style={rightSectionStyle}>
        <div style ={{ marginTop:'30px' }}>
        <div style={searchBarStyle}>
          <input type="text" placeholder="Search by dam, reservoir, place, city..." style={inputStyle} />
          <img src="loc_pointer.png" alt="Location Icon" style={iconStyle} onClick={handleLocationClick} />
        </div>
        </div>

        < div style ={{marginTop: '10px'}}>
        <div style={breadcrumbContainerStyle}>
        <div style={breadcrumbStyle}>
          <span>Dashboard</span>
          <span style={{ color: 'white' }}>
            {locationDetails.state ? ` > ${locationDetails.state}` : ""}
            {locationDetails.state && locationDetails.district ? ` > ${locationDetails.district}` : ""}
            {locationDetails.state && locationDetails.district && locationDetails.city ? ` > ${locationDetails.city}` : ""}
          </span>
        </div>

        <div style={langDropdownStyle}>Lang ▼</div>
        </div>
        </div>

        <div style ={{marginTop: '35px'}}>
        <div style={tabContainerStyle}>
          <div
            style={tabStyle('Reservoir')}
            onClick={() => handleTabClick('Reservoir')}
          >
            <span style={tabIconStyle}>" "</span> Reservoir
          </div>
          <div
            style={tabStyle('Rivers')}
            onClick={() => handleTabClick('Rivers')}
          >
            <span style={tabIconStyle}>" "</span> Rivers
          </div>
          <div
            style={tabStyle('Ground Water')}
            onClick={() => handleTabClick('Ground Water')}
          >
            <span style={tabIconStyle}>" "</span> Ground Water
          </div>
        </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <Suspense fallback={<div>Loading Map...</div>}>
              <div>
                {selectedTab === 'Reservoir' && <h1>Reservoir Content</h1>}
                {selectedTab === 'Rivers' && <h1>Rivers Content</h1>}
                {selectedTab === 'Ground Water' && <h1>Ground Water Content</h1>}
              </div>
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<div></div>}>
              {showMap ? <RiverMap /> : (
                <div>
                  Click River Map..
                </div>
              )}
            </Suspense>
        </div>

      </div>
    </div>
  );
}

export default App;
