import React, { useState, useEffect, useRef } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import PhoneIcon from "@mui/icons-material/Phone";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FactCheckIcon from "@mui/icons-material/FactCheck";

export default function Header({ user, setToken, searchQuery, setSearchQuery, onEditProfile, onOpenSettings, onGoHome, theme, setTheme, isSystemDark }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  
  const formattedTime = currentTime.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <header className={`flex justify-between items-center px-6 py-3 rounded-b-3xl shadow-2xl sticky top-0 z-50 transition-all duration-500
  ${theme === "light"
        ? "bg-white/70 backdrop-blur-xl text-slate-900 border-b border-x border-slate-100 shadow-slate-200/50"
        : theme === "dark"
          ? "bg-slate-900/70 backdrop-blur-xl text-white border-b border-x border-slate-800 shadow-black/50"
          : isSystemDark
            ? "bg-slate-900/70 backdrop-blur-xl text-white border-b border-x border-slate-800 shadow-black/50"
            : "bg-white/70 backdrop-blur-xl text-slate-900 border-b border-x border-slate-100 shadow-slate-200/50"
      }
`}>
      <button 
        onClick={onGoHome}
        className="flex items-center gap-3 cursor-pointer group/logo text-left outline-none"
      >
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center justify-center transform group-hover/logo:scale-105 transition-all duration-300 group-active/logo:scale-95">
          <FactCheckIcon className="text-white" sx={{ fontSize: 24 }} />
        </div>
        <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tighter">
          Todo Pro
        </h1>
      </button>

      <div className="flex-1 max-w-xl mx-12">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className={`transition-colors duration-300 ${theme === 'dark' || (theme === 'system' && isSystemDark) ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-600'}`} sx={{ fontSize: 20 }} />
          </div>
          <input
            type="text"
            placeholder="Search missions, objectives, or specs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-2xl py-3 pl-12 pr-10 text-sm font-semibold transition-all duration-300 focus:ring-4 border
              ${theme === 'dark' || (theme === 'system' && isSystemDark)
                ? 'bg-slate-800/40 text-slate-100 placeholder:text-slate-500 focus:ring-indigo-500/20 focus:bg-slate-800 border-slate-700/50 focus:border-indigo-500/50'
                : 'bg-slate-100/40 text-slate-700 placeholder:text-slate-400 focus:ring-indigo-500/10 focus:bg-white border-slate-200/50 focus:border-indigo-500/50 shadow-inner'
              }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
            >
              <ClearIcon sx={{ fontSize: 18 }} />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Premium Running Clock */}
        <div className={`hidden xl:flex items-center h-[42px] px-6 rounded-xl border backdrop-blur-md shadow-sm transition-all duration-500 hover:shadow-md
          ${theme === 'dark' || (theme === 'system' && isSystemDark) 
            ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60' 
            : 'bg-white/60 border-slate-200/60 hover:bg-white'}`}>
          <span className={`text-[13px] font-black tracking-[0.15em] ${theme === 'dark' || (theme === 'system' && isSystemDark) ? 'text-slate-200' : 'text-slate-800'}`}>
            {formattedDate}
          </span>
          <span className={`ml-4 text-[16px] font-black font-mono tracking-wider ${theme === 'dark' || (theme === 'system' && isSystemDark) ? 'text-indigo-400' : 'text-indigo-700'}`}>
            {formattedTime}
          </span>
        </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`group flex items-center gap-2 p-1 rounded-full transition-all duration-300 ${showDropdown
            ? "bg-indigo-500/10 ring-4 ring-indigo-500/20"
            : "hover:bg-indigo-500/5"
            }`}
        >
          {user?.profileImage && !user.profileImage.startsWith('blob:') ? (
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover shadow-lg group-hover:scale-110 transition-transform duration-300 border-2 border-indigo-500/30"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <PersonIcon />
            </div>
          )}
          
          <div className="hidden lg:flex flex-col items-start justify-center ml-1 pr-3 max-w-[120px]">
            <span className={`text-xs font-black truncate w-full tracking-tight ${theme === 'dark' || (theme === 'system' && isSystemDark) ? 'text-slate-200' : 'text-slate-800'}`}>
              {user?.name || "Member"}
            </span>
            <span className="text-[9px] font-bold text-slate-500 tracking-wider truncate w-full">
              {user?.mobile || "No phone"}
            </span>
          </div>
        </button>

        {showDropdown && (
          <div className={`absolute right-0 mt-4 w-80 rounded-[2.5rem] shadow-2xl border p-6 z-50 transform origin-top-right transition-all animate-in fade-in zoom-in slide-in-from-top-4 duration-300
            ${theme === "dark" || (theme === 'system' && isSystemDark)
              ? "bg-slate-900/95 backdrop-blur-2xl border-slate-800 text-white"
              : "bg-white/95 backdrop-blur-2xl border-slate-100 text-slate-900"
            }`}>
            
            {/* User Info Header - Always Visible */}
            <div className="flex flex-col items-center pb-4">
              <div className="relative group/avatar">
                <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover/avatar:opacity-50 transition duration-300"></div>
                <div className="relative w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-2xl overflow-hidden">
                  {user?.profileImage && !user.profileImage.startsWith('blob:') ? (
                    <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover transform group-hover/avatar:scale-110 transition duration-500" />
                  ) : (
                    <AccountCircleIcon className="text-indigo-500" sx={{ fontSize: 60 }} />
                  )}
                </div>
              </div>
              <h3 className="mt-3 font-black text-xl tracking-tighter">
                {user?.name || "Member"}
              </h3>
              <p className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent font-bold text-xs">
                @{user?.username || "username"}
              </p>
            </div>

            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 px-2 group/item">
                    <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center group-hover/item:bg-indigo-500/20 transition-colors">
                      <EmailIcon className="text-indigo-500" sx={{ fontSize: 16 }} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] tracking-widest text-slate-400 font-black">Email Address</span>
                      <span className="text-xs font-bold truncate opacity-80">{user?.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 px-2 group/item">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover/item:bg-purple-500/20 transition-colors">
                      <PhoneIcon className="text-purple-500" sx={{ fontSize: 16 }} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] tracking-widest text-slate-400 font-black">Phone Number</span>
                      <span className="text-xs font-bold truncate opacity-80">{user?.mobile || "Not provided"}</span>
                    </div>
                  </div>
                </div>

              <div className="flex justify-center pt-2">
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    onOpenSettings();
                  }}
                  className={`w-full flex items-center justify-center gap-2 text-sm font-black py-3 rounded-xl transition-all border text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700`}
                >
                  <SettingsIcon sx={{ fontSize: 20 }} /> Settings
                </button>
              </div>
                <div className="flex flex-row gap-2 pt-2">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onEditProfile();
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] transition-all font-black text-xs"
                  >
                    <PersonIcon sx={{ fontSize: 16 }} /> Edit
                  </button>

                  <button
                    onClick={handleLogout}
                    className={`flex-1 flex items-center justify-center gap-1 py-3 rounded-xl active:scale-[0.98] transition-all font-black text-xs border
                      ${theme === 'dark' || (theme === 'system' && isSystemDark)
                        ? 'bg-slate-800 text-red-400 border-slate-700 hover:bg-red-500/10'
                        : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                      }`}
                  >
                    <LogoutIcon sx={{ fontSize: 16 }} /> Logout
                  </button>
                </div>
              </div>


            
          </div>
        )}
      </div>
</div>
    </header>
  );
}