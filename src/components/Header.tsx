import logo from "@/assets/logo.svg";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
const Header = () => {
  return <header className="bg-card border-b">
      <div className="container py-4 mx-0 px-[16px] my-0">
        <div className="flex items-center justify-between">
          <div className="w-8" /> {/* Spacer for centering */}
          <div className="flex flex-col items-center gap-2">
            <img src={logo} alt="Teacher's Nest Logo" className="h-16 w-auto" />
            <p className="text-foreground text-sm sm:text-base text-center font-arabic px-2">
              فيسوز من شركة Powerblu التابعة لعلامة HONESTPRO بمكرك براشلس Sans Charbon وبطاريتين 16.8 V
            </p>
            <p className="text-red-600 text-xl sm:text-2xl font-bold animate-pulse">
              6500 دج
            </p>
          </div>
          <Link to="/admin/login" className="text-muted-foreground hover:text-foreground transition-colors p-2" aria-label="Admin Login">
            <Lock className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>;
};
export default Header;