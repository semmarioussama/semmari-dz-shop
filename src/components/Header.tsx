import logo from "@/assets/logo.svg";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="w-8" /> {/* Spacer for centering */}
          <img src={logo} alt="Teacher's Nest Logo" className="h-16 w-auto" />
          <Link 
            to="/admin/login" 
            className="text-muted-foreground hover:text-foreground transition-colors p-2"
            aria-label="Admin Login"
          >
            <Lock className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
export default Header;