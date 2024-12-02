import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const usePageTitle = (titleKey: string, defaultTitle = 'NoteBloom') => {
  const { t } = useTranslation();

  useEffect(() => {
    const translatedTitle = titleKey ? t(titleKey) : defaultTitle;
    document.title = `${translatedTitle} | NoteBloom`;
  }, [titleKey, t, defaultTitle]);
};
