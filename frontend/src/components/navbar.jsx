import React, { useState } from 'react';
import { 
  Home,
  BarChart2,
  LineChart,
  Wallet,
  Newspaper,
  CircleDollarSign,
  Image,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const [activeItem, setActiveItem] = useState('Home');
  const [cryptoExpanded, setCryptoExpanded] = useState(true);

  return (
    <div className="w-72 bg-gray-900 min-h-screen p-6 border-r border-gray-800 shadow-sm flex flex-col">
      {/* Logo */}
      <div className="mb-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <div className="text-white font-bold text-xl">E</div>
          </div>
          <h2 className="text-xl font-bold text-white">Example.com</h2>
        </div>
      </div>

      {/* Navigation Items */}
      <nav>
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 mb-3 px-3 uppercase">Main Navigation</p>
          <NavItem 
            icon={<Home size={20} />} 
            label="Home" 
            active={activeItem === 'Home'}
            onClick={() => setActiveItem('Home')}
          />
          <NavItem 
            icon={<BarChart2 size={20} />} 
            label="Prices" 
            active={activeItem === 'Prices'}
            onClick={() => setActiveItem('Prices')}
          />
          <NavItem 
            icon={<LineChart size={20} />} 
            label="Charts" 
            active={activeItem === 'Charts'}
            onClick={() => setActiveItem('Charts')}
          />
          <NavItem 
            icon={<Image size={20} />} 
            label="NFTs" 
            active={activeItem === 'NFTs'}
            onClick={() => setActiveItem('NFTs')}
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 mb-3 px-3 uppercase">Features</p>
          <NavItem 
            icon={<CircleDollarSign size={20} />} 
            label="DeFi" 
            active={activeItem === 'DeFi'}
            onClick={() => setActiveItem('DeFi')}
          />
          <NavItem 
            icon={<Newspaper size={20} />} 
            label="News" 
            active={activeItem === 'News'}
            onClick={() => setActiveItem('News')}
          />
          <NavItem 
            icon={<Wallet size={20} />} 
            label="Wallet" 
            active={activeItem === 'Wallet'}
            onClick={() => setActiveItem('Wallet')}
            badge="New"
          />
          <NavItem 
            icon={<BarChart2 size={20} />} 
            label="Exchange" 
            active={activeItem === 'Exchange'}
            onClick={() => setActiveItem('Exchange')}
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
              className={`text-gray-400 transition-transform duration-200 ${cryptoExpanded ? 'transform rotate-180' : ''}`}
            />
          </div>
          
          {cryptoExpanded && (
            <div className="mt-2">
              <NavItem 
                icon={<div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center"><span className="text-white text-xs font-bold">₿</span></div>} 
                label="Bitcoin" 
                active={activeItem === 'Bitcoin'}
                onClick={() => setActiveItem('Bitcoin')}
                subtitle="BTC"
              />
              <NavItem 
                icon={<div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center"><span className="text-white text-xs font-bold">Ξ</span></div>} 
                label="Ethereum" 
                active={activeItem === 'Ethereum'}
                onClick={() => setActiveItem('Ethereum')}
                subtitle="ETH"
              />
              <NavItem 
                icon={<div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center"><span className="text-white text-xs font-bold">₿</span></div>} 
                label="Bitcoin Cash" 
                active={activeItem === 'Bitcoin Cash'}
                onClick={() => setActiveItem('Bitcoin Cash')}
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
        ${active ? 'bg-blue-900/50 text-blue-400' : 'hover:bg-gray-800 text-gray-300'}`}
      onClick={onClick}
    >
      <div className={`${active ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-200'}`}>
        {icon}
      </div>
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <span className={`font-medium ${active ? 'text-blue-400' : 'group-hover:text-gray-200'}`}>{label}</span>
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