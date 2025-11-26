import logo from '../assets/logo.svg';
import { useAuth } from '../hooks/auth-hook';
import { useEffect, useState } from 'react';
import LoginModal from './LoginModal';
import { useSocket } from '../hooks/socket-hook';

export default function Navbar() {
  const {login,signed,user, logout}= useAuth()
  const {disconnect, socket, isConnected} = useSocket()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  return (
    <>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <nav className="w-full bg-[#F3F3F3] px-20 py-4 flex items-center justify-between shadow-sm">
        
        <div className="flex items-center">
          <img src={logo} alt="Tech4Um Logo" className="h-12 mr-4" />
          
          <span className="text-[#999] text-lg font-light ml-2 border-l border-transparent">
            Seu fórum sobre tecnologia!
          </span>
        </div>

        <div className="flex items-center gap-4">
          {signed ? (
            <div className="flex flex-col items-start">
              <span className="text-[#666] font-bold text-base">{user?.name}</span>
              <span className="text-[#888] text-xs font-light">{user?.email.slice(0,17)}...</span>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="text-[#666] font-bold text-sm hover:text-gray-800 transition-colors">
              Fazer Login
            </button>
          )}
          
          <div className="relative">
            <div 
              onClick={() => signed ? setIsDropdownOpen(!isDropdownOpen) : setIsLoginModalOpen(true)}
              className="w-12 h-12 bg-[#b54512] rounded-full cursor-pointer hover:opacity-90 transition-opacity"
            ></div>

            {signed && isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-70 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 overflow-hidden">
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span>Status:</span>
                    <span className={`font-bold ${isConnected ? "text-green-500" : "text-red-500"}`}>
                      {isConnected ? "Online" : "Offline"}
                    </span>
                  </div>
                  {socket?.id && (
               <div className="flex items-center justify-between mb-1">
                    <span>Socket ID:</span>
                    <span >
                      {socket.id}
                    </span>
                  </div>
                  )}
                </div>
                <button className="block w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#b54512] transition-colors font-medium">
                  Perfil
                </button>
                <button className="block w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#b54512] transition-colors font-medium">
                  Settings
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={() => {
                    logout();
                    disconnect();
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
