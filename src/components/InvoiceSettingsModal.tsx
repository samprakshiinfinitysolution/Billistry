import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface InvoiceSettings {
  showTax: boolean;
  showGST: boolean;
}

interface InvoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: InvoiceSettings;
  onSave: (settings: InvoiceSettings) => void;
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out  ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      }`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

const InvoiceSettingsModal: React.FC<InvoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState<InvoiceSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    try { window.localStorage.setItem('invoiceSettings', JSON.stringify(localSettings)); } catch (e) {}
    onSave(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings); // Reset to original settings
    onClose();
  };

  const updateSetting = (key: keyof InvoiceSettings, value: boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className={`bg-white rounded-xl shadow-xl w-full max-w-md p-6 transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Quick Invoice Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Settings List */}
        <div className="space-y-3 mb-6">
          {/* Show Tax Setting */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Show Tax
              </h3>
              <p className="text-xs text-gray-600">
                Display total tax amount on invoices.
              </p>
            </div>
            <ToggleSwitch
              checked={localSettings.showTax}
              onChange={(checked) => updateSetting('showTax', checked)}
            />
          </div>

          {/* Show GST Setting */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Show GST
              </h3>
              <p className="text-xs text-gray-600">
                Include GST details on invoices.
              </p>
            </div>
            <ToggleSwitch
              checked={localSettings.showGST}
              onChange={(checked) => updateSetting('showGST', checked)}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 font-medium"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSettingsModal;