import CryptoJS from 'crypto-js';

export const useNoteEncryption = () => {
  const encryptContent = (content: string, password: string): string => {
    return CryptoJS.AES.encrypt(content, password).toString();
  };

  const decryptContent = (encryptedContent: string, password: string): string | null => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedContent, password);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error decrypting content:', error);
      return null;
    }
  };

  const hashPassword = (password: string): string => {
    return CryptoJS.SHA256(password).toString();
  };

  return {
    encryptContent,
    decryptContent,
    hashPassword,
  };
};
