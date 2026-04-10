export type ParsedBarcode =
  | { type: "weighted"; productCode: string; weight: number }
  | { type: "unit"; productCode: string };

export const parseBarcode = (code: string): ParsedBarcode => {
  if (!/^\d+$/.test(code)) {
    throw new Error("Invalid barcode");
  }

  if (code === "00000") {
    return { type: "unit", productCode: "00000" };
  }

  const prefix = code.slice(0, 2);
  const isWeighted = code.length === 13 && prefix >= "20" && prefix <= "29";

  if (isWeighted) {
    const productCode = code.slice(2, 7);
    const weightRaw = code.slice(7, 12);

    const weightInt = parseInt(weightRaw, 10);

    if (isNaN(weightInt)) {
      throw new Error("Invalid weight in barcode");
    }

    const weight = weightInt / 1000;

    return {
      type: "weighted",
      productCode,
      weight,
    };
  }

  return {
    type: "unit",
    productCode: code,
  };
};
