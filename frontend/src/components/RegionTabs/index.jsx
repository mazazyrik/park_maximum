import { useState } from 'react'

const tabs = [
  { id: 'cfo', label: 'ЦФО', bg: '#282828', color: '#fff' },
  { id: 'south', label: 'Юг-России', bg: '#FEDA00', color: '#282828' },
  { id: 'new', label: 'Новые регионы', bg: '#F3F3F3', color: '#282828' },
]

export default function RegionTabs({ activeTab, onTabChange }) {
  return (
    <section className='region-tabs'>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type='button'
          onClick={() => onTabChange(tab.id)}
          className='region-tab'
          style={{
            backgroundColor: tab.bg,
            color: activeTab === tab.id && tab.id !== 'south' ? '#FEDA00' : tab.color,
            opacity: activeTab === tab.id ? 1 : 0.85,
          }}
        >
          {tab.label}
        </button>
      ))}
    </section>
  )
}
