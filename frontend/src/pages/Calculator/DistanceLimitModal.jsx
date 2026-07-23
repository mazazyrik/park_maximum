import { useEffect, useRef } from 'react'

export default function DistanceLimitModal({ minimumDistance, onClose }) {
  const buttonRef = useRef(null)

  useEffect(() => {
    buttonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className='distance-modal-overlay' onClick={onClose}>
      <div
        className='distance-modal'
        role='dialog'
        aria-modal='true'
        aria-labelledby='distance-modal-title'
        aria-describedby='distance-modal-description'
        onClick={(event) => event.stopPropagation()}
      >
        <span className='distance-modal-mark' aria-hidden='true'>!</span>
        <h2 id='distance-modal-title' className='distance-modal-title'>
          Маршрут короче {minimumDistance} км
        </h2>
        <p id='distance-modal-description' className='distance-modal-text'>
          Мы осуществляем поездки протяжённостью от {minimumDistance} км.
          Пожалуйста, укажите другой пункт назначения.
        </p>
        <button
          ref={buttonRef}
          type='button'
          className='distance-modal-action'
          onClick={onClose}
        >
          Изменить маршрут
        </button>
      </div>
    </div>
  )
}
