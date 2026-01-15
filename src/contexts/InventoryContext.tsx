import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Supplier, Import, Invoice, InventoryStats, Customer, StoreSettings } from '@/types/inventory';
import { supabase } from '@/lib/supabase';

interface InventoryContextType {
  products: Product[];
  suppliers: Supplier[];
  customers: Customer[];
  imports: Import[];
  invoices: Invoice[];
  settings: StoreSettings | null;
  stats: InventoryStats;
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<Customer | undefined>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addImport: (importData: Omit<Import, 'id' | 'createdAt'>) => Promise<void>;
  updateImport: (id: string, importData: Partial<Import>) => Promise<void>;
  deleteImport: (id: string) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Promise<Invoice>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
  updateSettings: (settings: Partial<StoreSettings>) => Promise<void>;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [imports, setImports] = useState<Import[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        { data: pData },
        { data: sData },
        { data: cData },
        { data: iData },
        { data: invData },
        { data: sSettData }
      ] = await Promise.all([
        supabase.from('products').select('*, suppliers(name)').order('created_at', { ascending: false }),
        supabase.from('suppliers').select('*').order('created_at', { ascending: false }),
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('imports').select('*, import_items(*)').order('created_at', { ascending: false }),
        supabase.from('invoices').select('*, invoice_items(*)').order('created_at', { ascending: false }),
        supabase.from('store_settings').select('*').single()
      ]);

      if (pData) setProducts(pData.map(p => ({
        ...p,
        importPrice: p.import_price,
        sellingPrice: p.selling_price,
        minStock: p.min_stock,
        supplierId: p.supplier_id,
        supplierName: p.suppliers?.name,
        createdAt: new Date(p.created_at)
      })));

      if (sData) setSuppliers(sData.map(s => ({
        ...s,
        createdAt: new Date(s.created_at)
      })));

      if (cData) setCustomers(cData.map(c => ({
        ...c,
        createdAt: new Date(c.created_at)
      })));

      if (iData) setImports(iData.map(i => ({
        ...i,
        supplierId: i.supplier_id,
        supplierName: i.supplier_name,
        totalAmount: i.total_amount,
        importDate: new Date(i.import_date),
        createdAt: new Date(i.created_at),
        items: i.import_items.map((item: any) => ({
          ...item,
          importId: item.import_id,
          productId: item.product_id,
          productCode: item.product_code,
          productName: item.product_name,
          unitPrice: item.unit_price
        }))
      })));

      if (invData) setInvoices(invData.map(inv => ({
        ...inv,
        customerId: inv.customer_id,
        customerName: inv.customer_name,
        customerPhone: inv.customer_phone,
        vatAmount: inv.vat_amount,
        shippingCost: inv.shipping_cost,
        totalAmount: inv.total_amount,
        paymentMethod: inv.payment_method,
        invoiceDate: new Date(inv.invoice_date),
        createdAt: new Date(inv.created_at),
        items: inv.invoice_items.map((item: any) => ({
          ...item,
          productCode: item.product_code,
          productName: item.product_name,
          unitPrice: item.unit_price
        }))
      })));

