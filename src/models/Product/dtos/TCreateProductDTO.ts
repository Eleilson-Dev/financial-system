export interface TCreateProductDTO {
  name: string;
  price: number;
  stock: number;
  stockType: "UNIT" | "KG";
  barcode: string;
  categoryId?: string;
  companyId: string;
}
