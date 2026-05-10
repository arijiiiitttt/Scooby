import { Toaster } from 'react-hot-toast'
import { useStore } from './lib/store'
import { HomePage } from './components/HomePage'
import { AuditPage } from './components/AuditPage'
import { ProfilePage } from './components/ProfilePage'
import Blog from './pages/Blog'
import Docs from './pages/Docs'


export default function App() {
  const { page } = useStore()

  return (
    <div className="min-h-screen">
      {/* <Nav /> */}
      <main>
        {page === 'home'    && <HomePage />}
        {page === 'audit'   && <AuditPage />}
        {page === 'profile' && <ProfilePage />}
        {page === 'blog'    && <Blog/>}
        {page === 'docs'    && <Docs/>}
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#111620',
            color: '#e8eaf0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </div>
  )
}