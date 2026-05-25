import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import RegionTabs from './components/RegionTabs'
import About from './components/About'
import RoutesSection from './components/Routes'
import Tariffs from './components/Tariffs'
import Cta from './components/Cta'
import Footer from './components/Footer'
import Calculator from './pages/Calculator'

function MainPage() {
  const [activeRegion, setActiveRegion] = useState('south')
  return (
    <>
      <Header />
      <main style={{ paddingTop: '153px' }}>
        <Hero />
        <RegionTabs activeTab={activeRegion} onTabChange={setActiveRegion} />
        <About />
        <RoutesSection />
        <Tariffs />
        <Cta />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<MainPage />} />
      <Route path='/calculator' element={<Calculator />} />
    </Routes>
  )
}
