'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks/redux';
import { loginSuccess, loginFailure, registerSuccess, registerFailure } from '@/lib/store/authSlice';
import apiClient from '@/lib/api/axios';
import FadedCircle from './FadedCircle';

interface OTPVerificationPageProps {
  onNavigate?: (screen: string) => void;
}

export default function OTPVerificationPage({ onNavigate }: OTPVerificationPageProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6-digit OTP
  const [loginData, setLoginData] = useState<{ email: string, isPhoneLogin: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Reset loading state on mount
    setIsLoading(false);

    // Get login data from localStorage
    const storedData = localStorage.getItem('loginData');
    if (storedData) {
      try {
        setLoginData(JSON.parse(storedData));
      } catch (error) {
        console.error('Error parsing loginData:', error);
        localStorage.removeItem('loginData');
        if (onNavigate) {
          onNavigate('login');
        } else {
          router.push('/login');
        }
      }
    } else {
      // If no login data, redirect to login page
      if (onNavigate) {
        onNavigate('login');
      } else {
        router.push('/login');
      }
    }
    setIsInitializing(false);
  }, [router, onNavigate]);

  // Handle visibility change (when app comes back from background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reset loading state when app becomes visible
        setIsLoading(false);
        // Re-check loginData
        const storedData = localStorage.getItem('loginData');
        if (storedData) {
          try {
            setLoginData(JSON.parse(storedData));
          } catch (error) {
            console.error('Error parsing loginData on visibility change:', error);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleProceed = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      return;
    }

    if (!loginData) {
      return;
    }

    setIsLoading(true);

    try {
      // Build request body based on login method - use email for email login, phone for phone login
      const requestBody = loginData.isPhoneLogin
        ? { phone: loginData.email, otp: otpString }
        : { email: loginData.email, otp: otpString };

      const response = await apiClient.post('/user/verify-otp', requestBody);
      const responseData = response.data;

      if (responseData.requiresRegistration) {
        // Don't store phone number - pass it via Redux or URL params if needed
        // Clear login data from localStorage
        localStorage.removeItem('loginData');
        // Navigate to registration page
        setTimeout(() => {
          if (onNavigate) {
            onNavigate('register');
          } else {
            router.push('/register');
          }
        }, 1500);
      } else {
        // Handle existing user login response
        // Dispatch login success action
        dispatch(loginSuccess({
          user: responseData.user,
          token: responseData.token
        }));

        // Store only token in localStorage for persistence
        if (responseData.token) {
          localStorage.setItem('authToken', responseData.token);
        }

        // Clear login data from localStorage
        localStorage.removeItem('loginData');

        // Navigate to intended path or dashboard after a short delay
        setTimeout(() => {
          try {
            const intended = localStorage.getItem('intendedPath');
            if (intended) {
              localStorage.removeItem('intendedPath');
              if (onNavigate) {
                onNavigate('home');
              } else {
                router.push(intended);
                return;
              }
            }
          } catch { }
          if (onNavigate) {
            onNavigate('home');
          } else {
            router.push('/');
          }
        }, 1500);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Invalid OTP. Please try again.';
      dispatch(loginFailure(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading only during initialization, not when coming back from background
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(35, 36, 38)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // If no loginData after initialization, don't render (will redirect)
  if (!loginData) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-8 sm:pt-10 px-4 relative overflow-hidden" style={{ backgroundColor: 'rgb(35, 36, 38)' }}>
      {/* Logo */}
      <div className="">
        <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 flex items-center justify-center">
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
        <h1 className="text-white font-bold mb-2 text-2xl sm:text-3xl">
          ENTER OTP
        </h1>
      </div>

      {/* Instructional Text */}
      <div className="text-center mb-6 sm:mb-8 px-2 sm:px-4">
        <p className="text-white mb-2 text-sm sm:text-base">
          A one-time password has been sent to your {loginData?.isPhoneLogin ? 'phone number' : 'email'} at
        </p>
        <div className="flex items-center justify-center">
          {loginData?.isPhoneLogin ? (
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'rgb(127, 140, 170)' }}>
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'rgb(127, 140, 170)' }}>
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          )}
          <span className="text-sm sm:text-base" style={{ color: 'rgb(127, 140, 170)' }}>{loginData?.email || ''}</span>
        </div>
      </div>

      {/* OTP Input Fields */}
      <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            aria-label={`OTP digit ${index + 1}`}
            className="text-center text-white font-bold text-lg sm:text-xl focus:outline-none focus:ring-2 focus:ring-white"
            style={{
              width: '44px',
              height: '48px',
              borderRadius: '25px',
              backgroundColor: 'rgb(195, 191, 191)',
              border: 'none',
              opacity: 1
            }}
          />
        ))}
      </div>

      {/* Proceed Button */}
      <div className="w-full max-w-sm px-2 sm:px-0 mb-6 sm:mb-8">
        <button
          type="button"
          onClick={handleProceed}
          disabled={isLoading}
          aria-busy={isLoading}
          className="w-full text-white font-bold text-base sm:text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            height: '52px',
            backgroundColor: 'rgb(127, 140, 170)',
            borderRadius: '25px',
            border: '1px solid transparent',
            opacity: 1
          }}
        >
          {isLoading ? 'VERIFYING...' : 'PROCEED'}
        </button>
      </div>

      {/* Resend OTP */}
      <div className="text-center mb-4">
        <button
          type="button"
          onClick={() => onNavigate ? onNavigate('login') : router.push('/login')}
          className="hover:text-white transition-colors"
          style={{ color: 'rgb(127, 140, 170)' }}
        >
          Didn't receive OTP? Resend
        </button>
      </div>

      {/* Alternative Login Option */}
      <div className="text-center mb-8">
        <p className="text-white mb-2 text-sm sm:text-base">
          {loginData?.isPhoneLogin ? "don't have access to your phone?" : "don't have access to your email?"}
        </p>
        <button
          type="button"
          onClick={() => onNavigate ? onNavigate('login') : router.push('/login')}
          className="hover:text-white transition-colors"
          style={{ color: 'rgb(127, 140, 170)' }}
        >
          {loginData?.isPhoneLogin ? 'login using email' : 'login using phone number'}
        </button>
      </div>

      {/* Faded Circles */}
      <FadedCircle top="-50px" left="200px" />
      <FadedCircle bottom="-50px" right="200px" />
    </div>
  );
}
