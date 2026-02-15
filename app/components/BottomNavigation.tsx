'use client';

import { useRouter } from 'next/navigation';
import { IoMdHome } from 'react-icons/io';
import { LuGrid2X2 } from 'react-icons/lu';
import { GiShoppingBag } from 'react-icons/gi';
import { MdNewspaper } from 'react-icons/md';

interface BottomNavigationProps {
  onNavigate?: (screen: string) => void;
}

export default function BottomNavigation({ onNavigate }: BottomNavigationProps = {}) {
  const router = useRouter();

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed p-3 sm:p-4 z-40 left-4 right-4 sm:left-8 sm:right-8 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl"
      style={{
        backgroundColor: 'rgb(30, 30, 30)',
        bottom: '10px',
        borderRadius: '50px',
        boxShadow: 'rgb(127, 140, 178) 0px 5px 6px'
      }}
    >
      <div className="flex justify-around">
        {/* Home */}
        <div
          className="flex items-center justify-center cursor-pointer"
          onClick={() => onNavigate ? onNavigate('home') : router.push('/')}
        >
          <IoMdHome className="w-6 h-6 text-white" />
        </div>

        {/* Profile */}
        <div
          className="flex items-center justify-center cursor-pointer"
          onClick={() => router.push('/profile')}
        >
          <LuGrid2X2 className="w-6 h-6 text-white" />
        </div>

        {/* Orders */}
        <div
          className="flex items-center justify-center cursor-pointer"
          onClick={() => router.push('/orders')}
        >
          <GiShoppingBag className="w-6 h-6 text-white" />
        </div>

        {/* News */}
        <div
          className="flex items-center justify-center cursor-pointer"
          onClick={() => router.push('/news')}
        >
          <MdNewspaper className="w-6 h-6 text-white" />
        </div>
      </div>
    </nav>
  );
}
