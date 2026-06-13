// Utilitários para cruzar os anos das obras com os marcos da linha do tempo.

/**
 * Extrai o primeiro número de 4 dígitos de um texto de ano.
 * Cobre "1974", "Década 1980" → 1980, "2000". Retorna null se não houver.
 */
export function extrairAno(ano: string | null | undefined): number | null {
  if (!ano) return null;
  const m = ano.match(/\b(\d{4})\b/);
  return m ? Number(m[1]) : null;
}

/**
 * Retorna o ano de marco mais próximo do ano informado.
 * Em caso de empate na distância, prefere o marco mais antigo.
 */
export function marcoMaisProximo(
  ano: number,
  anosMarcos: number[],
): number | null {
  if (anosMarcos.length === 0) return null;
  let melhor = anosMarcos[0];
  let menorDist = Math.abs(anosMarcos[0] - ano);
  for (const m of anosMarcos) {
    const dist = Math.abs(m - ano);
    if (dist < menorDist || (dist === menorDist && m < melhor)) {
      melhor = m;
      menorDist = dist;
    }
  }
  return melhor;
}

/**
 * Dado o texto de ano de uma obra, retorna o marco correspondente:
 * `{ marco, exato }`. `exato` indica se o ano da obra coincide com um marco.
 */
export function marcoDaObra(
  anoTexto: string | null | undefined,
  anosMarcos: number[],
): { marco: number; exato: boolean } | null {
  const ano = extrairAno(anoTexto);
  if (ano === null) return null;
  const marco = marcoMaisProximo(ano, anosMarcos);
  if (marco === null) return null;
  return { marco, exato: marco === ano };
}
