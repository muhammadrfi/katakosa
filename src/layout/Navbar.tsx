
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Moon, Sun, Home, BookText, Dumbbell, LayoutDashboard, Menu, GraduationCap, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '../hooks/useTheme';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Navbar = () => {
  const activeLinkClass = "text-primary font-semibold flex items-center gap-1";
  const inactiveLinkClass = "text-muted-foreground hover:text-primary transition-colors flex items-center gap-1";
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const isPictureQuizActive = location.pathname === '/tryout' && location.search.includes('type=picture-quiz');
  const isTryoutActive = location.pathname === '/tryout' && !location.search.includes('type=picture-quiz');

  const navLinksDesktop = (
    <>
      <NavLink
        to="/"
        className={({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass)}
      >
        <Home className="h-4 w-4" />
        Home
      </NavLink>
      <NavLink
        to="/dashboard"
        className={({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass)}
      >
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </NavLink>
      <NavLink
        to="/kosakata"
        className={({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass)}
      >
        <BookText className="h-4 w-4" />
        Daftar Kata
      </NavLink>
       <NavLink
        to="/latihan"
        className={({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass)}
      >
        <Dumbbell className="h-4 w-4" />
        Proyek
      </NavLink>
      <NavLink
        to="/materi-buku"
        className={({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass)}
      >
        <GraduationCap className="h-4 w-4" />
        Materi Buku
      </NavLink>
      <NavLink
        to="/tryout"
        className={isTryoutActive ? activeLinkClass : inactiveLinkClass}
      >
        <BookOpen className="h-4 w-4" />
        Tryout
      </NavLink>
      <NavLink
        to="/tryout?type=picture-quiz"
        className={isPictureQuizActive ? activeLinkClass : inactiveLinkClass}
      >
        <ImageIcon className="h-4 w-4" />
        Kuis Gambar
      </NavLink>
    </>
  );

  const activeLinkClassMobile = "text-primary font-semibold flex items-center gap-3 py-2 px-3 bg-muted rounded-xl text-base w-full";
  const inactiveLinkClassMobile = "text-muted-foreground hover:text-primary transition-colors flex items-center gap-3 py-2 px-3 hover:bg-muted/50 rounded-xl text-base w-full";

  const navLinksMobile = (
    <div className="flex flex-col gap-2.5 w-full">
      <NavLink
        to="/"
        className={({ isActive }) => (isActive ? activeLinkClassMobile : inactiveLinkClassMobile)}
      >
        <Home className="h-5 w-5" />
        Home
      </NavLink>
      <NavLink
        to="/dashboard"
        className={({ isActive }) => (isActive ? activeLinkClassMobile : inactiveLinkClassMobile)}
      >
        <LayoutDashboard className="h-5 w-5" />
        Dashboard
      </NavLink>
      <NavLink
        to="/kosakata"
        className={({ isActive }) => (isActive ? activeLinkClassMobile : inactiveLinkClassMobile)}
      >
        <BookText className="h-5 w-5" />
        Daftar Kata
      </NavLink>
       <NavLink
        to="/latihan"
        className={({ isActive }) => (isActive ? activeLinkClassMobile : inactiveLinkClassMobile)}
      >
        <Dumbbell className="h-5 w-5" />
        Proyek
      </NavLink>
      <NavLink
        to="/materi-buku"
        className={({ isActive }) => (isActive ? activeLinkClassMobile : inactiveLinkClassMobile)}
      >
        <GraduationCap className="h-5 w-5" />
        Materi Buku
      </NavLink>
      <NavLink
        to="/tryout"
        className={isTryoutActive ? activeLinkClassMobile : inactiveLinkClassMobile}
      >
        <BookOpen className="h-5 w-5" />
        Tryout
      </NavLink>
      <NavLink
        to="/tryout?type=picture-quiz"
        className={isPictureQuizActive ? activeLinkClassMobile : inactiveLinkClassMobile}
      >
        <ImageIcon className="h-5 w-5" />
        Kuis Gambar
      </NavLink>
    </div>
  );

  return (
    <header className="py-4 px-6 border-b">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">KataLatih</span>
        </Link>
        
        {/* Mobile Navigation Trigger (Left) */}
        <div className="lg:hidden shrink-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col gap-4 pt-8">
                {navLinksMobile}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle theme"
                  className="justify-start w-full"
                >
                  {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem] mr-2" /> : <Moon className="h-[1.2rem] w-[1.2rem] mr-2" />}
                  {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo / Brand Link */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">KataLatih</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-4 lg:gap-6 text-sm">
          {navLinksDesktop}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>

        {/* Mobile Theme Toggle (Right) */}
        <div className="lg:hidden shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