      if (sSettData) setSettings({
        ...sSettData,
        taxCode: sSettData.tax_code,
        bankAccount: sSettData.bank_account,
        bankName: sSettData.bank_name,
        defaultVat: sSettData.default_vat,
        logoUrl: sSettData.logo_url,
        updatedAt: new Date(sSettData.updated_at)
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats: InventoryStats = {
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + p.stock, 0),
    totalValue: products.reduce((sum, p) => sum + p.stock * p.importPrice, 0),
    lowStockCount: products.filter(p => p.stock < p.minStock).length,
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('products').insert([{
      code: product.code,
      name: product.name,
      unit: product.unit,
      category: product.category,
      import_price: product.importPrice,
      selling_price: product.sellingPrice,
      stock: product.stock,
      min_stock: product.minStock,
      supplier_id: product.supplierId
    }]).select('*, suppliers(name)').single();

    if (error) throw error;
    if (data) {
      const newProduct = {
        ...data,
        importPrice: data.import_price,
        sellingPrice: data.selling_price,
        minStock: data.min_stock,
        supplierId: data.supplier_id,
        supplierName: data.suppliers?.name,
        createdAt: new Date(data.created_at)
      };
      setProducts(prev => [newProduct, ...prev]);
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    const { data, error } = await supabase.from('products').update({
      code: product.code,
      name: product.name,
      unit: product.unit,
      category: product.category,
      import_price: product.importPrice,
      selling_price: product.sellingPrice,
      stock: product.stock,
      min_stock: product.minStock,
      supplier_id: product.supplierId
    }).eq('id', id).select('*, suppliers(name)').single();

    if (error) throw error;
    if (data) {
      const updatedProduct = {
        ...data,
        importPrice: data.import_price,
        sellingPrice: data.selling_price,
        minStock: data.min_stock,
        supplierId: data.supplier_id,
        supplierName: data.suppliers?.name,
        createdAt: new Date(data.created_at)
      };
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
    }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('suppliers').insert([{
      code: supplier.code,
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address
    }]).select().single();

    if (error) throw error;
    if (data) {
      const newSupplier = { ...data, createdAt: new Date(data.created_at) };
      setSuppliers(prev => [newSupplier, ...prev]);
    }
  };

  const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
    const { data, error } = await supabase.from('suppliers').update({
      code: supplier.code,
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address
    }).eq('id', id).select().single();

    if (error) throw error;
    if (data) {
      const updatedSupplier = { ...data, createdAt: new Date(data.created_at) };
      setSuppliers(prev => prev.map(s => s.id === id ? updatedSupplier : s));
    }
  };

  const deleteSupplier = async (id: string) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('customers').insert([{
      code: customer.code,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address
    }]).select().single();

    if (error) throw error;
    if (data) {
      const newCustomer = { ...data, createdAt: new Date(data.created_at) };
      setCustomers(prev => [newCustomer, ...prev]);
      return newCustomer;
    }
    return undefined;
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    const { data, error } = await supabase.from('customers').update({
      code: customer.code,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address
    }).eq('id', id).select().single();

    if (error) throw error;
    if (data) {
      const updatedCustomer = { ...data, createdAt: new Date(data.created_at) };
      setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
    }
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const addImport = async (importData: Omit<Import, 'id' | 'createdAt'>) => {
    const { data: impData, error: impError } = await supabase.from('imports').insert([{
      code: importData.code,
      supplier_id: importData.supplierId,
      supplier_name: importData.supplierName,
      total_amount: importData.totalAmount,
      import_date: importData.importDate,
      notes: importData.notes
    }]).select().single();

    if (impError) throw impError;

    if (impData) {
      const itemsToInsert = importData.items.map(item => ({
        import_id: impData.id,
        product_id: item.productId,
        product_code: item.productCode,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        amount: item.amount
      }));

      const { data: itemsData, error: itemsError } = await supabase.from('import_items').insert(itemsToInsert).select();
      if (itemsError) throw itemsError;

      // Update product stocks
      for (const item of importData.items) {
        setProducts(prev => prev.map(p =>
          p.id === item.productId
            ? { ...p, stock: p.stock + item.quantity }
            : p
        ));

        const product = products.find(p => p.id === item.productId);
        if (product) {
          await supabase.from('products')
            .update({ stock: product.stock + item.quantity })
            .eq('id', item.productId);
        }
      }

      const newImport = {
        ...impData,
        supplierId: impData.supplier_id,
        supplierName: impData.supplier_name,
        totalAmount: impData.total_amount,
        importDate: new Date(impData.import_date),
        createdAt: new Date(impData.created_at),
        items: itemsData.map((item: any) => ({
          ...item,
          importId: item.import_id,
          productId: item.product_id,
          productCode: item.product_code,
          productName: item.product_name,
          unitPrice: item.unit_price
        }))
      };
      setImports(prev => [newImport, ...prev]);
    }
  };

  const updateImport = async (id: string, importData: Partial<Import>) => {
    // 1. Get current import to calculate stock differences
    const oldImport = imports.find(i => i.id === id);
    if (!oldImport) throw new Error('Không tìm thấy phiếu nhập');

    // 2. Update the import header
    const { data: impData, error: impError } = await supabase.from('imports').update({
      supplier_id: importData.supplierId,
      supplier_name: importData.supplierName,
      total_amount: importData.totalAmount,
      import_date: importData.importDate,
      notes: importData.notes
    }).eq('id', id).select().single();

    if (impError) throw impError;

    // 3. Handle items if they are provided
    if (importData.items) {
      // 3a. Delete old items
      const { error: deleteError } = await supabase.from('import_items').delete().eq('import_id', id);
      if (deleteError) throw deleteError;

      // 3b. Insert new items
      const itemsToInsert = importData.items.map(item => ({
        import_id: id,
        product_id: item.productId,
        product_code: item.productCode,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        amount: item.amount
      }));

      const { data: itemsData, error: itemsError } = await supabase.from('import_items').insert(itemsToInsert).select();
      if (itemsError) throw itemsError;

      // 3c. Adjust product stocks
      // Create a map of changes
      const stockChanges: Record<string, number> = {};

      // Subtract old quantities
      oldImport.items.forEach(item => {
        stockChanges[item.productId] = (stockChanges[item.productId] || 0) - item.quantity;
      });

      // Add new quantities
      importData.items!.forEach(item => {
        stockChanges[item.productId] = (stockChanges[item.productId] || 0) + item.quantity;
      });

      // Apply changes
      for (const [productId, change] of Object.entries(stockChanges)) {
        if (change === 0) continue;

        setProducts(prev => prev.map(p =>
          p.id === productId ? { ...p, stock: p.stock + change } : p
        ));

        const product = products.find(p => p.id === productId);
        if (product) {
          await supabase.from('products')
            .update({ stock: product.stock + change })
            .eq('id', productId);
        }
      }

      const updatedImport = {
        ...impData,
        supplierId: impData.supplier_id,
        supplierName: impData.supplier_name,
        totalAmount: impData.total_amount,
        importDate: new Date(impData.import_date),
        createdAt: new Date(impData.created_at),
        items: itemsData.map((item: any) => ({
          ...item,
          importId: item.import_id,
          productId: item.product_id,
          productCode: item.product_code,
          productName: item.product_name,
          unitPrice: item.unit_price
        }))
      };
      setImports(prev => prev.map(i => i.id === id ? updatedImport : i));
    } else {
      // Just update header in state
      setImports(prev => prev.map(i => i.id === id ? { ...i, ...importData } : i));
    }
  };

  const deleteImport = async (id: string) => {
    const importToDelete = imports.find(i => i.id === id);
    if (!importToDelete) throw new Error('Không tìm thấy phiếu nhập');

    // 1. Revert product stocks
    for (const item of importToDelete.items) {
      setProducts(prev => prev.map(p =>
        p.id === item.productId ? { ...p, stock: p.stock - item.quantity } : p
      ));

      const product = products.find(p => p.id === item.productId);
      if (product) {
        await supabase.from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', item.productId);
      }
    }

    // 2. Delete from Supabase (Cascade delete should handle items if configured, but let's be explicit if not sure)
    // Actually, usually we set up cascade delete. But for safety:
    await supabase.from('import_items').delete().eq('import_id', id);
    const { error } = await supabase.from('imports').delete().eq('id', id);
    if (error) throw error;

    setImports(prev => prev.filter(i => i.id !== id));
  };

  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    const { data: invData, error: invError } = await supabase.from('invoices').insert([{
      code: invoice.code,
      customer_id: invoice.customerId,
      customer_name: invoice.customerName,
      customer_phone: invoice.customerPhone,
      subtotal: invoice.subtotal,
      vat: invoice.vat,
      vat_amount: invoice.vatAmount,
      shipping_cost: invoice.shippingCost,
      discount: invoice.discount,
      total_amount: invoice.totalAmount,
      payment_method: invoice.paymentMethod,
      status: invoice.status,
      notes: invoice.notes,
      invoice_date: invoice.invoiceDate
    }]).select().single();

    if (invError) throw invError;

    if (invData) {
      const itemsToInsert = invoice.items.map(item => ({
        invoice_id: invData.id,
        product_id: item.productId,
        product_code: item.productCode,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: item.discount,
        amount: item.amount
      }));

      const { data: itemsData, error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert).select();
      if (itemsError) throw itemsError;

      // Update product stocks
      for (const item of invoice.items) {
        setProducts(prev => prev.map(p =>
          p.id === item.productId
            ? { ...p, stock: p.stock - item.quantity }
            : p
        ));

        const product = products.find(p => p.id === item.productId);
        if (product) {
          await supabase.from('products')
            .update({ stock: product.stock - item.quantity })
            .eq('id', item.productId);
        }
      }

      const newInvoice = {
        ...invData,
        customerId: invData.customer_id,
        customerName: invData.customer_name,
        customerPhone: invData.customer_phone,
        vatAmount: invData.vat_amount,
        shippingCost: invData.shipping_cost,
        totalAmount: invData.total_amount,
        paymentMethod: invData.payment_method,
        invoiceDate: new Date(invData.invoice_date),
        createdAt: new Date(invData.created_at),
        items: itemsData.map((item: any) => ({
          ...item,
          productCode: item.product_code,
          productName: item.product_name,
          unitPrice: item.unit_price
        }))
      };
      setInvoices(prev => [newInvoice, ...prev]);
      return newInvoice;
    }
    throw new Error('Failed to create invoice');
  };

