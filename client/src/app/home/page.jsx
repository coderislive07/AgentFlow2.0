import React from 'react'
import Navbar from '../../components/Navbar'
import Hero from '../../components/home/Hero'
import Card_Section from '../../components/home/Card_Section'
import Workers from '../../components/home/Workers'
import Community from '../../components/home/Community'
import Footer from '../../components/Footer'

export default function HomePage() {
  return (
    <div>
      <Navbar/>
      <Hero/>
      <Card_Section/>
      <Workers/>
      <Community/>
      <Footer/>
    </div>
  )
}
