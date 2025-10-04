import { ShoppingCart, Search } from "lucide-react";

const Header = () => {
  return (
    <>
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm">
        توصيل سريع لجميع الولايات
      </div>
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </button>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                اتصل بنا
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                طرق الدفع
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                الشحن والتسليم
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                الرئيسية
              </a>
            </nav>

            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">Semmari Shop</h1>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
