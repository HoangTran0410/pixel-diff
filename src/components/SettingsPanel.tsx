import React from 'react';
import { ComparisonSettings } from '../types';
import { Settings2, Info, RefreshCw } from 'lucide-react';

interface SettingsPanelProps {
  settings: ComparisonSettings;
  onSettingsChange: (newSettings: ComparisonSettings) => void;
  isComparing: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  isComparing,
}) => {
  const handleChange = (key: keyof ComparisonSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="w-full h-full bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
          <Settings2 size={20} className="text-blue-500" />
          Settings
        </h2>
        {isComparing && <RefreshCw size={16} className="animate-spin text-blue-500" />}
      </div>

      <div className="p-4 space-y-8 pb-24 md:pb-4">
        {/* Max Dimension */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-300">Max Dimension</label>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded text-blue-400">{settings.maxDimension}px</span>
          </div>
          <input
            type="range"
            min="64"
            max="2048"
            step="64"
            value={settings.maxDimension}
            onChange={(e) => handleChange('maxDimension', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Info size={12} /> Higher = better quality, slower
          </p>
        </div>

        {/* Threshold */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-300">Sensitivity Threshold</label>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded text-purple-400">{settings.threshold.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.threshold}
            onChange={(e) => handleChange('threshold', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <p className="text-xs text-gray-500">Lower = more sensitive to changes</p>
        </div>

        {/* Alpha Blending */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-300">Alpha Blending</label>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded text-green-400">{settings.alpha.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.alpha}
            onChange={(e) => handleChange('alpha', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
           <p className="text-xs text-gray-500">Opacity of original image in diff</p>
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-2">
           <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Include Anti-Aliasing</span>
            <input
              type="checkbox"
              checked={settings.includeAA}
              onChange={(e) => handleChange('includeAA', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-offset-gray-900"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Diff Mask</span>
            <input
              type="checkbox"
              checked={settings.diffMask}
              onChange={(e) => handleChange('diffMask', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-offset-gray-900"
            />
          </label>
        </div>

        {/* Colors */}
        <div className="pt-4 border-t border-gray-800 space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Colors</h3>
          
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Diff Color</label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500">{settings.diffColor}</span>
              <input
                type="color"
                value={settings.diffColor}
                onChange={(e) => handleChange('diffColor', e.target.value)}
                className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Anti-Alias Color</label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500">{settings.aaColor}</span>
               <input
                type="color"
                value={settings.aaColor}
                onChange={(e) => handleChange('aaColor', e.target.value)}
                className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
              />
            </div>
          </div>
          
           <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Alt Diff Color</label>
             <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500">{settings.diffColorAlt || "None"}</span>
               <input
                type="color"
                value={settings.diffColorAlt || "#ffffff"}
                onChange={(e) => handleChange('diffColorAlt', e.target.value)}
                className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;