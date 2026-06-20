import Home from './pages/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AlbumPage from './pages/AlbumPage'
import Profile from './pages/Profile'
import Header from './components/Header'
import Search from './pages/Search'
import ArtistPage from './pages/ArtistPage'
import Settings from './pages/Settings'
import UserProfile from './pages/UserProfile'
import { Footer } from './components/Footer'

function App() {

  return (
    <BrowserRouter>
      <Header/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/album/:id' element={<AlbumPage/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/search' element={<Search/>}/>
        <Route path='/artist/:id' element={<ArtistPage/>}/>
        <Route path='/settings' element={<Settings/>}/>
        <Route path='/u/:username' element={<UserProfile/>}/>
      </Routes>
      <Footer/>
    </BrowserRouter>
  )
}

export default App
