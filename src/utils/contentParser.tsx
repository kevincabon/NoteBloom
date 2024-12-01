import { Link } from "lucide-react";

export const parseContent = (content: string) => {
  const urlRegex = /(https?:\/\/[^\s<>]+)/g;
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g;
  const phoneRegex = /(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;

  const links = content.match(urlRegex) || [];
  const email = content.match(emailRegex)?.[0];
  const phone = content.match(phoneRegex)?.[0];

  return { links, email, phone };
};

export const formatContent = (content: string): string => {
  if (!content) return "";

  let formattedContent = content;

  // Remplacer d'abord les retours à la ligne par des <br>
  formattedContent = formattedContent.replace(/\n/g, '<br>');
  
  // Format URLs
  const urlRegex = /(https?:\/\/[^\s<>]+)/g;
  formattedContent = formattedContent.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline" onclick="event.stopPropagation()">${url}</a>`;
  });

  // Format emails
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g;
  formattedContent = formattedContent.replace(emailRegex, (email) => {
    return `<a href="mailto:${email}" class="text-primary hover:underline" onclick="event.stopPropagation()">${email}</a>`;
  });

  // Format phone numbers
  const phoneRegex = /(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
  formattedContent = formattedContent.replace(phoneRegex, (phone) => {
    return `<a href="tel:${phone}" class="text-primary hover:underline" onclick="event.stopPropagation()">${phone}</a>`;
  });

  return formattedContent;
};