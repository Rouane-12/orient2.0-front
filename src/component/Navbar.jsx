import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PhList, PhXLight } from "../uikits/Icons";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const navItems = [
    { href: "#accueil", label: "Accueil" },
    { href: "#fonctionnement", label: "Fonctionnement" },
    { href: "#temoignages", label: "Témoignages" },
    { href: "#faq", label: "FAQ" },
    { href: "#cta", label: "Commencer", isPrimary: true }
  ];

  return (
    <>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`navbar ${scrolled ? "scrolled" : ""}`}
      >
        <a href="/" className="logo">
          <motion.img
            src={scrolled ? "/public/images/logo4.png" : "/public/images/logo3.png"}
            alt="logo"
            key={scrolled ? "logo4" : "logo3"}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </a>

        <div className="navDesktop">
          {navItems.map((item, i) => (
            <motion.a
              key={item.href}
              href={item.href}
              className={item.isPrimary ? "nav-link nav-link--primary" : "nav-link"}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <b>{item.label}</b>
            </motion.a>
          ))}
        </div>

        <motion.button
          className="navHamburger"
          onClick={toggleMenu}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={menuOpen ? "close" : "menu"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {menuOpen ? <PhXLight /> : <PhList />}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="navMobile"
          >
            <div className="navMobile__header">
              <motion.img
                src="/public/images/logo4.png"
                alt="logo"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 }}
              />
              <motion.button
                onClick={toggleMenu}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="navMobile__close"
              >
                <PhXLight />
              </motion.button>
            </div>
            <div className="navMobile__links">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={toggleMenu}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 150 }}
                  whileHover={{ x: 8 }}
                  className={item.isPrimary ? "navMobile__link navMobile__link--primary" : "navMobile__link"}
                >
                  {item.label}
                </motion.a>
              ))}
            </div>
            <div className="navMobile__footer">
              <div className="navMobile__blob" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
