import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import RegionTabs from './components/RegionTabs'
import About from './components/About'
import RoutesSection from './components/Routes'
import Tariffs from './components/Tariffs'
import Cta from './components/Cta'
import Footer from './components/Footer'

const Calculator = lazy(() => import('./pages/Calculator'))
const NewRegionsModal = lazy(() => import('./components/RegionTabs/NewRegionsModal'))
const RegionTariffsModal = lazy(() => import('./components/RegionTabs/RegionTariffsModal'))

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

function MainPage() {
  const [activeRegion, setActiveRegion] = useState('south')
  const [regionModal, setRegionModal] = useState(null)

  useEffect(() => {
    if (window.location.hash) return
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Header />
      <main className='site-main'>
        <Hero />
        <RegionTabs
          activeTab={activeRegion}
          onTabChange={setActiveRegion}
          onRegionModalClick={setRegionModal}
        />
        <About />
        <RoutesSection />
        <Tariffs />
        <Cta />
      </main>
      <Footer />
      {regionModal === 'new' && (
        <Suspense fallback={null}>
          <NewRegionsModal onClose={() => setRegionModal(null)} />
        </Suspense>
      )}
      {(regionModal === 'cfo' || regionModal === 'south') && (
        <Suspense fallback={null}>
          <RegionTariffsModal region={regionModal} onClose={() => setRegionModal(null)} />
        </Suspense>
      )}
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<><ScrollToTop /><MainPage /></>} />
      <Route
        path='/calculator'
        element={(
          <>
            <ScrollToTop />
            <Suspense fallback={<div className='calc-loading'>Загрузка...</div>}>
              <Calculator />
            </Suspense>
          </>
        )}
      />
    </Routes>
  )
}
