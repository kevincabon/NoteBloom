import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import French translations
import frAdmin from './locales/fr/admin.json';
import frAuth from './locales/fr/auth.json';
import frCommon from './locales/fr/common.json';
import frDelete from './locales/fr/delete.json';
import frEditor from './locales/fr/editor.json';
import frFavorites from './locales/fr/favorites.json';
import frFeedback from './locales/fr/feedback.json';
import frFolders from './locales/fr/folders.json';
import frLanding from './locales/fr/landing.json';
import frLimits from './locales/fr/limits.json';
import frNotes from './locales/fr/notes.json';
import frProfile from './locales/fr/profile.json';
import frRoadmap from './locales/fr/roadmap.json';
import frShared from './locales/fr/shared.json';
import frTags from './locales/fr/tags.json';
import frTheme from './locales/fr/theme.json';

// Import English translations
import enAdmin from './locales/en/admin.json';
import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enDelete from './locales/en/delete.json';
import enEditor from './locales/en/editor.json';
import enFavorites from './locales/en/favorites.json';
import enFeedback from './locales/en/feedback.json';
import enFolders from './locales/en/folders.json';
import enLanding from './locales/en/landing.json';
import enLimits from './locales/en/limits.json';
import enNotes from './locales/en/notes.json';
import enProfile from './locales/en/profile.json';
import enRoadmap from './locales/en/roadmap.json';
import enShared from './locales/en/shared.json';
import enTags from './locales/en/tags.json';
import enTheme from './locales/en/theme.json';

// Import Spanish translations
import esAdmin from './locales/es/admin.json';
import esAuth from './locales/es/auth.json';
import esCommon from './locales/es/common.json';
import esDelete from './locales/es/delete.json';
import esEditor from './locales/es/editor.json';
import esFavorites from './locales/es/favorites.json';
import esFeedback from './locales/es/feedback.json';
import esFolders from './locales/es/folders.json';
import esLanding from './locales/es/landing.json';
import esLimits from './locales/es/limits.json';
import esNotes from './locales/es/notes.json';
import esProfile from './locales/es/profile.json';
import esRoadmap from './locales/es/roadmap.json';
import esShared from './locales/es/shared.json';
import esTags from './locales/es/tags.json';
import esTheme from './locales/es/theme.json';

i18n.use(initReactI18next).init({
  resources: {
    fr: {
      admin: frAdmin,
      auth: frAuth,
      common: frCommon,
      delete: frDelete,
      editor: frEditor,
      favorites: frFavorites,
      feedback: frFeedback,
      folders: frFolders,
      landing: frLanding,
      limits: frLimits,
      notes: frNotes,
      profile: frProfile,
      roadmap: frRoadmap,
      shared: frShared,
      tags: frTags,
      theme: frTheme,
    },
    en: {
      admin: enAdmin,
      auth: enAuth,
      common: enCommon,
      delete: enDelete,
      editor: enEditor,
      favorites: enFavorites,
      feedback: enFeedback,
      folders: enFolders,
      landing: enLanding,
      limits: enLimits,
      notes: enNotes,
      profile: enProfile,
      roadmap: enRoadmap,
      shared: enShared,
      tags: enTags,
      theme: enTheme,
    },
    es: {
      admin: esAdmin,
      auth: esAuth,
      common: esCommon,
      delete: esDelete,
      editor: esEditor,
      favorites: esFavorites,
      feedback: esFeedback,
      folders: esFolders,
      landing: esLanding,
      limits: esLimits,
      notes: esNotes,
      profile: esProfile,
      roadmap: esRoadmap,
      shared: esShared,
      tags: esTags,
      theme: esTheme,
    }
  },
  lng: navigator.language.split('-')[0] || 'en',
  fallbackLng: 'en',
  ns: [
    'admin',
    'auth',
    'common',
    'delete',
    'editor',
    'favorites',
    'feedback',
    'folders',
    'landing',
    'limits',
    'notes',
    'profile',
    'roadmap',
    'shared',
    'tags',
    'theme',
  ],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
  nsSeparator: '.',
  keySeparator: false,
});

export default i18n;