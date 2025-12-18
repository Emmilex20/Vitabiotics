import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Heart,
  Zap,
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-vita-primary to-vita-primary/95 text-white mt-16">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Vitabiotics Logo"
                className="w-10 h-10 object-contain rounded-md bg-white/20 p-1"
              />
              <h3 className="font-bold text-xl">Vitabiotics</h3>
            </div>

            <p className="text-white/80 text-sm leading-relaxed">
              Your trusted partner in health and wellness. We provide premium supplements tailored to your unique needs.
            </p>

            <div className="flex gap-3 pt-2">
              <a
                href="#"
                className="w-10 h-10 bg-white/20 hover:bg-vita-secondary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/20 hover:bg-vita-secondary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/20 hover:bg-vita-secondary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/20 hover:bg-vita-secondary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-vita-secondary" />
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-white/80 hover:text-vita-secondary transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-vita-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-white/80 hover:text-vita-secondary transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-vita-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/quiz"
                  className="text-white/80 hover:text-vita-secondary transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-vita-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Take Quiz
                </Link>
              </li>
              <li>
                <Link
                  to="/recommendations"
                  className="text-white/80 hover:text-vita-secondary transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-vita-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Recommendations
                </Link>
              </li>
              <li>
                <Link
                  to="/track"
                  className="text-white/80 hover:text-vita-secondary transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-vita-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Track
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-vita-secondary" />
              Support
            </h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-white/80 hover:text-vita-secondary transition-colors duration-300">Contact Us</a></li>
              <li><a href="#" className="text-white/80 hover:text-vita-secondary transition-colors duration-300">FAQ</a></li>
              <li><a href="#" className="text-white/80 hover:text-vita-secondary transition-colors duration-300">Privacy Policy</a></li>
              <li><a href="#" className="text-white/80 hover:text-vita-secondary transition-colors duration-300">Terms & Conditions</a></li>
              <li><a href="#" className="text-white/80 hover:text-vita-secondary transition-colors duration-300">Return Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4">Get in Touch</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-vita-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/60 text-xs">Phone</p>
                  <a href="tel:+1234567890" className="text-white hover:text-vita-secondary transition-colors">+1 (234) 567-890</a>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-vita-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/60 text-xs">Email</p>
                  <a href="mailto:support@vitabiotics.com" className="text-white hover:text-vita-secondary transition-colors break-all">
                    support@vitabiotics.com
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-vita-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/60 text-xs">Address</p>
                  <p className="text-white">
                    123 Health Street<br />
                    Wellness City, WC 12345
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-white/10 rounded-lg p-6 mb-8 backdrop-blur-sm border border-white/20">
          <div className="max-w-2xl mx-auto">
            <h3 className="font-bold text-lg mb-2">Stay Updated</h3>
            <p className="text-white/80 text-sm mb-4">
              Subscribe to our newsletter for exclusive offers, health tips, and new product launches.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vita-secondary"
              />
              <button className="px-6 py-3 bg-vita-secondary text-vita-primary font-bold rounded-lg hover:bg-vita-secondary/90 transition-all duration-300 hover:scale-105 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/70 text-sm text-center md:text-left">
              &copy; {currentYear} Vitabiotics. All rights reserved. Made with{' '}
              <Heart className="w-4 h-4 inline text-vita-secondary fill-vita-secondary" /> for your health.
            </p>

            <div className="flex gap-6 text-sm">
              <a href="#" className="text-white/70 hover:text-vita-secondary transition-colors">Sitemap</a>
              <a href="#" className="text-white/70 hover:text-vita-secondary transition-colors">Accessibility</a>
              <a href="#" className="text-white/70 hover:text-vita-secondary transition-colors">Careers</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
