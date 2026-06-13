import Home from './pages/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AlbumPage from './pages/AlbumPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/album/:id' element={<AlbumPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
