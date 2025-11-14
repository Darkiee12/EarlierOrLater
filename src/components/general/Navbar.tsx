"use client";
import Link from "next/link";
import { BRAND_NAME } from "@/common/constants";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  return (
    <>
      <nav className="w-full py-4 px-6 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open menu"
          >
            <FaBars size={24} />
          </button>

          <Link href="/" className="no-underline absolute left-1/2 transform -translate-x-1/2">
            <div className="text-2xl font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {BRAND_NAME}
            </div>
          </Link>

          <div className="flex items-center">
            <ThemeSwitcher />
          </div>
        </div>
        
        <noscript>
          <div className="max-w-7xl mx-auto mt-4 pb-4 flex flex-wrap gap-4 justify-center">
            <Link href="/" className="text-sm underline">Home</Link>
            <Link href="/about" className="text-sm underline">About</Link>
            <Link href="/how-to-play" className="text-sm underline">How to Play</Link>
            <Link href="/privacy" className="text-sm underline">Privacy</Link>
          </div>
        </noscript>
      </nav>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={closeSidebar}
          style={{ pointerEvents: 'auto' }}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 shadow-2xl z-50 transform transition-all duration-300 ease-in-out border-r ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: 'var(--bg)',
          color: 'var(--text)',
          borderColor: 'var(--text)',
          borderRightWidth: '1px'
        }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(128, 128, 128, 0.3)' }}>
            <h2 className="text-xl font-bold">{BRAND_NAME}</h2>
            <button
              onClick={closeSidebar}
              className="p-2 rounded-lg transition-colors hover:opacity-70"
              aria-label="Close menu"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  onClick={closeSidebar}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium hover:opacity-70"
                >
                  🏠 Home
                </Link>
              </li>
              <li>
                <div className="px-4 py-2 text-xs font-semibold uppercase opacity-60">
                  Game Modes
                </div>
                <ul className="space-y-1 ml-2">
                  <li>
                    <Link
                      href="/onthisday"
                      onClick={closeSidebar}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors hover:opacity-70"
                    >
                      📅 Daily Challenge
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/free/classic"
                      onClick={closeSidebar}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors hover:opacity-70"
                    >
                      🎯 Classic Mode
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/free/time"
                      onClick={closeSidebar}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors hover:opacity-70"
                    >
                      ⏱️ Time Mode
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link
                  href="/about"
                  onClick={closeSidebar}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium hover:opacity-70"
                >
                  ℹ️ About
                </Link>
              </li>
              <li>
                <Link
                  href="/how-to-play"
                  onClick={closeSidebar}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium hover:opacity-70"
                >
                  📖 How to Play
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  onClick={closeSidebar}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium hover:opacity-70"
                >
                  🔒 Privacy Policy
                </Link>
              </li>
            </ul>
          </nav>

          <div className="p-4 border-t" style={{ borderColor: 'rgba(128, 128, 128, 0.3)' }}>
            <p className="text-sm opacity-70 text-center">
              © 2025 {BRAND_NAME}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
