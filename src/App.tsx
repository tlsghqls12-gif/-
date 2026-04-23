import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import PriceInfo from "./pages/PriceInfo";
import Items from "./pages/Items";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import PurchaseStatus from "./pages/PurchaseStatus";
import OperationGuide from "./pages/OperationGuide";
import ScheduleCalendar from "./pages/ScheduleCalendar";
import NoticeBoard from "./pages/NoticeBoard";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen font-sans bg-[#F8FAFC] flex flex-col">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/price" element={<PriceInfo />} />
              <Route path="/items" element={<Items />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/status" element={<PurchaseStatus />} />
              <Route path="/guide" element={<OperationGuide />} />
              <Route path="/guide/schedule" element={<ScheduleCalendar />} />
              <Route path="/guide/news" element={<NoticeBoard />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
