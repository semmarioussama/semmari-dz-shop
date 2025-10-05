import logo from "@/assets/logo.png";
const Header = () => {
  return <>
      
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <img src={logo} alt="Teacher's Nest Logo" className="h-16 w-auto" />
          </div>
        </div>
      </header>
    </>;
};
export default Header;