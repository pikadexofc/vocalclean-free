import React from 'react';
import { 
  ChevronLeft,
  Globe,
  Zap,
  FileDown,
  Trash2,
  Lock,
  Smartphone,
  Cpu,
  Sparkles,
  ZapOff,
  Wind,
  Layout,
  Eye,
  Plus,
  Coffee,
  CheckCircle2,
  Users,
  Clock,
  Layers,
  DownloadCloud,
  Database,
  Shield,
  Type as TypeIcon
} from 'lucide-react';
import { SettingsRow } from './SettingsRow';
import { Switch3D } from './ui/Switch3D';
import { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onBack: () => void;
}

export function SettingsView({ settings, setSettings, onBack }: SettingsViewProps) {
  const toggleSetting = (key: keyof AppSettings) => setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
  const updateSetting = (key: keyof AppSettings, value: any) => setSettings((prev: any) => ({ ...prev, [key]: value }));

  return (
    <div className="flex flex-col h-full relative z-10 bg-[#030303]">
      <header className="px-4 pt-8 pb-4 flex items-center gap-4 z-20 sticky top-0 bg-[#030303]/80 backdrop-blur-xl border-b border-white/5">
        <button onClick={onBack} className="w-8 h-8 rounded-full btn-tactile flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-neutral-500" strokeWidth={2} />
        </button>
        <div>
          <h2 className="text-lg font-display font-semibold text-white tracking-tight">Control Center</h2>
          <p className="text-[11px] font-accent text-neutral-600 font-light mt-0.5">VocalClean Engine v1.2 • Pro Active</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-8 pt-3 space-y-6">
        {/* API Configuration */}
        <section>
          <h3 className="text-[11px] font-display font-medium tracking-widest text-neutral-600 uppercase mb-4 px-2 flex items-center gap-2">
            <Lock className="w-3 h-3" /> API Configuration
          </h3>
          <div className="glass-panel-3d rounded-3xl overflow-hidden p-4 space-y-4">
            <div>
              <p className="text-[14px] font-display font-medium text-white mb-1">AI Model</p>
              <p className="text-[11px] font-body text-neutral-500 font-light mb-2">Strictly using Gemini 2 Flash for optimal speed and cost.</p>
              <div className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[12px] text-blue-400 font-display font-bold">
                Gemini 2 Flash (Fastest)
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[14px] font-display font-medium text-white">Custom Gemini API Keys</p>
                <span className="text-[10px] font-display font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">Rotation Enabled</span>
              </div>
              <p className="text-[11px] font-body text-neutral-500 font-light mb-3">Add multiple keys. If one fails, the next will be used automatically.</p>
              
              <div className="space-y-2 mb-3">
                {settings.customApiKeys.map((key: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <div className="flex-1 glass-recessed text-neutral-400 font-mono text-[10px] p-2.5 rounded-lg border border-white/5 truncate">
                      {key.substring(0, 8)}••••••••••••••••{key.substring(key.length - 4)}
                    </div>
                    <button 
                      onClick={() => {
                        const newKeys = [...settings.customApiKeys];
                        newKeys.splice(index, 1);
                        updateSetting('customApiKeys', newKeys);
                      }}
                      className="p-2.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="relative">
                <input 
                  type="password"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val && !settings.customApiKeys.includes(val)) {
                        updateSetting('customApiKeys', [...settings.customApiKeys, val]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                  placeholder="Paste new API key and press Enter..."
                  className="w-full glass-recessed text-neutral-200 font-mono text-[12px] p-3 rounded-xl outline-none focus:border-blue-500/50 transition-colors placeholder:text-neutral-700"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Plus size={14} className="text-neutral-600" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Processing Control */}
        <section>
          <h3 className="text-[11px] font-display font-medium tracking-widest text-neutral-600 uppercase mb-4 px-2 flex items-center gap-2">
            <Cpu className="w-3 h-3" /> AI Processing Control
          </h3>
          <div className="glass-panel-3d rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <p className="text-[14px] font-display font-medium text-white mb-3">Processing Mode</p>
              <div className="flex p-1 glass-recessed rounded-xl">
                {['Fast', 'Balanced', 'Deep'].map(mode => (
                  <button 
                    key={mode}
                    onClick={() => updateSetting('processingMode', mode.toLowerCase())}
                    className={`flex-1 py-2 text-[12px] font-display font-medium rounded-lg transition-all ${settings.processingMode === mode.toLowerCase() ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-b border-white/5">
              <p className="text-[14px] font-display font-medium text-white mb-3">Cleaning Aggression</p>
              <div className="flex p-1 glass-recessed rounded-xl">
                {['Light', 'Balanced', 'Strong'].map(level => (
                  <button 
                    key={level}
                    onClick={() => updateSetting('cleaningLevel', level.toLowerCase())}
                    className={`flex-1 py-2 text-[12px] font-display font-medium rounded-lg transition-all ${settings.cleaningLevel === level.toLowerCase() ? 'bg-white text-black shadow-lg' : 'text-neutral-500'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <SettingsRow 
              icon={CheckCircle2} 
              label="Remove Fillers" 
              description="Strictly remove um, uh, like, etc."
              rightControl={<Switch3D checked={settings.removeFillers} onChange={() => toggleSetting('removeFillers')} />}
            />
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[14px] font-display font-medium text-white">Target Language</p>
                <p className="text-[11px] font-body text-neutral-500 font-light mt-0.5">Translate output to this language</p>
              </div>
              <select 
                value={settings.targetLanguage}
                onChange={(e) => updateSetting('targetLanguage', e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[12px] outline-none"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Japanese">Japanese</option>
              </select>
            </div>
            <SettingsRow 
              icon={Globe} 
              label="Smart Translation" 
              description="Auto-convert non-target to target"
              rightControl={<Switch3D checked={settings.smartTranslation} onChange={() => toggleSetting('smartTranslation')} />}
            />
            <SettingsRow 
              icon={Lock} 
              label="Language Lock" 
              description="Force AI to stay in original language"
              rightControl={<Switch3D checked={settings.languageLock} onChange={() => toggleSetting('languageLock')} />}
            />
            <SettingsRow 
              icon={Users} 
              label="Speaker Detection" 
              description="Separate voices in conversations"
              rightControl={<Switch3D checked={settings.speakerDetection} onChange={() => toggleSetting('speakerDetection')} />}
            />
            <SettingsRow 
              icon={Sparkles} 
              label="Context Awareness" 
              description="Auto-adjust based on audio type"
              rightControl={<Switch3D checked={settings.contextAwareness} onChange={() => toggleSetting('contextAwareness')} />}
            />
          </div>
        </section>

        {/* Subtitle Engine Settings */}
        <section>
          <h3 className="text-[11px] font-display font-medium tracking-widest text-neutral-600 uppercase mb-4 px-2 flex items-center gap-2">
            <TypeIcon className="w-3 h-3" /> Subtitle Engine
          </h3>
          <div className="glass-panel-3d rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[14px] font-display font-medium text-white">Word Limit</p>
                <p className="text-[11px] font-body text-neutral-500 font-light mt-0.5">Max words per subtitle line</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => updateSetting('wordLimit', Math.max(1, settings.wordLimit - 1))} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">-</button>
                <span className="text-white font-display font-bold w-4 text-center">{settings.wordLimit}</span>
                <button onClick={() => updateSetting('wordLimit', Math.min(15, settings.wordLimit + 1))} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">+</button>
              </div>
            </div>
            <SettingsRow 
              icon={Zap} 
              label="Strict Word Limit" 
              description="Enforce limit as a hard constraint"
              rightControl={<Switch3D checked={settings.strictWordLimit} onChange={() => toggleSetting('strictWordLimit')} />}
            />
            <SettingsRow 
              icon={Globe} 
              label="Dual Output" 
              description="Show original + translated subtitles"
              rightControl={<Switch3D checked={settings.dualOutput} onChange={() => toggleSetting('dualOutput')} />}
            />
            <div className="p-4 border-b border-white/5">
              <p className="text-[14px] font-display font-medium text-white mb-3">Timing Precision</p>
              <div className="flex p-1 glass-recessed rounded-xl">
                {['Standard', 'Ultra'].map(mode => (
                  <button 
                    key={mode}
                    onClick={() => updateSetting('timingPrecision', mode.toLowerCase())}
                    className={`flex-1 py-2 text-[12px] font-display font-medium rounded-lg transition-all ${settings.timingPrecision === mode.toLowerCase() ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <SettingsRow 
              icon={Clock} 
              label="Reading Speed Optimizer" 
              description="Auto-adjust duration for comfort"
              rightControl={<Switch3D checked={settings.readingSpeedOptimizer} onChange={() => toggleSetting('readingSpeedOptimizer')} />}
            />
            <SettingsRow 
              icon={Layers} 
              label="Line Breaking Logic" 
              description="Natural sentence splitting"
              rightControl={<Switch3D checked={settings.lineBreakingLogic} onChange={() => toggleSetting('lineBreakingLogic')} />}
            />
          </div>
        </section>

        {/* Export Control */}
        <section>
          <h3 className="text-[11px] font-display font-medium tracking-widest text-neutral-600 uppercase mb-4 px-2 flex items-center gap-2">
            <FileDown className="w-3 h-3" /> Export Control
          </h3>
          <div className="glass-panel-3d rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <p className="text-[14px] font-display font-medium text-white mb-3">Default Format</p>
              <div className="flex p-1 glass-recessed rounded-xl">
                {['SRT', 'VTT', 'TXT'].map(fmt => (
                  <button 
                    key={fmt}
                    onClick={() => updateSetting('defaultFormat', fmt.toLowerCase())}
                    className={`flex-1 py-2 text-[12px] font-display font-medium rounded-lg transition-all ${settings.defaultFormat === fmt.toLowerCase() ? 'bg-white text-black shadow-lg' : 'text-neutral-500'}`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
            <SettingsRow 
              icon={DownloadCloud} 
              label="Auto Export" 
              description="Instantly save after processing"
              rightControl={<Switch3D checked={settings.autoExport} onChange={() => toggleSetting('autoExport')} />}
            />
          </div>
        </section>

        {/* Experience & UI */}
        <section>
          <h3 className="text-[11px] font-display font-medium tracking-widest text-neutral-600 uppercase mb-4 px-2 flex items-center gap-2">
            <Smartphone className="w-3 h-3" /> Experience & UI
          </h3>
          <div className="glass-panel-3d rounded-3xl overflow-hidden">
            <SettingsRow 
              icon={Zap} 
              label="Enable Animations" 
              description="Smooth transitions and effects"
              rightControl={<Switch3D checked={settings.animations} onChange={() => toggleSetting('animations')} />}
            />
            <SettingsRow 
              icon={Wind} 
              label="Reduced Motion" 
              description="Minimize movement for accessibility"
              rightControl={<Switch3D checked={settings.reducedMotion} onChange={() => toggleSetting('reducedMotion')} />}
            />
            <SettingsRow 
              icon={ZapOff} 
              label="Disable Blur Effects" 
              description="Improve performance on older devices"
              rightControl={<Switch3D checked={!settings.enableBlur} onChange={() => toggleSetting('enableBlur')} />}
            />
            <SettingsRow 
              icon={Layout} 
              label="Simple UI Mode" 
              description="Remove complex gradients and 3D effects"
              rightControl={<Switch3D checked={settings.simpleUI} onChange={() => toggleSetting('simpleUI')} />}
            />
            <SettingsRow 
              icon={Eye} 
              label="Focus Mode" 
              description="Hide UI during reading"
              rightControl={<Switch3D checked={settings.focusMode} onChange={() => toggleSetting('focusMode')} />}
            />
          </div>
        </section>

        {/* Storage & Performance */}
        <section>
          <h3 className="text-[11px] font-display font-medium tracking-widest text-neutral-600 uppercase mb-4 px-2 flex items-center gap-2">
            <Database className="w-3 h-3" /> Storage & Performance
          </h3>
          <div className="glass-panel-3d rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[14px] font-display font-medium text-white">Auto-Delete Rules</p>
                <p className="text-[11px] font-body text-neutral-500 font-light mt-0.5">Remove files after {settings.autoDeleteDays} days</p>
              </div>
              <select 
                value={settings.autoDeleteDays}
                onChange={(e) => updateSetting('autoDeleteDays', parseInt(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[12px] outline-none"
              >
                <option value={1}>1 Day</option>
                <option value={7}>7 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>
            <SettingsRow 
              icon={Smartphone} 
              label="Low Quality Mode" 
              description="Save data and speed up processing"
              rightControl={<Switch3D checked={settings.lowQualityMode} onChange={() => toggleSetting('lowQualityMode')} />}
            />
            <button className="w-full p-4 flex items-center gap-4 text-red-500 hover:bg-red-500/5 transition-colors">
              <Trash2 className="w-4 h-4" />
              <span className="text-[14px] font-display font-medium">Clear Cache & Data</span>
            </button>
          </div>
        </section>

        {/* Privacy & Security */}
        <section>
          <h3 className="text-[11px] font-display font-medium tracking-widest text-neutral-600 uppercase mb-4 px-2 flex items-center gap-2">
            <Shield className="w-3 h-3" /> Privacy & Security
          </h3>
          <div className="glass-panel-3d rounded-3xl overflow-hidden">
            <SettingsRow 
              icon={Trash2} 
              label="Auto-Delete After Processing" 
              description="Files are not stored on server"
              rightControl={<Switch3D checked={settings.autoDeleteAfterProcessing} onChange={() => toggleSetting('autoDeleteAfterProcessing')} />}
            />
            <SettingsRow 
              icon={Lock} 
              label="Secure Processing" 
              description="End-to-end encrypted upload"
              rightControl={<Switch3D checked={settings.secureProcessing} onChange={() => toggleSetting('secureProcessing')} />}
            />
          </div>
        </section>

        <div className="stagger-3 pb-10 flex flex-col items-center gap-4 mt-4">
          <button 
            className="spatial-pill group w-full shadow-[0_0_25px_rgba(59,130,246,0.15)] hover:shadow-[0_0_35px_rgba(59,130,246,0.25)] transition-all duration-500" 
            onClick={() => window.open('https://www.supportkori.com/mdzobaedislamshanto', '_blank')}
          >
            <div className="spatial-pill-inner">
              <span className="spatial-pill-text font-semibold">Made with ❤️ by Pickko</span>
            </div>
            <div className="spatial-pill-knob">
              <Coffee size={22} className="text-white/30 group-hover:text-white/70 transition-colors" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
