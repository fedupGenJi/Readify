import { ComponentType, SVGProps, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpenIcon, CompassIcon, HomeIcon, SearchIcon,ThemeIcon, UserIcon } from '../icons';

interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Feed', path: '/feed', icon: HomeIcon },
  { label: 'Discover', path: '/discover', icon: CompassIcon },
  { label: 'Search', path: '/search', icon: SearchIcon },
  { label: 'My Shelf', path: '/shelf', icon: BookOpenIcon },
  { label: 'Profile', path: '/profile', icon: UserIcon },
];

export function Sidebar() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  // Check initial theme preference on mount
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark') || 
      localStorage.getItem('theme') === 'dark';
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle theme handler
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-gray-100 bg-card px-4 py-6 lg:flex">
      <Link to="/feed" className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
          <BookOpenIcon className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold text-text">Readify</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isActive ? 'bg-primary text-white' : 'text-textSecondary hover:bg-gray-100 hover:text-text'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
<<<<<<< HEAD

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-textSecondary transition-colors hover:bg-gray-100 hover:text-text"
      >
        <LogOutIcon className="h-5 w-5" />
        Log out
      </button>
=======
      {/* Theme Toggle Button at the bottom of the sidebar */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-textSecondary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text transition-colors duration-150"
        >
          <ThemeIcon mode={isDark ? 'dark' : 'light'} className="h-5 w-5" />
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
>>>>>>> 9d557dd287c478a5ff2fe80075cef3d22028ff7f
    </aside>
  );
}