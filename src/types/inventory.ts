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

export interface ImportRecord {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  supplierId: string;
  supplierName: string;
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
