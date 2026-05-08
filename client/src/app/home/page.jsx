import React from 'react'
import Hero from '../../components/home/Hero'
import Card_Section from '../../components/home/Card_Section'
import Workers from '../../components/home/Workers'
import Community from '../../components/home/Community'

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <Card_Section />
      <Workers />
      <Community />
    </div>
  )
}
