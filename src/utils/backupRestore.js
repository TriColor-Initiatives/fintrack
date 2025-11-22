import JSZip from 'jszip';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

const STORAGE_KEYS = {
  ENTRIES: 'fintrack_entries',
  INVOICES: 'fintrack_invoices',
  CLIENTS: 'fintrack_clients',
  ORGANIZATION_SETTINGS: 'fintrack_organization_settings',
};

// Check if running on native platform
const isNative = Capacitor.isNativePlatform();

/**
 * Export all app data as a ZIP file
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const exportData = async () => {
  try {
    // Collect all data from localStorage
    const entries = localStorage.getItem(STORAGE_KEYS.ENTRIES) || '[]';
    const invoices = localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]';
    const clients = localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]';
    const settings = localStorage.getItem(STORAGE_KEYS.ORGANIZATION_SETTINGS) || '{}';

    // Create a new ZIP file
    const zip = new JSZip();
    
    // Add JSON files to the ZIP
    zip.file('entries.json', entries);
    zip.file('invoices.json', invoices);
    zip.file('clients.json', clients);
    zip.file('settings.json', settings);

    // Generate ZIP file as base64
    const zipContent = await zip.generateAsync({ type: 'base64' });

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `fintrack_backup_${timestamp}.zip`;

    if (isNative) {
      // Save using Capacitor Filesystem on native platform
      await Filesystem.writeFile({
        path: filename,
        data: zipContent,
        directory: Directory.Documents,
      });

      return {
        success: true,
        message: `Backup saved successfully to Documents folder as ${filename}`,
      };
    } else {
      // For web platform, download the file
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return {
        success: true,
        message: `Backup downloaded successfully as ${filename}`,
      };
    }
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      message: `Export failed: ${error.message}`,
    };
  }
};

/**
 * Import data from a ZIP file
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const importData = async () => {
  try {
    let zipContent;

    if (isNative) {
      // Use file picker on native platform
      // Note: We'll need to implement file picker dialog
      // For now, we'll use a simple approach with Documents directory
      const result = await Filesystem.readFile({
        path: 'fintrack_backup.zip', // User needs to place file here
        directory: Directory.Documents,
      });

      zipContent = result.data;
    } else {
      // For web platform, use file input
      zipContent = await selectFileWeb();
    }

    if (!zipContent) {
      return {
        success: false,
        message: 'No file selected',
      };
    }

    // Load and extract ZIP file
    const zip = await JSZip.loadAsync(zipContent, { base64: isNative });

    // Extract and validate each file
    const entriesFile = zip.file('entries.json');
    const invoicesFile = zip.file('invoices.json');
    const clientsFile = zip.file('clients.json');
    const settingsFile = zip.file('settings.json');

    if (!entriesFile || !invoicesFile || !clientsFile || !settingsFile) {
      return {
        success: false,
        message: 'Invalid backup file: Missing required data files',
      };
    }

    // Read and parse each file
    const entries = await entriesFile.async('text');
    const invoices = await invoicesFile.async('text');
    const clients = await clientsFile.async('text');
    const settings = await settingsFile.async('text');

    // Validate JSON format
    try {
      JSON.parse(entries);
      JSON.parse(invoices);
      JSON.parse(clients);
      JSON.parse(settings);
    } catch (e) {
      return {
        success: false,
        message: 'Invalid backup file: Corrupted data',
      };
    }

    // Restore data to localStorage
    localStorage.setItem(STORAGE_KEYS.ENTRIES, entries);
    localStorage.setItem(STORAGE_KEYS.INVOICES, invoices);
    localStorage.setItem(STORAGE_KEYS.CLIENTS, clients);
    localStorage.setItem(STORAGE_KEYS.ORGANIZATION_SETTINGS, settings);

    return {
      success: true,
      message: 'Data imported successfully! Please refresh the page to see your restored data.',
    };
  } catch (error) {
    console.error('Import error:', error);
    return {
      success: false,
      message: `Import failed: ${error.message}`,
    };
  }
};

/**
 * Helper function to select a file on web platform
 * @returns {Promise<string|null>}
 */
const selectFileWeb = () => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.onerror = () => {
        resolve(null);
      };
      reader.readAsArrayBuffer(file);
    };

    input.oncancel = () => {
      resolve(null);
    };

    input.click();
  });
};

/**
 * Get a preview of backup data (number of items)
 * @returns {object}
 */
export const getBackupPreview = () => {
  try {
    const entries = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENTRIES) || '[]');
    const invoices = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
    const clients = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]');

    return {
      entries: entries.length,
      invoices: invoices.length,
      clients: clients.length,
    };
  } catch (error) {
    return {
      entries: 0,
      invoices: 0,
      clients: 0,
    };
  }
};

