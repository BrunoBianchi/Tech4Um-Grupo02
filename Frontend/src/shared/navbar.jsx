import logo from '../assets/logo.svg';

export default function Navbar() {
  return (
    <nav className="w-full bg-[#F3F3F3] px-10 py-7 flex items-center justify-between shadow-sm">
      
      <div className="flex items-center">
        <img src={logo} alt="Tech4Um Logo" className="h-12 mr-4" />
        
        <span className="text-[#999] text-lg font-light ml-2 border-l border-transparent">
          Seu fórum sobre tecnologia!
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-[#666] font-bold text-sm hover:text-gray-800 transition-colors">
          Fazer Login
        </button>
        <div className="w-10 h-10 bg-[#b54512] rounded-full cursor-pointer hover:opacity-90 transition-opacity"></div>
      </div>
    </nav>
  );
}
