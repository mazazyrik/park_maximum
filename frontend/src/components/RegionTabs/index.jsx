import { useState } from 'react'

const tabs = [
  { id: 'cfo', label: 'ЦФО', bg: '#282828', color: '#fff' },
  { id: 'south', label: 'Юг-России', bg: '#FEDA00', color: '#282828' },
  { id: 'new', label: 'Новые регионы', bg: '#F3F3F3', color: '#282828' },
]

export default function RegionTabs({ activeTab, onTabChange }) {
  return (
    <section style={{ display: 'flex', width: '100%', height: '237px' }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            flex: 1,
            backgroundColor: tab.bg,
            color: activeTab === tab.id && tab.id !== 'south' ? '#FEDA00' : tab.color,
            border: 'none',
            cursor: 'pointer',
            fontSize: '40px',
            fontWeight: '800',
            fontFamily: 'inherit',
            transition: 'opacity 0.2s',
            opacity: activeTab === tab.id ? 1 : 0.85,
          }}
        >
          {tab.label}
        </button>
      ))}
    </section>
  )
}
