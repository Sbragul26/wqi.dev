import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { 
  Home,
  BarChart2,
  Wallet,
  Newspaper,
  ChevronDown
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current URL
  const [cryptoExpanded, setCryptoExpanded] = useState(true);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="w-70 bg-gray-900 min-h-screen fixed p-6 border-r border-gray-800 shadow-sm flex flex-col">
      {/* Logo */}
      <div className="mb-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <div className="text-white font-bold text-xl">TG</div>
          </div>
          <h2 className="text-2xl font-bold text-white">TradeGuard</h2>
        </div>
      </div>

      {/* Navigation Items */}
      <nav>
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 mb-3 px-3 uppercase">Main Navigation</p>
          <NavItem 
            icon={<Home size={20} />} 
            label="Home" 
            active={location.pathname === "/home"} 
            onClick={() => handleNavigation("/home")}
          />
          <NavItem 
            icon={<BarChart2 size={20} />} 
            label="Prices" 
            active={location.pathname === "/prices"} 
            onClick={() => handleNavigation("/prices")}
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 mb-3 px-3 uppercase">Features</p>
          <NavItem 
            icon={<Newspaper size={20} />} 
            label="News" 
            active={location.pathname === "/news"} 
            onClick={() => handleNavigation("/news")}
          />
          <NavItem 
            icon={<Wallet size={20} />} 
            label="Wallet" 
            active={location.pathname === "/wallet"} 
            onClick={() => handleNavigation("/wallet")}
            badge="New"
          />
          <NavItem 
            icon={<BarChart2 size={20} />} 
            label="Exchange" 
            active={location.pathname === "/exchange"} 
            onClick={() => handleNavigation("/exchange")}
          />
        </div>

        {/* Cryptocurrency Section */}
        <div className="mt-6">
          <div 
            className="flex items-center justify-between px-3 py-2 cursor-pointer"
            onClick={() => setCryptoExpanded(!cryptoExpanded)}
          >
            <p className="text-xs font-semibold text-gray-400 uppercase">Cryptocurrencies</p>
            <ChevronDown 
              size={16} 
              className={`text-gray-400 transition-transform duration-200 ${cryptoExpanded ? "rotate-180" : ""}`}
            />
          </div>
          
          {cryptoExpanded && (
            <div className="mt-2">
              <NavItem 
                icon={<div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center"><span className="text-white text-xs font-bold">₿</span></div>} 
                label="Bitcoin" 
                active={location.pathname === "/bitcoin"} 
                onClick={() => handleNavigation("/bitcoin")}
                subtitle="BTC"
              />
              <NavItem 
                icon={<div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center"><span className="text-white text-xs font-bold">Ξ</span></div>} 
                label="Ethereum" 
                active={location.pathname === "/ethereum"} 
                onClick={() => handleNavigation("/ethereum")}
                subtitle="ETH"
              />
              <NavItem 
                icon={<div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center"><span className="text-white text-xs font-bold">₿</span></div>} 
                label="Bitcoin Cash" 
                active={location.pathname === "/bitcoin-cash"} 
                onClick={() => handleNavigation("/bitcoin-cash")}
                subtitle="BCH"
              />
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, badge, subtitle }) => {
  return (
    <div 
      className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group
        ${active ? "bg-blue-900/50 text-blue-400" : "hover:bg-gray-800 text-gray-300"}`}
      onClick={onClick}
    >
      <div className={`${active ? "text-blue-400" : "text-gray-400 group-hover:text-gray-200"}`}>
        {icon}
      </div>
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <span className={`font-medium ${active ? "text-blue-400" : "group-hover:text-gray-200"}`}>{label}</span>
          {badge && (
            <span className="bg-blue-900 text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium">{badge}</span>
          )}
        </div>
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
      </div>
    </div>
  );
};

export default Navbar;
