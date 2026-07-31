import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  CurrencyPreference,
  LanguagePreference,
} from '@/lib/localization/resolution';

type LocalizationPreferencesState = {
  currencyPreference: CurrencyPreference;
  languagePreference: LanguagePreference;
  setCurrencyPreference: (currencyPreference: CurrencyPreference) => void;
  setLanguagePreference: (languagePreference: LanguagePreference) => void;
};

export const LOCALIZATION_PREFERENCES_STORAGE_KEY = 'localization-preferences-v1';

export const useLocalizationPreferencesStore = create<LocalizationPreferencesState>()(
  persist(
    (set) => ({
      currencyPreference: 'system',
      languagePreference: 'system',
      setCurrencyPreference: (currencyPreference) => {
        set({ currencyPreference });
      },
      setLanguagePreference: (languagePreference) => {
        set({ languagePreference });
      },
    }),
    {
      name: LOCALIZATION_PREFERENCES_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
