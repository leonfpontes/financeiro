/**
 * Calcula a reserva mensal necessária para atingir uma meta (Sonho).
 *
 * @param metaTotal  Valor total da meta (R$)
 * @param dataAlvoStr  Mês-alvo no formato "YYYY-MM"
 * @param hoje  Data de referência (normalmente new Date())
 * @returns Valor a guardar por mês (mínimo 1 mês)
 */
export function calcSonhoMensal(
  metaTotal: number,
  dataAlvoStr: string,
  hoje: Date,
): number {
  const [anoAlvo, mesAlvo] = dataAlvoStr.split("-").map(Number);
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1; // 1-indexed
  const meses = Math.max(
    1,
    (anoAlvo - anoAtual) * 12 + (mesAlvo - mesAtual) + 1,
  );
  return metaTotal / meses;
}

/**
 * Variante que aceita um objeto Date (como retornado pelo Prisma).
 */
export function calcSonhoMensalFromDate(
  metaTotal: number,
  dataAlvo: Date,
  hoje: Date,
): number {
  const anoAlvo = dataAlvo.getUTCFullYear();
  const mesAlvo = dataAlvo.getUTCMonth() + 1;
  return calcSonhoMensal(
    metaTotal,
    `${anoAlvo}-${String(mesAlvo).padStart(2, "0")}`,
    hoje,
  );
}

/**
 * Formata um mês-alvo (Date ou "YYYY-MM") para exibição em PT-BR.
 * Exemplo: "2027-12" → "dez/2027"
 */
export function formatDataAlvo(dataAlvo: Date | string): string {
  let year: number;
  let month: number; // 1-indexed

  if (typeof dataAlvo === "string") {
    [year, month] = dataAlvo.split("-").map(Number);
  } else {
    year = dataAlvo.getUTCFullYear();
    month = dataAlvo.getUTCMonth() + 1;
  }

  const meses = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez",
  ];
  return `${meses[month - 1]}/${year}`;
}

/**
 * Retorna quantos meses faltam até o mês-alvo (inclusive o mês atual).
 */
export function mesesRestantes(dataAlvo: Date | string, hoje: Date): number {
  let anoAlvo: number;
  let mesAlvo: number;

  if (typeof dataAlvo === "string") {
    [anoAlvo, mesAlvo] = dataAlvo.split("-").map(Number);
  } else {
    anoAlvo = dataAlvo.getUTCFullYear();
    mesAlvo = dataAlvo.getUTCMonth() + 1;
  }

  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;
  return Math.max(1, (anoAlvo - anoAtual) * 12 + (mesAlvo - mesAtual) + 1);
}
