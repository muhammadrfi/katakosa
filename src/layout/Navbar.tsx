
import { Link, NavLink } from 'react-router-dom';
import { BookOpen, Moon, Sun, Home, BookText, Dumbbell, LayoutDashboard, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '../hooks/useTheme';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '../hooks/use-mobile';

const Navbar = () => {
  const activeLinkClass = "text-primary font-semibold flex items-center gap-1";
  const inactiveLinkClass = "text-muted-foreground hover:text-primary transition-colors flex items-center gap-1";
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();

  const navLinks = (
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
    </>
  );

  return (
    <header className="py-4 px-6 border-b">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">KataLatih</span>
        </Link>
        
        {isMobile ? (
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                <div className="flex flex-col gap-4 pt-8">
                  {navLinks}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    aria-label="Toggle theme"
                    className="justify-start"
                  >
                    {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem] mr-2" /> : <Moon className="h-[1.2rem] w-[1.2rem] mr-2" />}
                    {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
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
        ) : (
          <div className="flex items-center gap-4 md:gap-6 text-sm">
            {navLinks}
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
        )}
      </nav>
    </header>
  );
};

export default Navbar;
