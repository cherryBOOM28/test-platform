import './App.css'
import { AuthProvider } from './auth/AuthContext'
import MainPage from './pages/MainPage'

function App() {

  return (
    <div>
      <AuthProvider>
        <MainPage />
      </AuthProvider>
    </div>
  )
}

export default App
