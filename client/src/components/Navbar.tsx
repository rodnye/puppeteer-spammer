import { useState } from 'react';
import { Link } from 'wouter';
import {
  FaFacebookF,
  FaHouse,
  FaListCheck,
  FaUsers,
  FaNewspaper,
  FaGear,
  FaBars,
  FaXmark,
} from 'react-icons/fa6';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navItems = [
    { to: '/', icon: <FaHouse className="w-5 h-5" />, label: 'Dashboard' },
    { to: '/tasks', icon: <FaListCheck className="w-5 h-5" />, label: 'Tasks' },
    { to: '/groups', icon: <FaUsers className="w-5 h-5" />, label: 'Groups' },
    { to: '/posts', icon: <FaNewspaper className="w-5 h-5" />, label: 'Posts' },
    { to: '/session', icon: <FaGear className="w-5 h-5" />, label: 'Session' },
  ];

  return (
    <nav className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-bold flex items-center hover:text-indigo-200 transition-colors"
          >
            <FaFacebookF className="w-8 h-8" />
            <span className="hidden sm:inline">acebook Auto Publisher</span>
            <span className="sm:hidden">AP</span>
          </Link>

          {/* Botón de menú para móviles */}
          <button
            className="md:hidden focus:outline-none p-2 rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <FaXmark className="w-6 h-6" />
            ) : (
              <FaBars className="w-6 h-6" />
            )}
          </button>

          {/* Enlaces de navegación para desktop */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden bg-indigo-700 rounded-lg mt-2 mb-4 p-4 shadow-lg animate-fadeIn">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center px-4 py-3 rounded-lg hover:bg-indigo-800 transition-colors"
                  onClick={closeMenu}
                >
                  <span className="mr-3 text-indigo-300">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
