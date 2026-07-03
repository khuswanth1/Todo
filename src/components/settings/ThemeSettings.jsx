import React, { useState, useEffect } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { ensureFontLoaded } from '../../utils/googleFonts';

const STORAGE_KEY = 'todo_theme_config';

// Removed CURATED_FONTS - now fetching directly from the backend API

const CATEGORY_LABELS = {
  'sans-serif': 'Sans Serif',
  serif: 'Serif',
  display: 'Display',
  handwriting: 'Handwriting',
  monospace: 'Monospace',
};

const ColorInput = ({ label, value, onChange, isDark }) => {
  const isValidHex = (val) => /^#[0-9a-fA-F]{6}$/.test(val);
  const safeColor = isValidHex(value) ? value.toLowerCase() : '#000000';

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className={`color-input-container flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all hover:shadow-sm
        ${isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-black/10 shadow-sm flex-shrink-0">
          <input
            type="color"
            value={safeColor}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer border-0 p-0 opacity-0"
          />
          <div className="w-full h-full" style={{ backgroundColor: isValidHex(value) ? value : '#000000' }} />
        </div>
        <input 
          type="text"
          value={value}
          onChange={(e) => {
            let val = e.target.value;
            // Automatically prepend '#' if not present and they are typing hex chars
            if (val && !val.startsWith('#') && /^[0-9a-fA-F]{1,6}$/.test(val)) {
              val = '#' + val;
            }
            onChange(val);
          }}
          className="font-mono text-[11px] font-bold tracking-wider bg-transparent border-0 outline-none w-16 p-0 focus:ring-0"
          style={{ color: isDark ? '#cbd5e1' : '#475569' }}
        />
      </div>
    </div>
  );
};

const defaults = (isSystemDark) => ({
  primaryColor: '#4f46e5',
  bgColor: isSystemDark ? '#0f172a' : '#f8fafc',
  sidebarColor: isSystemDark ? '#1e293b' : '#ffffff',
  cardColor: isSystemDark ? '#1e293b' : '#ffffff',
  headingColor: isSystemDark ? '#ffffff' : '#0f172a',
  textColor: isSystemDark ? '#cbd5e1' : '#475569',
  buttonBgColor: '#4f46e5',
  buttonTextColor: '#ffffff',
  fontSize: '16px',
  fontFamily: 'Inter',
  borderRadius: '1rem',
  logoImage: null
});

const presets = [
  { name: 'Midnight',  primary: '#6366f1', bg: '#0f172a', card: '#1e293b', sidebar: '#111827' },
  { name: 'Ocean',     primary: '#0ea5e9', bg: '#0c1a2e', card: '#132237', sidebar: '#0f1e30' },
  { name: 'Forest',    primary: '#10b981', bg: '#064e3b', card: '#065f46', sidebar: '#064e3b' },
  { name: 'Sunset',    primary: '#f97316', bg: '#fff7ed', card: '#ffffff', sidebar: '#fef3c7' },
  { name: 'Rose',      primary: '#f43f5e', bg: '#fff1f2', card: '#ffffff', sidebar: '#ffe4e6' },
  { name: 'Violet',    primary: '#8b5cf6', bg: '#1e1b4b', card: '#2e2b5b', sidebar: '#1a1840' },
  { name: 'Minimal',   primary: '#1f2937', bg: '#ffffff', card: '#f9fafb', sidebar: '#f3f4f6' },
  { name: 'Dracula',   primary: '#bd93f9', bg: '#282a36', card: '#383a59', sidebar: '#21222c' },
];

const SearchableSelect = ({ value, onChange, options, disabled, isDark, placeholder, renderOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 1900); // Limit to 100 to prevent browser freezing with 1800+ fonts

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${isDark ? 'bg-slate-800 text-slate-300 border-slate-600' : 'bg-white text-slate-700 border-slate-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="truncate">{options.find(o => o.value === value)?.label || placeholder}</span>
        <ExpandMoreIcon sx={{ fontSize: 16 }} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className={`absolute z-[200] mt-1 w-full rounded-xl border shadow-lg overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="p-2 border-b border-slate-200 dark:border-slate-700 relative flex items-center">
            <SearchIcon sx={{ fontSize: 16 }} className={`absolute left-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-8 pr-3 py-2 text-xs rounded-lg outline-none ${isDark ? 'bg-slate-900 text-white placeholder:text-slate-500 border border-slate-700/50' : 'bg-slate-100 text-slate-700 placeholder:text-slate-400 border border-slate-200'}`}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500">No results found</div>
            ) : (
              filteredOptions.map((opt) => (
                <div 
                  key={opt.value} 
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-indigo-500 hover:text-white transition-colors ${value === opt.value ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : isDark ? 'text-slate-300' : 'text-slate-700'}`}
                  style={renderOption ? renderOption(opt) : {}}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ThemeSettings({ theme, setTheme, isSystemDark, user, token, onProfileUpdate }) {
  const [config, setConfig] = useState(() => {
    if (user?.primaryColor) {
      return {
        primaryColor: user.primaryColor,
        bgColor: user.bgColor,
        sidebarColor: user.sidebarColor,
        cardColor: user.cardColor,
        headingColor: user.headingColor,
        textColor: user.textColor,
        buttonBgColor: user.buttonBgColor,
        buttonTextColor: user.buttonTextColor,
        fontSize: user.fontSize || '16px',
        fontFamily: user.fontFamily || 'Inter',
        borderRadius: user.borderRadius || '1rem',
        logoImage: user.logoImage || null,
        enableFontFamily: user.enableFontFamily ?? true,
        enableBorderRadius: user.enableBorderRadius ?? true,
        enableColors: user.enableColors ?? false
      };
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { ...defaults(isSystemDark), enableFontFamily: true, enableBorderRadius: true, enableColors: false };
    } catch {
      return { ...defaults(isSystemDark), enableFontFamily: true, enableBorderRadius: true, enableColors: false };
    }
  });

  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState(user?.logoImage || config.logoImage || null);
  const [apiFonts, setApiFonts] = useState(null);

  const isDark = theme === 'dark' || (theme === 'system' && isSystemDark);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/fonts")
      .then(res => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data && data.items) {
          const formattedFonts = data.items.map(item => ({
            family: item.family,
            category: item.category,
            label: item.family
          }));
          setApiFonts(formattedFonts);
        } else if (data && data.error) {
          console.error('Backend returned error for fonts:', data.error);
        }
      })
      .catch((err) => console.warn('Could not load Google Fonts list from backend', err));
    return () => { cancelled = true; };
  }, []);

  const fontOptions = apiFonts && apiFonts.length > 0 ? apiFonts : [];

  const set = (key) => (value) => {
    if (key === 'fontFamily') ensureFontLoaded(value);
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset) => {
    const dark = preset.bg.match(/^#(0[0-9a-f]|1[0-9a-f]|2[0-9a-f])/i);
    
    let nextConfig;
    setConfig(prev => {
      nextConfig = {
        ...prev,
        primaryColor: preset.primary,
        bgColor: preset.bg,
        sidebarColor: preset.sidebar,
        cardColor: preset.card,
        buttonBgColor: preset.primary,
        headingColor: dark ? '#ffffff' : '#111827',
        textColor: dark ? '#cbd5e1' : '#4b5563',
        enableColors: true
      };
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig));
      } catch(e) {}
      
      return nextConfig;
    });
    setTheme(dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    
    // Silently sync to backend to prevent fetchProfile from reverting this on browser reload
    fetch("/api/settings/theme", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ ...nextConfig, logoImage: logoPreview })
    }).catch(() => {});
  };

  useEffect(() => {
    applyToDOM(config);
    const root = document.documentElement;
    root.classList.toggle('theme-font-family', config.enableFontFamily);
    root.classList.toggle('theme-border-radius', config.enableBorderRadius);
    root.classList.toggle('theme-colors', config.enableColors);
  }, [config]);

  const applyToDOM = (cfg) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', cfg.primaryColor);
    root.style.setProperty('--bg-color', cfg.bgColor);
    root.style.setProperty('--sidebar-color', cfg.sidebarColor);
    root.style.setProperty('--card-color', cfg.cardColor);
    root.style.setProperty('--heading-color', cfg.headingColor);
    root.style.setProperty('--text-color', cfg.textColor);
    root.style.setProperty('--button-bg-color', cfg.buttonBgColor);
    root.style.setProperty('--button-text-color', cfg.buttonTextColor);
    root.style.setProperty('--base-font-size', cfg.fontSize);
    root.style.setProperty('--font-family', cfg.fontFamily);
    root.style.setProperty('--border-radius', cfg.borderRadius);
  };

  const handleSave = async () => {
    applyToDOM(config);
    const root = document.documentElement;
    
    root.classList.add('custom-theme');
    root.classList.toggle('theme-font-family', config.enableFontFamily);
    root.classList.toggle('theme-font-size', true); // Always enabled
    root.classList.toggle('theme-border-radius', config.enableBorderRadius);
    root.classList.toggle('theme-colors', config.enableColors);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    localStorage.setItem('custom_theme_active', 'true');
    localStorage.setItem('theme', theme); // Save the selected theme
    window.dispatchEvent(new Event('storage')); // Notify App.jsx of theme change

    try {
      const res = await fetch("/api/settings/theme", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          ...config,
          logoImage: logoPreview
        })
      });
      if (res.ok) {
        setSaved(true);
        if (onProfileUpdate) onProfileUpdate();
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert("API Sync Failed");
      }
    } catch (e) {
      console.error("Failed to sync theme to backend", e);
    }
  };

  const handleReset = async () => {
    const d = defaults(isSystemDark);
    setConfig({ ...d, enableFontFamily: true, enableBorderRadius: true, enableColors: false });
    applyToDOM(d);
    setLogoPreview(null);
    document.documentElement.classList.remove('custom-theme', 'theme-font-family', 'theme-font-size', 'theme-border-radius', 'theme-colors');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('custom_theme_active');
    
    setTheme('system');
    localStorage.setItem('theme', 'system');
    window.dispatchEvent(new Event('storage'));

    try {
      await fetch("/api/settings/theme", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          primaryColor: "", bgColor: "", sidebarColor: "", cardColor: "", headingColor: "", textColor: "",
          buttonBgColor: "", buttonTextColor: "", fontSize: "", fontFamily: "", borderRadius: "", logoImage: "",
          enableFontFamily: true, enableBorderRadius: true, enableColors: false
        })
      });
      if (onProfileUpdate) onProfileUpdate();
    } catch (e) {
      console.error("Failed to sync reset theme to backend", e);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (user) {
      const newConfig = {
        primaryColor: user.primaryColor || "",
        bgColor: user.bgColor || "",
        sidebarColor: user.sidebarColor || "",
        cardColor: user.cardColor || "",
        headingColor: user.headingColor || "",
        textColor: user.textColor || "",
        buttonBgColor: user.buttonBgColor || "",
        buttonTextColor: user.buttonTextColor || "",
        fontSize: user.fontSize || '16px',
        fontFamily: user.fontFamily || 'Inter',
        borderRadius: user.borderRadius || '1rem',
        logoImage: user.logoImage || null,
        enableFontFamily: user.enableFontFamily ?? true,
        enableBorderRadius: user.enableBorderRadius ?? true,
        enableColors: user.enableColors ?? false
      };
      setConfig(newConfig);
      setLogoPreview(user.logoImage || null);
      applyToDOM(newConfig);
      if (newConfig.fontFamily) {
        ensureFontLoaded(newConfig.fontFamily);
      }
    }
  }, [user]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setConfig(JSON.parse(saved));
        }
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const modeOptions = [
    { id: 'light', label: 'Light', icon: <LightModeIcon sx={{ fontSize: 18 }} /> },
    { id: 'dark', label: 'Dark', icon: <DarkModeIcon sx={{ fontSize: 18 }} /> },
    { id: 'system', label: 'System', icon: <SettingsBrightnessIcon sx={{ fontSize: 18 }} /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-2xl font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Theme Studio
          </h3>
          <p className="text-slate-500 text-sm font-medium">Design your perfect workspace environment.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleReset} className={`px-4 py-2.5 rounded-xl font-black text-sm flex items-center gap-1.5 transition-all border active:scale-95 ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <RestartAltIcon sx={{ fontSize: 16 }} /> 
          </button>
          <button type="button" onClick={handleSave} className={`px-5 py-2.5 rounded-xl font-black text-sm flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${saved ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50'}`}>
            {saved ? <><CheckCircleIcon sx={{ fontSize: 16 }} /> Saved!</> : <><SaveIcon sx={{ fontSize: 16 }} /> Apply</>}
          </button>
        </div>
      </div>

      <div className={`p-1.5 rounded-2xl inline-flex gap-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {modeOptions.map(({ id, label, icon }) => (
          <button type="button" key={id} onClick={() => {
            setTheme(id);
            localStorage.setItem('theme', id);
            
            // Sync the custom colors to match the newly selected mode AND disable them so the switch takes effect
            const newlyDark = id === 'dark' || (id === 'system' && isSystemDark);
            const d = defaults(newlyDark);
            
            let nextConfig;
            setConfig(prev => {
              nextConfig = {
                ...prev,
                bgColor: d.bgColor,
                sidebarColor: d.sidebarColor,
                cardColor: d.cardColor,
                headingColor: d.headingColor,
                textColor: d.textColor,
                enableColors: false
              };
              applyToDOM(nextConfig);
              
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig));
              } catch(e) {}
              
              return nextConfig;
            });
            window.dispatchEvent(new Event('storage'));
            
            // Silently sync to backend to prevent fetchProfile from reverting this on browser reload
            fetch("/api/settings/theme", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
              },
              body: JSON.stringify({ ...nextConfig, logoImage: logoPreview })
            }).catch(() => {});

          }} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-200 ${theme === id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
            {icon} {label}
          </button>
        ))}
      </div>

      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'} space-y-4`}>
        <h4 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Background Theme</h4>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <label className={`w-28 h-28 rounded-2xl border border-dashed flex items-center justify-center overflow-hidden relative shadow-sm cursor-pointer hover:opacity-80 transition-opacity group ${isDark ? 'border-slate-700 bg-slate-850' : 'border-slate-350 bg-white'}`}>
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            {logoPreview ? (
              <img src={logoPreview} alt="Background Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <CloudUploadIcon className="text-slate-400 group-hover:text-indigo-500 transition-colors" sx={{ fontSize: 24 }} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-2 group-hover:text-indigo-500 transition-colors">Upload</span>
              </div>
            )}
          </label>
          <div className="space-y-3 flex-grow text-center sm:text-left">
            <div>
              <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Custom Background Image</p>
              <p className="text-xs text-slate-500 font-medium">Click the preview box to upload a custom background for your dashboard and settings pages.</p>
            </div>
            <div className="flex justify-center sm:justify-start gap-3">
              {logoPreview && (
                <button 
                  type="button" 
                  onClick={async () => {
                    setLogoPreview(null);
                    fetch("/api/settings/theme", {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                      },
                      body: JSON.stringify({ ...config, logoImage: "" })
                    }).catch(() => {});
                  }} 
                  className={`px-4 py-2 border text-xs font-black rounded-lg flex items-center gap-1.5 transition-all active:scale-95 ${isDark ? 'border-slate-700 text-red-400 hover:bg-slate-800' : 'border-slate-200 text-red-500 hover:bg-red-50'}`}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-[2px] rounded-2xl bg-gradient-to-tr from-indigo-500/40 to-purple-500/40">
        <div className="p-5 rounded-[calc(1rem-2px)] flex flex-col gap-4 transition-colors duration-300" style={{ backgroundColor: config.enableColors ? config.bgColor : undefined, fontFamily: config.enableFontFamily ? config.fontFamily : undefined, fontSize: config.fontSize }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {logoPreview ? (
                <div className="w-8 h-8 rounded-md overflow-hidden border border-black/10">
                  <img src={logoPreview} alt="Background Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-500 text-sm">T</div>
              )}
              <div>
                <h4 className="font-black text-base" style={{ color: config.enableColors ? config.headingColor : undefined }}>Live Preview</h4>
                <p className="text-xs mt-0.5" style={{ color: config.enableColors ? config.textColor : undefined }}>Your workspace will look like this.</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: config.enableColors ? `${config.primaryColor}25` : undefined, color: config.enableColors ? config.primaryColor : undefined }}>
              <CheckCircleIcon sx={{ fontSize: 18 }} />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button type="button" className="px-4 py-2 text-xs font-bold shadow-sm" style={{ backgroundColor: config.enableColors ? config.buttonBgColor : undefined, color: config.enableColors ? config.buttonTextColor : undefined, borderRadius: config.enableBorderRadius ? config.borderRadius : undefined }}>
              Primary Button
            </button>
            <button type="button" className="px-4 py-2 text-xs font-bold shadow-sm border border-black/5" style={{ backgroundColor: config.enableColors ? config.cardColor : undefined, color: config.enableColors ? config.textColor : undefined, borderRadius: config.enableBorderRadius ? config.borderRadius : undefined }}>
              Secondary
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Quick Presets</h4>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {presets.map(preset => (
            <button type="button" key={preset.name} onClick={() => applyPreset(preset)} title={preset.name} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all hover:scale-105 hover:shadow-md ${isDark ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
              <div className="w-7 h-7 rounded-full shadow-sm border-2 border-white/20" style={{ backgroundColor: preset.primary }} />
              <span className="text-[9px] font-black tracking-wide" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-5 rounded-2xl border space-y-5 ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <h4 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Typography &amp; Shape</h4>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Font Styles</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={config.enableFontFamily} onChange={(e) => set('enableFontFamily')(e.target.checked)} />
                <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <SearchableSelect 
              value={config.fontFamily} 
              disabled={!config.enableFontFamily} 
              onChange={(val) => set('fontFamily')(val)} 
              isDark={isDark} 
              placeholder="Select font..."
              options={fontOptions.map(f => ({ value: f.family, label: f.label || f.family }))}
              renderOption={(opt) => ({ fontFamily: opt.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Font Size</label>
            <SearchableSelect 
              value={config.fontSize} 
              onChange={(val) => set('fontSize')(val)} 
              isDark={isDark}
              placeholder="Select size..."
              options={Array.from({ length: 98 }, (_, i) => i + 3).map(size => ({ value: `${size}px`, label: `${size}px` }))}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">UI Rounding</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={config.enableBorderRadius} onChange={(e) => set('enableBorderRadius')(e.target.checked)} />
                <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div className={`grid grid-cols-2 gap-2 ${!config.enableBorderRadius ? 'opacity-50 pointer-events-none' : ''}`}>
              {[
                { label: 'None', value: '0px' }, { label: 'Extra Sharp', value: '0.125rem' },
                { label: 'Sharp', value: '0.25rem' }, { label: 'Sleek', value: '0.5rem' },
                { label: 'Rounded', value: '0.75rem' }, { label: 'Soft', value: '1.25rem' },
                { label: 'Extra Soft', value: '1.75rem' }, { label: 'Pill', value: '9999px' },
              ].map(r => (
                <button type="button" key={r.value} onClick={() => set('borderRadius')(r.value)} className={`py-2 rounded-xl text-[10px] font-black border transition-all ${config.borderRadius === r.value ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-500 hover:bg-white'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border space-y-5 ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <h4 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Color Mapping</h4>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={config.enableColors} onChange={(e) => set('enableColors')(e.target.checked)} />
              <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className={`space-y-3 ${!config.enableColors ? 'opacity-50 pointer-events-none' : ''}`}>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border-b border-indigo-500/20 pb-1">Core &amp; Surfaces</p>
            <div className="grid grid-cols-2 gap-3">
              <ColorInput label="Brand Primary" value={config.primaryColor} onChange={set('primaryColor')} isDark={isDark} />
              <ColorInput label="Background" value={config.bgColor} onChange={set('bgColor')} isDark={isDark} />
              <ColorInput label="Sidebar" value={config.sidebarColor} onChange={set('sidebarColor')} isDark={isDark} />
              <ColorInput label="Cards" value={config.cardColor} onChange={set('cardColor')} isDark={isDark} />
            </div>
          </div>

          <div className={`space-y-3 ${!config.enableColors ? 'opacity-50 pointer-events-none' : ''}`}>
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest border-b border-purple-500/20 pb-1">Text &amp; Buttons</p>
            <div className="grid grid-cols-2 gap-3">
              <ColorInput label="Headings" value={config.headingColor} onChange={set('headingColor')} isDark={isDark} />
              <ColorInput label="Body Text" value={config.textColor} onChange={set('textColor')} isDark={isDark} />
              <ColorInput label="Button BG" value={config.buttonBgColor} onChange={set('buttonBgColor')} isDark={isDark} />
              <ColorInput label="Button Text" value={config.buttonTextColor} onChange={set('buttonTextColor')} isDark={isDark} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
