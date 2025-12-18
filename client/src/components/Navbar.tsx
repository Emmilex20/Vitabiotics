import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const TRANSITION_DURATION = 300;

const Navbar: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');

  const closeTimer = useRef<number | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  /* ----------------------- MENU LIFECYCLE ----------------------- */
  const openMenu = () => {
    setShowMenu(true);
    requestAnimationFrame(() => setIsOpen(true));
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.style.overflow = '';

    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setShowMenu(false);
    }, TRANSITION_DURATION);
  };

  const toggleMenu = () => {
    showMenu ? closeMenu() : openMenu();
  };

  /* ----------------------- ESC + CLEANUP ----------------------- */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && closeMenu();
    document.addEventListener('keydown', esc);

    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  /* ----------------------- PROFILE DROPDOWN ----------------------- */
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  /* ----------------------- SEARCH ----------------------- */
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/products?search=${encodeURIComponent(search)}`);
    setSearch('');
    closeMenu();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Vitabiotics" className="w-10 h-10" />
            <span className="hidden sm:block text-xl font-extrabold text-vita-primary">
              Vitabiotics
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8">
            {['Home', 'Products', 'Quiz', 'Recommendations'].map((item) => (
              <Link
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className="relative font-medium text-gray-700 hover:text-vita-primary transition"
              >
                {item}
              </Link>
            ))}

            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="px-3 py-1 rounded-lg text-sm font-semibold bg-vita-primary/10 text-vita-primary hover:bg-vita-primary/20"
              >
                Admin
              </Link>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-4">

            {/* SEARCH */}
            <form
              onSubmit={submitSearch}
              className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl focus-within:ring-2 ring-vita-primary"
            >
              <Search size={16} className="text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products"
                className="bg-transparent outline-none text-sm w-44"
              />
            </form>

            {/* CART */}
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-vita-primary" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 text-xs bg-vita-primary text-white rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* USER */}
            {user ? (
              <div ref={profileRef} className="relative hidden md:block">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-9 h-9 rounded-full bg-vita-primary text-white font-bold flex items-center justify-center"
                >
                  {user.firstName?.[0] || <User size={16} />}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border rounded-xl shadow-xl p-2">
                    <Link to="/profile" className="block px-3 py-2 rounded-lg hover:bg-gray-100">Profile</Link>
                    <Link to="/orders" className="block px-3 py-2 rounded-lg hover:bg-gray-100">Orders</Link>
                    <Link to="/settings" className="block px-3 py-2 rounded-lg hover:bg-gray-100">Settings</Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex gap-3">
                <Link to="/login" className="px-4 py-2 rounded-lg text-vita-primary hover:bg-vita-primary/10">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-lg bg-vita-primary text-white">
                  Sign Up
                </Link>
              </div>
            )}

            {/* MOBILE TOGGLE */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {showMenu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {showMenu && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={closeMenu}>
          <div className="absolute inset-0 bg-black/40" />

          <aside
            onClick={(e) => e.stopPropagation()}
            className={`absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-2xl p-6 transition-transform duration-300 ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <button
              onClick={closeMenu}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
            >
              <X />
            </button>

            {/* SEARCH */}
            <form onSubmit={submitSearch} className="mb-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-3 border rounded-xl"
              />
            </form>

            {/* LINKS */}
            <div className="flex flex-col gap-2">
              {['Home', 'Products', 'Quiz', 'Recommendations'].map((item) => (
                <Link
                  key={item}
                  to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                  onClick={closeMenu}
                  className="block px-4 py-3 rounded-xl hover:bg-gray-100"
                >
                  {item}
                </Link>
              ))}

              {/* ADMIN LINK */}
              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  onClick={closeMenu}
                  className="mt-2 block px-4 py-3 rounded-xl bg-vita-primary/10 text-vita-primary font-semibold"
                >
                  Admin Dashboard
                </Link>
              )}

              {/* USER PROFILE / LOGIN */}
              {user ? (
                <div ref={profileRef} className="mt-4 relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-vita-primary/10 rounded-lg"
                  >
                    <span>{user.firstName}</span>
                    <User size={20} />
                  </button>

                  {profileOpen && (
                    <div className="mt-2 bg-white border rounded-xl shadow-xl p-2 flex flex-col gap-2">
                      <Link to="/profile" onClick={closeMenu} className="px-3 py-2 rounded-lg hover:bg-gray-100">Profile</Link>
                      <Link to="/orders" onClick={closeMenu} className="px-3 py-2 rounded-lg hover:bg-gray-100">Orders</Link>
                      <Link to="/settings" onClick={closeMenu} className="px-3 py-2 rounded-lg hover:bg-gray-100">Settings</Link>
                      <button
                        onClick={() => { logout(); closeMenu(); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="px-4 py-3 text-center rounded-lg border border-vita-primary text-vita-primary hover:bg-vita-primary/10"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="px-4 py-3 text-center rounded-lg bg-vita-primary text-white hover:bg-vita-primary/90"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* CART */}
            <Link
              to="/cart"
              onClick={closeMenu}
              className="mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-vita-primary/10 rounded-lg"
            >
              <ShoppingCart />
              <span>Cart ({cartCount})</span>
            </Link>
          </aside>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
