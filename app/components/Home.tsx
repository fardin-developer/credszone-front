'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaPlus, FaWhatsapp } from 'react-icons/fa';
import { GiShoppingBag } from 'react-icons/gi';
import { MdBarChart } from 'react-icons/md';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { initializeAuth } from '@/lib/store/authSlice';
import apiClient from '@/lib/api/axios';
import BottomNavigation from './BottomNavigation';
import SideMenu from './SideMenu';
import AuthChecker from './AuthChecker';
import Navbar from './Navbar';
import WelcomeBanner from './WelcomeBanner';

interface DashboardPageProps {
  onNavigate?: (screen: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps = {}) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { user, isAuthenticated, token } = useAppSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Initialize auth
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    fetchGames();
  }, []);



  const fetchGames = async () => {
    try {
      setGamesLoading(true);
      const response = await apiClient.get('/games/get-all');
      if (response.data.success) setGames(response.data.games);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setGamesLoading(false);
    }
  };

  const dashboardContent = (
    <div className="min-h-screen relative p-0 m-0 bg-[#232426]">
      <div className="w-full">
        {/* Navbar Component */}
        <Navbar
          onMenuToggle={() => setIsMenuOpen(true)}
          onNavigate={onNavigate}
          walletBalance={dashboardData?.walletBalance ?? 0}
        />

        {/* Welcome Banner Component */}
        <WelcomeBanner />

        {/* Action Icons */}
        <div className="w-full bg-[#1E1E1E] relative z-10 px-4 md:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center w-11/12 mx-auto">
            <ActionIconButton
              icon={<FaPlus />}
              label="Add coins"
              onClick={() => onNavigate ? onNavigate('addcoin') : router.push('/addcoin')}
            />
            <ActionIconButton
              icon={<GiShoppingBag />}
              label="Orders"
              onClick={() => onNavigate ? onNavigate('orders') : router.push('/orders')}
            />
            <ActionIconButton
              icon={<MdBarChart />}
              label="Leaderboard"
              onClick={() => onNavigate ? onNavigate('leaderboard') : router.push('/leaderboard')}
            />
            <ActionIconButton
              icon={<FaWhatsapp />}
              label="Whatsapp"
              onClick={() => window.open('https://wa.me/9863796664', '_blank')}
            />
          </div>
        </div>
      </div>

      {/* Trending Games Section */}
      <div className="px-4 py-6 mt-8 relative w-11/12 mx-auto mb-16">
        {/* Games Grid Color Effect */}
        <div
          className="absolute top-0 left-0 right-0 h-32 z-0 rounded-t-2xl"
          style={{
            background: 'linear-gradient(rgba(127, 140, 170, 0.3) 0%, transparent 100%)'
          }}
        />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <h2 className="text-white font-bold text-xl ml-4 mb-3">Trending Games</h2>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-5 relative z-10">
          {gamesLoading ? (
            Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-[#333844] shadow-sm bg-[#1E1E1E] mb-2 relative">
                  <div className="absolute inset-0 bg-[#333844] animate-pulse" />
                </div>
                <div className="h-3 bg-[#333844] rounded w-16 animate-pulse" />
              </div>
            ))
          ) : (
            games.map((game) => (
              <div
                key={game._id}
                className="flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                onClick={() => onNavigate ? onNavigate(`topup/${game._id}`) : router.push(`/topup/${game._id}`)}
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-[#333844] shadow-sm bg-[#1E1E1E] mb-2">
                  <Image
                    src={game.image}
                    alt={game.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-white text-[11px] md:text-sm font-medium leading-tight text-center line-clamp-2 max-w-[5.5rem] md:max-w-[6.5rem]">
                  {game.name}
                </h3>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNavigation />
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={onNavigate} />
    </div>
  );

  return token && !isAuthenticated ? <AuthChecker>{dashboardContent}</AuthChecker> : dashboardContent;
}

function ActionIconButton({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  return (
    <div className="flex flex-col items-center cursor-pointer group" onClick={onClick}>
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 border-[#232426] bg-[#1E1E1E] text-[#7F8CAA] text-xl shadow-[0_8px_12px_rgba(127,140,177,0.3)] group-hover:shadow-[#7F8CAA] transition-all">
        {icon}
      </div>
      <span className="text-white text-[10px] mt-2 font-medium">{label}</span>
    </div>
  );
}