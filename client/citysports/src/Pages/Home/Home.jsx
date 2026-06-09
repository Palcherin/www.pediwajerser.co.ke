import React from 'react'
import Announcement from '../../Components/home/Announcements'
import { HeroCarousel } from '../../Components/home/Hero'
import NewArrivals from '../../Components/home/NewArrivals'
import ShopPage from '../../Components/home/shopPage'


const HomePage = () => {
  return (
    <div>
       <HeroCarousel />
      <NewArrivals />
      <Announcement/>
     
    </div>
    
  )
}

export default HomePage