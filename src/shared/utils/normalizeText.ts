export const normalizeText = (text: string) =>
  text
    .normalize("NFD") // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, "") // remove TODOS os espaços
    .replace(/[^a-zA-Z0-9]/g, "") // remove símbolos (opcional)
    .toLowerCase()
    .trim();
