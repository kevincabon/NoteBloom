// Regex patterns for detection
const URL_PATTERN = /https?:\/\/[^\s<]+[^<.,:;"')\]\s]/g;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /(?:\+\d{1,3}[-. ]?)?\(?\d{1,4}\)?[-. ]?\d{1,4}[-. ]?\d{1,9}/g;

export const parseContent = (content: string) => {
  const links: string[] = content.match(URL_PATTERN) || [];
  const emails: string[] = content.match(EMAIL_PATTERN) || [];
  const phones: string[] = content.match(PHONE_PATTERN) || [];

  return {
    links,
    email: emails[0] || null,
    phone: phones[0] || null,
  };
};

export const formatContent = (content: string): JSX.Element[] => {
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  // Function to add text between matches
  const addTextBetween = (start: number, end: number) => {
    if (start < end) {
      parts.push(content.slice(start, end));
    }
  };

  // Find all matches
  const matches = [
    ...content.matchAll(URL_PATTERN),
    ...content.matchAll(EMAIL_PATTERN),
    ...content.matchAll(PHONE_PATTERN),
  ].sort((a, b) => (a.index || 0) - (b.index || 0));

  // Process each match
  matches.forEach((match, i) => {
    const matchText = match[0];
    const startIndex = match.index || 0;

    addTextBetween(lastIndex, startIndex);

    if (URL_PATTERN.test(matchText)) {
      parts.push(
        <a
          key={`link-${i}`}
          href={matchText}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {matchText}
        </a>
      );
    } else if (EMAIL_PATTERN.test(matchText)) {
      parts.push(
        <a
          key={`email-${i}`}
          href={`mailto:${matchText}`}
          className="text-primary hover:underline"
        >
          {matchText}
        </a>
      );
    } else if (PHONE_PATTERN.test(matchText)) {
      parts.push(
        <a
          key={`phone-${i}`}
          href={`tel:${matchText.replace(/[^0-9+]/g, "")}`}
          className="text-primary hover:underline"
        >
          {matchText}
        </a>
      );
    }

    lastIndex = startIndex + matchText.length;
  });

  addTextBetween(lastIndex, content.length);

  return parts as JSX.Element[];
};