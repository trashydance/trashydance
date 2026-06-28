/**
 * Norminette formatting — trasforma il testo secondo le regole 42 Norminette
 * - Maiuscola prima lettera
 * - Rimuovi spazi doppi
 * - Max 80 caratteri per riga
 * - Se una riga supera 80 char, aggiungi warning [Norme Error: line too long]
 */

export function formatWithNorminette(text: string): string {
	if (!text) return text;

	// 1. Maiuscola prima lettera
	let result = text.charAt(0).toUpperCase() + text.slice(1);

	// 2. Rimuovi spazi doppi (più di uno spazio diventa uno)
	result = result.replace(/\s+/g, " ");

	// 3. Trim trailing/leading spaces
	result = result.trim();

	// 4. Suddividi in righe a 80 char max, aggiungi warning se supera
	const lines: string[] = [];
	let currentLine = "";

	for (let i = 0; i < result.length; i++) {
		currentLine += result[i];

		// Se arriviamo a 80 caratteri o a fine testo
		if (currentLine.length >= 80 || i === result.length - 1) {
			if (currentLine.length > 80) {
				// Tronca a 80 e aggiungi warning
				lines.push(`${currentLine.slice(0, 80)} [Norme Error: line too long]`);
				currentLine = currentLine.slice(80);
			} else if (i === result.length - 1) {
				lines.push(currentLine);
				currentLine = "";
			}
		}
	}

	// Se c'è ancora testo in currentLine (non processato)
	if (currentLine.length > 0) {
		lines.push(currentLine);
	}

	return lines.join("\n");
}

/**
 * Versione lightweight che non aggiunge warning, solo formatta il testo
 */
export function formatWithNorminetteLight(text: string): string {
	if (!text) return text;

	// Maiuscola prima lettera
	let result = text.charAt(0).toUpperCase() + text.slice(1);

	// Rimuovi spazi doppi
	result = result.replace(/\s+/g, " ");

	// Trim
	result = result.trim();

	return result;
}
