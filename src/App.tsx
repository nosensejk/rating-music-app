import Home from './pages/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AlbumPage from './pages/AlbumPage'
import Profile from './pages/Profile'
import Header from './components/Header'

function App() {

  return (
    <BrowserRouter>
      <Header/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/album/:id' element={<AlbumPage/>}/>
        <Route path='/profile' element={<Profile/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
