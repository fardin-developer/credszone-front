'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks/redux';
import { loginStart, loginFailure, clearError } from '@/lib/store/authSlice';
import apiClient from '@/lib/api/axios';
import FadedCircle from './FadedCircle';

interface LoginPageProps {
  onNavigate?: (screen: string) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone'); // Phone is default
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Reset loading state immediately when component mounts (in case user navigates back from OTP page)
  useEffect(() => {
    // Reset local loading state immediately
    setIsLoading(false);

    // Reset Redux loading state to prevent PublicRoute from showing loading spinner
    // This ensures that when user navigates back from OTP page, login page is not stuck on loading
    dispatch(loginFailure(''));
    dispatch(clearError());
  }, [dispatch]);

  // Handle browser back button - prevent navigation outside app
  useEffect(() => {
    // Push a state to the history stack to prevent going back outside
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      // Push another state to prevent going back
      window.history.pushState(null, '', window.location.href);
      // Navigate to dashboard instead of going back outside
      if (onNavigate) {
        onNavigate('home');
      } else {
        router.push('/');
      }
    };

    // Listen for popstate event (browser back button)
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router, onNavigate]);

  const handleLogin = async () => {
    if (loginMethod === 'phone' && !phone.trim()) {
      return;
    }
    if (loginMethod === 'email' && !email.trim()) {
      return;
    }

    setIsLoading(true);
    dispatch(loginStart());

    try {
      const requestBody = loginMethod === 'phone'
        ? { phone: phone }
        : { email: email };

      const response = await apiClient.post('/user/send-otp', requestBody);

      if (response.data) {
        // Store the login data for OTP verification page
        const loginValue = loginMethod === 'phone' ? phone : email;
        localStorage.setItem('loginData', JSON.stringify({
          email: loginValue,
          isPhoneLogin: loginMethod === 'phone'
        }));

        // Store separately for easy retrieval
        if (loginMethod === 'phone') {
          localStorage.setItem('loginPhone', phone);
        } else {
          localStorage.setItem('loginEmail', email);
        }

        // Navigate immediately
        if (onNavigate) {
          onNavigate('otp-verification');
        } else {
          router.push('/otp-verification');
        }
      }
    } catch (error: any) {
      // Error handling without toast
      dispatch(loginFailure(error?.response?.data?.message || 'Failed to send OTP'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-4 sm:pt-6 px-4 relative overflow-hidden" style={{ backgroundColor: '#232426' }}>
      {/* Desktop Container */}
      <div className="w-full max-w-md lg:max-w-lg mx-auto">
        {/* Back Button */}
        <div className="w-full mb-3">
          <button
            type="button"
            onClick={() => {
              if (onNavigate) {
                onNavigate('home');
              } else {
                router.push('/');
              }
            }}
            className="flex items-center cursor-pointer"
            style={{
              color: '#7F8CAA',
              fontFamily: 'Poppins',
              fontWeight: 700,
              fontStyle: 'normal',
              fontSize: '16px',
              lineHeight: '100%',
              letterSpacing: '0%'
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            go back
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Creds Zone Logo"
              width={192}
              height={192}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            <span className="text-white">Creds</span>
            <span className="ml-2" style={{ color: '#7F8CAA' }}>Zone</span>
          </h1>
          <p className="text-white text-xs sm:text-sm">your best top-up destination</p>
        </div>

        {/* Login Form */}
        <div className="w-full relative">
          {/* Form Container */}
          <div className="rounded-2xl p-6 pt-12 shadow-lg relative border-2 border-white" style={{ backgroundColor: '#7F8CAA' }}>
            {/* User Icon */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Login Method Toggle */}
            <div className="mt-8 mb-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${loginMethod === 'phone'
                      ? 'bg-white text-gray-800'
                      : 'bg-gray-300 text-gray-600'
                    }`}
                >
                  Phone
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${loginMethod === 'email'
                      ? 'bg-white text-gray-800'
                      : 'bg-gray-300 text-gray-600'
                    }`}
                >
                  Email
                </button>
              </div>
            </div>

            {/* Phone/Email Input */}
            <div>
              {loginMethod === 'phone' ? (
                <>
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 text-white mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="text-white font-medium">Phone</span>
                  </div>
                  <label htmlFor="login-field" className="sr-only">Phone number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="enter your phone number"
                    id="login-field"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                    style={{ backgroundColor: '#C3BFBF' }}
                  />
                </>
              ) : (
                <>
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 text-white mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="text-white font-medium">Email</span>
                  </div>
                  <label htmlFor="login-field" className="sr-only">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="enter your email"
                    id="login-field"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                    style={{ backgroundColor: '#C3BFBF' }}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Login Button */}
        <div className="mt-6 sm:mt-8 w-full">
          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoading}
            aria-busy={isLoading}
            className="w-full border-2 border-white py-3 sm:py-4 text-white font-bold text-base sm:text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#7F8CAA', borderRadius: '25px' }}
          >
            {isLoading ? 'SENDING OTP...' : 'LOGIN NOW'}
          </button>
        </div>

        {/* Faded Circle */}
        <FadedCircle top="1000px" />
      </div>
    </div>
  );
}