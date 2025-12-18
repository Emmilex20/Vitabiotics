// /client/src/pages/RegisterPage.tsx
import React, { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading, error, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (firstName && lastName && email && password) {
      await register({ firstName, lastName, email, password });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center text-vita-primary">Create Your Account</h2>
        
        {error && (
          <div className="p-3 text-sm font-medium text-red-700 bg-red-100 rounded-lg" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full p-3 mt-1 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full p-3 mt-1 border border-gray-300 rounded-lg" />
            </div>
          </div>

          {/* Email and Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 mt-1 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 mt-1 border border-gray-300 rounded-lg" />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-lg font-semibold text-white rounded-lg transition duration-150 ${
              isLoading 
                ? 'bg-vita-primary opacity-70 cursor-not-allowed' 
                : 'bg-vita-primary hover:bg-[#004a44]'
            }`}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-vita-primary hover:text-[#004a44]">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;