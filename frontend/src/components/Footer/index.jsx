import iconMail from '../../assets/images/icon-mail.png'
import iconTelegram from '../../assets/images/icon-telegram.png'

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#282828',
        height: '153px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          padding: '0 50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href='mailto:name@mail.ru'>
            <img src={iconMail} alt='Email' style={{ width: '50px', height: '50px' }} />
          </a>
          <a href='https://t.me/' target='_blank' rel='noreferrer'>
            <img src={iconTelegram} alt='Telegram' style={{ width: '50px', height: '50px' }} />
          </a>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '12px' }}>
            <span style={{ color: '#fff', fontSize: '18px', fontWeight: '500' }}>
              Телефон: +7 (999) 999 99-99
            </span>
            <span style={{ color: '#fff', fontSize: '18px', fontWeight: '500' }}>
              Почта: name@mail.ru
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          <span style={{ color: '#fff', fontSize: '18px', fontWeight: '500' }}>
            © Максимум
          </span>
          <a
            href='/privacy'
            style={{
              color: '#fff',
              fontSize: '18px',
              fontWeight: '500',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.4)',
            }}
          >
            Политика конфиденциальности
          </a>
        </div>
      </div>
    </footer>
  )
}
