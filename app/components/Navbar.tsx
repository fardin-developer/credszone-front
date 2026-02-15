'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { MdPerson, MdLogout } from 'react-icons/md';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { logout } from '@/lib/store/authSlice';
import AddBalanceModal from './AddBalanceModal';

interface NavbarProps {
    onMenuToggle: () => void;
    onNavigate?: (screen: string) => void;
    walletBalance?: number;
}

export default function Navbar({ onMenuToggle, onNavigate, walletBalance }: NavbarProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const menuRef = useRef<HTMLDivElement>(null);

    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
    const [imgError, setImgError] = useState(false);

    // Get wallet balance from Redux user state, fallback to prop, then to 0
    const displayWalletBalance = user?.walletBalance ?? walletBalance ?? 0;

    // Click-outside listener to close profile menu
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleProfileClick = () => {
        setIsProfileMenuOpen(false);
        if (onNavigate) {
            onNavigate('profile');
        } else {
            router.push('/profile');
        }
    };

    return (
        <>
            <nav className="px-4 md:px-6 lg:px-8 relative z-50 pt-2 pb-2">
                <div className="flex items-center justify-between">
                    {/* Left: Menu and Logo */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onMenuToggle}
                            className="w-7 h-7 flex flex-col justify-center gap-1 hover:opacity-80 transition-opacity"
                            aria-label="Open menu"
                        >
                            <div className="w-full h-0.5 bg-white rounded"></div>
                            <div className="w-full h-0.5 bg-white rounded"></div>
                            <div className="w-full h-0.5 bg-white rounded"></div>
                        </button>

                        <div className="flex-shrink-0 -ml-1">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={50}
                                height={50}
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* Right: Wallet & Profile */}
                    <div className="flex items-center gap-5">
                        {/* Wallet Balance - Only for authenticated users */}
                        {isAuthenticated && (
                            <button
                                onClick={() => setIsAddBalanceModalOpen(true)}
                                className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 bg-[#2a2c2f] border border-[#7F8CAA] hover:bg-[#33353a] transition-colors"
                            >
                                <Image src="/coin.png" alt="Coin" width={18} height={18} />
                                <span className="font-semibold text-white text-xs">{displayWalletBalance} +</span>
                            </button>
                        )}

                        {/* Profile Menu */}
                        {isAuthenticated ? (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className={`w-9 h-9 rounded-full bg-[#7F8CAA] flex items-center justify-center cursor-pointer overflow-hidden shadow-md transition-all hover:shadow-lg active:scale-95 border-2 ${isProfileMenuOpen ? 'border-white' : 'border-transparent'
                                        }`}
                                    aria-label="Profile menu"
                                >
                                    {user?.profilePicture && !imgError ? (
                                        <Image
                                            src={user.profilePicture}
                                            alt="Profile"
                                            width={36}
                                            height={36}
                                            className="w-full h-full object-cover"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <FaUserCircle className="text-white text-2xl" />
                                    )}
                                </button>

                                {/* Profile Dropdown */}
                                {isProfileMenuOpen && (
                                    <div className="absolute top-[46px] right-0 w-52 bg-[#252729] border border-[#3a3c3f] rounded-lg shadow-2xl z-[9999] overflow-hidden">
                                        {/* User Info Header */}
                                        <div className="px-3 py-2.5 border-b border-[#3a3c3f] bg-[#2a2c2f]">
                                            <p className="text-white text-sm font-semibold truncate">{user?.name || 'User'}</p>
                                            <p className="text-gray-400 text-xs truncate mt-0.5">{user?.email || 'Guest User'}</p>
                                        </div>

                                        {/* Profile Link */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleProfileClick();
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-white hover:bg-[#3a3c3f] transition-colors text-sm"
                                        >
                                            <MdPerson className="text-lg text-[#7F8CAA]" />
                                            <span>My Profile</span>
                                        </button>

                                        {/* Logout */}
                                        <button
                                            onClick={() => {
                                                dispatch(logout());
                                                localStorage.removeItem('authToken');
                                                window.location.reload();
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-red-400 hover:bg-[#3a3c3f] transition-colors border-t border-[#3a3c3f] text-sm font-medium"
                                        >
                                            <MdLogout className="text-lg" />
                                            <span>Log Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => router.push('/login')}
                                className="w-9 h-9 rounded-full bg-[#7F8CAA] flex items-center justify-center hover:bg-[#6a7a99] transition-colors shadow-md"
                                aria-label="Login"
                            >
                                <MdPerson className="text-xl text-white" />
                            </button>
                        )}
                    </div>
                </div>
            </nav>
            <AddBalanceModal
                isOpen={isAddBalanceModalOpen}
                onClose={() => setIsAddBalanceModalOpen(false)}
                currentBalance={displayWalletBalance}
            />
        </>
    );
}
