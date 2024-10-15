function splitMessage(message: string, limit: number): string[] {
  const result: string[] = [];
  let currentPart = "";

  for (let i = 0; i < message.length; i++) {
    const char = message[i];
    currentPart += char;

    // If the current part exceeds the limit and the character is '.' or ':'
    if ((char === "." || char === ":") && currentPart.length >= limit) {
      result.push(currentPart.trim());
      currentPart = ""; // Start a new part
    }
  }

  // Push the remaining part if not empty
  if (currentPart.trim()) {
    result.push(currentPart.trim());
  }

  return result;
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
