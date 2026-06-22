import Home from "./pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AlbumPage from "./pages/AlbumPage";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import Search from "./pages/Search";
import ArtistPage from "./pages/ArtistPage";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import { Footer } from "./components/Footer";
import AlbumRatings from "./pages/AlbumRatings";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/album/:id" element={<AlbumPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/artist/:id" element={<ArtistPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/u/:username" element={<UserProfile />} />
            <Route path="/album/:id/ratings" element={<AlbumRatings />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
