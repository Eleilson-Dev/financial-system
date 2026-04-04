export interface TCreateProductDTO {
  name: string;
  price: number;
  stock: number;
  stockType: "UNIT" | "KILO";
  barcode: string;
  categoryId?: string;
  companyId: string;
}
