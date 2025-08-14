import "./App.css"
import { BrowserRouter, Routes, Route, useLocation, Router } from "react-router-dom"
import { useEffect } from "react";

// Pages
//import Homepage from "./pages/Start" // Updated from "./pages/Start"
//import History from "./pages/New"
import ScrollToTop from "./components/ScrollToTop"

// Components
import Footer from "./components/Footer"
import ScrollHeader from "./components/ScrollHeader"


function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RoutesWithNavbar />
    </BrowserRouter>
  )
}

const RoutesWithNavbar = () => {
  const location = useLocation()
  const hideNavbar = location.pathname === "/landing"

  useEffect(() => {
    const path = location.pathname.replace(/\/$/, "").toLowerCase();
    switch (path) {
      case "/privacypolicy":
        document.title = "Privacy Policy";
        break;
      case "/skilldevelopment":
        document.title = "Skill Development";
        break;
      case "/termsandconditions":
        document.title = "Terms and Conditions";
        break;
      case "/coc":
        document.title = "Code of Conduct";
        break;
      case "/founderchairman":
        document.title = "Chairman & Managing Trustee";
        break;
      case "/csii":
        document.title = "Centre for Social Impact & Innovation";
        break;
      case "/ccae":
        document.title = "Centre for Civil Administration & Engagement";
        break;
      case "/csaa":
        document.title = "Centre for Social Awareness & Action";
        break;
      default:
        document.title = "SWIS Foundation";
    }
  }, [location.pathname]);

  return (
    <>
      {!hideNavbar && <ScrollHeader />}
      
      <Routes>
        
       
   
        {/* Optional: Redirect unmatched routes to homepage */}
           
      </Routes>
      
      {!hideNavbar && <Footer />}
    </>
  )
}

export default App
