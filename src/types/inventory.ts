export interface Product {
  id: string;
  code: string;
  name: string;
  unit: string;
  category: string;
  importPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  supplierId?: string;
  supplierName?: string;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt: Date;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: Date;
}

export interface ImportItem {
  id: string;
  importId: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Import {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  items: ImportItem[];
  totalAmount: number;
  importDate: Date;
  notes: string;
  createdAt: Date;
}

export interface InvoiceItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  amount: number;
}

export interface Invoice {
  id: string;
  code: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  vat: number;
  vatAmount: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes: string;
  invoiceDate: Date;
  createdAt: Date;
}

export interface InventoryStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
}

export interface StoreSettings {
  id: string;
  name: string;
  phone: string;
  taxCode?: string;
  address: string;
  bankAccount?: string;
  bankName?: string;
  facebook?: string;
  zalo?: string;
  website?: string;
  defaultVat: number;
  logoUrl?: string;
  updatedAt: Date;
}
