export function getBaseUrl() {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api`
    : `http://localhost:3000/api`;
}

export function removeMarkdown(text: string) {
  return (
    text
      // Rimuovi i link
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Rimuovi i grassetti
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      // Rimuovi i corsivi
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      // Rimuovi gli header
      .replace(/#+\s+(.*?)/g, "$1")
      // Rimuovi i blocchi di codice
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      // Rimuovi eventuali altri simboli Markdown come ">"
      .replace(/^>\s+/gm, "")
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "") // Rimuovi immagini
      // Rimuovi testo incluso tra 【 】 compresi i delimitatori stessi
      .replace(/【[^】]*】/g, "")
      .trim()
  );
}
