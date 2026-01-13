import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const DataMigration: React.FC = () => {
    const [isMigrating, setIsMigrating] = useState(false);

    const migrateData = async () => {
        setIsMigrating(true);
        try {
            // 1. Migrate Products
            const productsData = localStorage.getItem('inventory_products');
            if (productsData) {
                const products = JSON.parse(productsData);
                const productsToInsert = products.map((p: any) => ({
                    code: p.code,
                    name: p.name,
                    unit: p.unit,
                    category: p.category,
                    import_price: p.importPrice,
                    selling_price: p.sellingPrice,
                    stock: p.stock,
                    min_stock: p.minStock,
                    created_at: p.createdAt
                }));

                const { error: pError } = await supabase.from('products').upsert(productsToInsert, { onConflict: 'code' });
                if (pError) throw pError;
            }

            // 2. Migrate Suppliers
            const suppliersData = localStorage.getItem('inventory_suppliers');
            if (suppliersData) {
                const suppliers = JSON.parse(suppliersData);
                const suppliersToInsert = suppliers.map((s: any) => ({
                    code: s.code,
                    name: s.name,
                    phone: s.phone,
                    email: s.email,
                    address: s.address,
                    created_at: s.createdAt
                }));

                const { error: sError } = await supabase.from('suppliers').upsert(suppliersToInsert, { onConflict: 'code' });
                if (sError) throw sError;
            }

            // 3. Migrate Import Records
            const importsData = localStorage.getItem('inventory_imports');
            if (importsData) {
                const imports = JSON.parse(importsData);
                const importsToInsert = imports.map((i: any) => ({
                    product_code: i.productCode,
                    product_name: i.productName,
                    quantity: i.quantity,
                    unit_price: i.unitPrice,
                    total_amount: i.totalAmount,
                    supplier_name: i.supplierName,
                    import_date: i.importDate,
                    notes: i.notes,
                    created_at: i.createdAt
                }));

                const { error: iError } = await supabase.from('import_records').insert(importsToInsert);
                if (iError) throw iError;
            }

            // 4. Migrate Invoices
            const invoicesData = localStorage.getItem('inventory_invoices');
            if (invoicesData) {
                const invoices = JSON.parse(invoicesData);
                for (const inv of invoices) {
                    const { data: invData, error: invError } = await supabase.from('invoices').insert([{
                        code: inv.code,
                        customer_name: inv.customerName,
                        customer_phone: inv.customerPhone,
                        subtotal: inv.subtotal,
                        vat: inv.vat,
                        vat_amount: inv.vatAmount,
                        shipping_cost: inv.shippingCost,
                        discount: inv.discount,
                        total_amount: inv.totalAmount,
                        payment_method: inv.paymentMethod,
                        status: inv.status,
                        notes: inv.notes,
                        invoice_date: inv.invoiceDate,
                        created_at: inv.createdAt
                    }]).select().single();

                    if (invError) throw invError;

                    if (inv.items && invData) {
                        const itemsToInsert = inv.items.map((item: any) => ({
                            invoice_id: invData.id,
                            product_code: item.productCode,
                            product_name: item.productName,
                            quantity: item.quantity,
                            unit_price: item.unitPrice,
                            discount: item.discount,
                            amount: item.amount
                        }));
                        const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);
                        if (itemsError) throw itemsError;
                    }
                }
            }

            toast.success('Dữ liệu đã được lưu lên Supabase thành công!');
        } catch (error: any) {
            console.error('Migration error:', error);
            toast.error('Lỗi khi lưu dữ liệu: ' + error.message);
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-2">Chuyển đổi dữ liệu</h3>
            <p className="text-sm text-muted-foreground mb-4">
                Lưu dữ liệu từ trình duyệt của bạn lên hệ thống lưu trữ đám mây Supabase.
            </p>
            <Button
                onClick={migrateData}
                disabled={isMigrating}
            >
                {isMigrating ? 'Đang lưu...' : 'Lưu lên Supabase'}
            </Button>
        </div>
    );
};