  const updateInvoiceStatus = async (id: string, status: Invoice['status']) => {
    const { error } = await supabase.from('invoices').update({ status }).eq('id', id);
    if (error) throw error;
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    if (!settings) return;

    const { data: updatedData, error } = await supabase.from('store_settings').update({
      name: newSettings.name,
      phone: newSettings.phone,
      tax_code: newSettings.taxCode,
      address: newSettings.address,
      bank_account: newSettings.bankAccount,
      bank_name: newSettings.bankName,
      facebook: newSettings.facebook,
      zalo: newSettings.zalo,
      website: newSettings.website,
      default_vat: newSettings.defaultVat,
      logo_url: newSettings.logoUrl,
      updated_at: new Date()
    }).eq('id', settings.id).select().single();

    if (error) throw error;
    if (updatedData) {
      setSettings({
        ...updatedData,
        taxCode: updatedData.tax_code,
        bankAccount: updatedData.bank_account,
        bankName: updatedData.bank_name,
        defaultVat: updatedData.default_vat,
        logoUrl: updatedData.logo_url,
        updatedAt: new Date(updatedData.updated_at)
      });
    }
  };

  return (
    <InventoryContext.Provider value={{
      products,
      suppliers,
      imports,
      invoices,
      customers,
      settings,
      stats,
      addProduct,
      updateProduct,
      deleteProduct,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addImport,
      updateImport,
      deleteImport,
      addInvoice,
      updateInvoiceStatus,
      updateSettings,
      isLoading,
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
