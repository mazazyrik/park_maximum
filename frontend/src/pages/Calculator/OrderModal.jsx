import { useState } from 'react'
import { createOrder } from '../../api'

const inputStyle = {
  width: '100%',
  height: '60px',
  background: 'transparent',
  border: '2px solid rgba(255,255,255,0.35)',
  borderRadius: '50px',
  padding: '0 24px',
  fontSize: '18px',
  fontFamily: 'inherit',
  color: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
}

export default function OrderModal({ onClose, orderData }) {
  const [fio, setFio] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createOrder({
        ...orderData,
        fio,
        phone,
      })
      setSuccess(true)
    } catch (err) {
      const msg = typeof err === 'object'
        ? Object.values(err).flat().join(', ')
        : 'Ошибка при отправке заявки'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    if (success) setSuccess(false)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(40,40,40,0.78)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: '#282828',
          borderRadius: '20px',
          padding: '48px 52px 56px',
          width: '520px',
          maxWidth: '90vw',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <h2
              style={{
                color: '#FEDA00',
                fontSize: '22px',
                fontWeight: '800',
                lineHeight: '1.4',
                marginBottom: '24px',
              }}
            >
              Заявка принята!
            </h2>
            <p style={{ color: '#fff', fontSize: '17px', marginBottom: '36px', lineHeight: '1.6' }}>
              Оператор свяжется с вами в ближайшее время.
            </p>
            <button
              onClick={handleClose}
              style={{
                width: '100%',
                height: '65px',
                background: '#FEDA00',
                color: '#282828',
                border: 'none',
                borderRadius: '20px',
                fontSize: '20px',
                fontWeight: '800',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              Закрыть
            </button>
          </div>
        ) : (
          <>
            <h2
              style={{
                color: '#FEDA00',
                fontSize: '20px',
                fontWeight: '800',
                lineHeight: '1.4',
                marginBottom: '36px',
              }}
            >
              Оператор свяжется с вами в ближайшее время
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '18px',
                    marginBottom: '10px',
                  }}
                >
                  ФИО
                </label>
                <input
                  type='text'
                  value={fio}
                  onChange={(e) => setFio(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: error ? '16px' : '36px' }}>
                <label
                  style={{
                    display: 'block',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '18px',
                    marginBottom: '10px',
                  }}
                >
                  Номер телефона
                </label>
                <input
                  type='tel'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              {error && (
                <p style={{ color: '#ff6b6b', fontSize: '14px', marginBottom: '16px' }}>
                  {error}
                </p>
              )}

              <button
                type='submit'
                disabled={loading}
                style={{
                  width: '100%',
                  height: '65px',
                  background: '#FEDA00',
                  color: '#282828',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '20px',
                  fontWeight: '800',
                  fontFamily: 'inherit',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {loading ? 'Отправка...' : 'Оставить заявку'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
