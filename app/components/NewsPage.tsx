'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks/redux';
import apiClient from '@/lib/api/axios';
import BottomNavigation from './BottomNavigation';
import TopSection from './TopSection';

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  summary: string;
  image?: string;
  category: string;
  priority: string;
  status: string;
  tags: string[];
  author: {
    _id: string;
    name: string;
    email: string;
  };
  expiresAt: string;
  isPinned: boolean;
  viewCount: number;
  contentType: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface NewsResponse {
  success: boolean;
  message: string;
  data: {
    news: NewsItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalNews: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
  };
}

interface NewsPageProps {
  onNavigate?: (screen: string) => void;
}

export default function NewsPage({ onNavigate }: NewsPageProps = {}) {
  const router = useRouter();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(!isAuthenticated);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAuthenticated && (token || typeof window === 'undefined' || localStorage.getItem('authToken'))) {
      fetchNews();
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchNews = async () => {
    try {
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await apiClient.get('/news/list?page=1&limit=20');
      const data: NewsResponse = response.data;
      if (data.success && data.data && data.data.news) {
        setNewsData(data.data.news);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Failed to load news');
      // Use demo data on error
      setNewsData(demoNewsData);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;

    return `${day}/${month}/${year}, ${displayHours}:${minutes} ${ampm}`;
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Demo news data as fallback
  const demoNewsData: NewsItem[] = [
    {
      _id: '1',
      title: 'If you face issues after our new UI update',
      content: '<p>We have released a new UI update with improved features. If you encounter any issues, please contact our support team.</p>',
      summary: 'We have released a new UI update with improved features. If you encounter any issues, please contact our support team.',
      category: 'update',
      priority: 'normal',
      status: 'published',
      tags: [],
      author: {
        _id: '1',
        name: 'Admin',
        email: 'admin@example.com'
      },
      expiresAt: '2027-12-31T00:00:00.000Z',
      isPinned: true,
      viewCount: 0,
      contentType: 'html',
      createdAt: '2025-10-23T18:56:00Z',
      updatedAt: '2025-10-23T18:56:00Z',
      publishedAt: '2025-10-23T18:56:00Z'
    },
    {
      _id: '2',
      title: 'Stay updated with the latest news, updates and promotions',
      content: '<p>Get the latest updates about our new features, promotions, and announcements.</p>',
      summary: 'Get the latest updates about our new features, promotions, and announcements.',
      category: 'update',
      priority: 'normal',
      status: 'published',
      tags: [],
      author: {
        _id: '1',
        name: 'Admin',
        email: 'admin@example.com'
      },
      expiresAt: '2027-12-31T00:00:00.000Z',
      isPinned: false,
      viewCount: 0,
      contentType: 'html',
      createdAt: '2025-10-28T14:24:54Z',
      updatedAt: '2025-10-28T14:24:54Z',
      publishedAt: '2025-10-28T14:24:54Z'
    }
  ];

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen relative overflow-hidden p-0 m-0" style={{ backgroundColor: '#232426' }}>
        <div className="relative z-10">
          <TopSection showLogo={true} />
        </div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading news...</div>
        </div>
      </div>
    );
  }

  if (error && newsData.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden p-0 m-0" style={{ backgroundColor: '#232426' }}>
        <div className="relative z-10">
          <TopSection showLogo={true} />
        </div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">{error}</div>
        </div>
      </div>
    );
  }

  // Sort news items: pinned first, then by date
  const sortedNews = [...newsData].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen relative overflow-hidden p-0 m-0" style={{ backgroundColor: '#232426' }}>
      {/* Desktop Container */}
      <div className="w-full">
        <div className="relative z-10">
          <TopSection showLogo={true} onNavigate={onNavigate} />
        </div>


        {/* Page Title */}
        <div className="px-4 md:px-6 lg:px-8 mb-6">
          <h1 className="text-white font-bold text-xl sm:text-2xl">News & Announcements</h1>
          <p className="text-gray-400 text-sm mt-2">Stay updated with the latest news, updates and promotions</p>
        </div>

        {/* News Content */}
        <div className="px-4 md:px-6 lg:px-8 pb-24">
          {sortedNews.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-white text-lg mb-2">No news available</div>
              <div className="text-gray-400 text-sm">Check back later for updates</div>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedNews.map((item) => (
                <div
                  key={item._id}
                  className="p-4 rounded-lg cursor-pointer transition-opacity hover:opacity-90"
                  style={{
                    background: 'linear-gradient(90deg, rgb(127, 140, 170) 0%, rgb(92, 102, 124) 100%)',
                    boxShadow: '0px 4px 4px 0px #00000040'
                  }}
                  onClick={() => toggleExpand(item._id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-gray-300 shrink-0 flex items-center justify-center">
                      {item.isPinned ? (
                        <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2L3 9v9a1 1 0 001 1h12a1 1 0 001-1V9l-7-7z" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-base mb-1 text-white capitalize">{item.category}</span>
                        {item.isPinned && (
                          <span className="text-xs text-gray-300">• Pinned</span>
                        )}
                      </div>
                      <div className="text-white text-sm mb-1">{item.title}</div>
                      <div className="text-gray-300 text-xs">{formatDate(item.createdAt)}</div>

                      {/* Expanded Description */}
                      {expandedItems.has(item._id) && (
                        <div className="mt-3 pt-3 border-t border-white border-opacity-20">
                          {item.contentType === 'html' ? (
                            <div
                              className="text-white text-sm leading-relaxed"
                              style={{ fontFamily: 'Poppins' }}
                              dangerouslySetInnerHTML={{ __html: item.content }}
                            />
                          ) : (
                            <p className="text-white text-sm leading-relaxed" style={{ fontFamily: 'Poppins' }}>
                              {item.content}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Spacing for Fixed Navigation */}
        <div className="h-15"></div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
}

