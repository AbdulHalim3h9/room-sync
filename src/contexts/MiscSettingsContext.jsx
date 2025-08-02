import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const MiscSettingsContext = createContext();

export const MiscSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    floatingButtons: {
      carryforward: true,
      due: true,
      bills: true
    },
    loading: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'miscSettings', 'default');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setSettings(prev => ({
            ...prev,
            ...docSnap.data(),
            loading: false
          }));
        } else {
          // Initialize with default settings if no document exists
          await setDoc(docRef, {
            darkMode: false,
            notifications: true,
            compactView: false
          });
          setSettings(prev => ({
            ...prev,
            loading: false
          }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setSettings(prev => ({
          ...prev,
          loading: false
        }));
      }
    };

    fetchSettings();
  }, []);

  const updateSetting = async (key, value) => {
    try {
      // Handle nested floatingButtons updates
      const newSettings = { ...settings };
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        newSettings[parent] = { ...newSettings[parent], [child]: value };
      } else {
        newSettings[key] = value;
      }
      setSettings(newSettings);
      
      // Update in Firestore
      // Only save the settings we want to persist
      const settingsToSave = {
        floatingButtons: newSettings.floatingButtons
      };
      await setDoc(doc(db, 'miscSettings', 'default'), settingsToSave, { merge: true });
      
    } catch (error) {
      console.error('Error updating setting:', error);
      // Revert on error
      setSettings(prev => ({
        ...prev,
        [key]: !value
      }));
    }
  };

  return (
    <MiscSettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </MiscSettingsContext.Provider>
  );
};

export const useMiscSettings = () => {
  const context = useContext(MiscSettingsContext);
  if (!context) {
    throw new Error('useMiscSettings must be used within a MiscSettingsProvider');
  }
  return context;
};

export default MiscSettingsContext;
