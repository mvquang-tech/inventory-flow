import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Supplier, ImportRecord, Invoice, InventoryStats } from '@/types/inventory';

interface InventoryContextType {
  products: Product[];
  suppliers: Supplier[];
  importRecords: ImportRecord[];
  invoices: Invoice[];
  stats: InventoryStats;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addImportRecord: (record: Omit<ImportRecord, 'id' | 'createdAt'>) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);

// Sample data
const sampleProducts: Product[] = [
  { id: '1', code: 'SP001', name: 'Laptop Dell XPS 15', unit: 'Cái', category: 'Điện tử', importPrice: 25000000, sellingPrice: 32000000, stock: 15, minStock: 5, createdAt: new Date() },
  { id: '2', code: 'SP002', name: 'iPhone 15 Pro Max', unit: 'Cái', category: 'Điện thoại', importPrice: 28000000, sellingPrice: 35000000, stock: 20, minStock: 10, createdAt: new Date() },
  { id: '3', code: 'SP003', name: 'Samsung Galaxy S24', unit: 'Cái', category: 'Điện thoại', importPrice: 18000000, sellingPrice: 23000000, stock: 8, minStock: 10, createdAt: new Date() },
  { id: '4', code: 'SP004', name: 'Tai nghe AirPods Pro', unit: 'Cái', category: 'Phụ kiện', importPrice: 5000000, sellingPrice: 6500000, stock: 30, minStock: 15, createdAt: new Date() },
  { id: '5', code: 'SP005', name: 'Bàn phím cơ Logitech', unit: 'Cái', category: 'Phụ kiện', importPrice: 2500000, sellingPrice: 3200000, stock: 25, minStock: 10, createdAt: new Date() },
];

const sampleSuppliers: Supplier[] = [
  { id: '1', code: 'NCC001', name: 'Công ty TNHH ABC', phone: '0901234567', email: 'abc@company.com', address: '123 Nguyễn Văn A, Q.1, TP.HCM', createdAt: new Date() },
  { id: '2', code: 'NCC002', name: 'Công ty CP XYZ', phone: '0912345678', email: 'xyz@company.com', address: '456 Lê Văn B, Q.3, TP.HCM', createdAt: new Date() },
  { id: '3', code: 'NCC003', name: 'Nhà phân phối DEF', phone: '0923456789', email: 'def@company.com', address: '789 Trần Văn C, Q.7, TP.HCM', createdAt: new Date() },
];

const sampleImportRecords: ImportRecord[] = [
  { id: '1', productId: '1', productCode: 'SP001', productName: 'Laptop Dell XPS 15', quantity: 10, unitPrice: 25000000, totalAmount: 250000000, supplierId: '1', supplierName: 'Công ty TNHH ABC', importDate: new Date('2024-01-15'), notes: 'Nhập hàng đầu năm', createdAt: new Date() },
  { id: '2', productId: '2', productCode: 'SP002', productName: 'iPhone 15 Pro Max', quantity: 15, unitPrice: 28000000, totalAmount: 420000000, supplierId: '2', supplierName: 'Công ty CP XYZ', importDate: new Date('2024-01-20'), notes: '', createdAt: new Date() },
];

const sampleInvoices: Invoice[] = [
  { 
    id: '1', 
    code: 'HD001', 
    customerName: 'Nguyễn Văn A', 
    customerPhone: '0901234567',
    items: [
      { productId: '1', productCode: 'SP001', productName: 'Laptop Dell XPS 15', quantity: 1, unitPrice: 32000000, discount: 0, amount: 32000000 }
    ],
    subtotal: 32000000,
    vat: 10,
    vatAmount: 3200000,
    shippingCost: 50000,
    discount: 0,
    totalAmount: 35250000,
    paymentMethod: 'Chuyển khoản',
    status: 'completed',
    notes: '',
    invoiceDate: new Date('2024-01-25'),
    createdAt: new Date()
  },
];

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('inventory_products');
    return saved ? JSON.parse(saved) : sampleProducts;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('inventory_suppliers');
    return saved ? JSON.parse(saved) : sampleSuppliers;
  });

  const [importRecords, setImportRecords] = useState<ImportRecord[]>(() => {
    const saved = localStorage.getItem('inventory_imports');
    return saved ? JSON.parse(saved) : sampleImportRecords;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('inventory_invoices');
    return saved ? JSON.parse(saved) : sampleInvoices;
  });

  useEffect(() => {
    localStorage.setItem('inventory_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('inventory_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('inventory_imports', JSON.stringify(importRecords));
  }, [importRecords]);

  useEffect(() => {
    localStorage.setItem('inventory_invoices', JSON.stringify(invoices));
  }, [invoices]);

  const stats: InventoryStats = {
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + p.stock, 0),
    totalValue: products.reduce((sum, p) => sum + p.stock * p.importPrice, 0),
    lowStockCount: products.filter(p => p.stock < p.minStock).length,
  };

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    setProducts(prev => [...prev, { ...product, id: generateId(), createdAt: new Date() }]);
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...product } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addSupplier = (supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    setSuppliers(prev => [...prev, { ...supplier, id: generateId(), createdAt: new Date() }]);
  };

  const updateSupplier = (id: string, supplier: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...supplier } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const addImportRecord = (record: Omit<ImportRecord, 'id' | 'createdAt'>) => {
    setImportRecords(prev => [...prev, { ...record, id: generateId(), createdAt: new Date() }]);
    // Update product stock
    setProducts(prev => prev.map(p => 
      p.id === record.productId 
        ? { ...p, stock: p.stock + record.quantity }
        : p
    ));
  };

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    setInvoices(prev => [...prev, { ...invoice, id: generateId(), createdAt: new Date() }]);
    // Update product stock
    invoice.items.forEach(item => {
      setProducts(prev => prev.map(p => 
        p.id === item.productId 
          ? { ...p, stock: p.stock - item.quantity }
          : p
      ));
    });
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  return (
    <InventoryContext.Provider value={{
      products,
      suppliers,
      importRecords,
      invoices,
      stats,
      addProduct,
      updateProduct,
      deleteProduct,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      addImportRecord,
      addInvoice,
      updateInvoiceStatus,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
};
