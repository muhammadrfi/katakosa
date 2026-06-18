import React from 'react';
import { Button } from './ui/button';

export const DataBackup: React.FC = () => {
  const exportData = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('katakosa_')) {
        data[key] = localStorage.getItem(key) || '';
      }
    }
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'katakosa_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, value as string);
        });
        alert('Data imported successfully!');
        window.location.reload();
      } catch (err) {
        alert('Failed to import data.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-2">
      <Button onClick={exportData} variant="outline">Export Progres</Button>
      <input type="file" onChange={importData} accept=".json" className="hidden" id="import-data" />
      <Button variant="outline" asChild>
        <label htmlFor="import-data">Import Progres</label>
      </Button>
    </div>
  );
};
