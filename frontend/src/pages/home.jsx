import React from 'react'
import Navbar from '../components/navbar'
import Search from '../components/search' // Import Search component

const Home = () => {
  return (
    <div className="flex">
      {/* Navbar */}
      <Navbar />
      <div className="flex-1 p-7 mt-1 flex items-start justify-end ">
        
        <Search placeholder="Search..." />
      </div>
    </div>
  )
}

export default Home
