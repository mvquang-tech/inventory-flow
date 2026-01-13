import React, { forwardRef } from 'react';
import { Invoice, StoreSettings } from '@/types/inventory';
import { formatCurrency, formatDate } from '@/utils/format';

interface InvoicePOSPrintProps {
    invoice: Invoice;
    settings?: StoreSettings;
}

const InvoicePOSPrint = forwardRef<HTMLDivElement, InvoicePOSPrintProps>(({ invoice, settings }, ref) => {
    // Provide default settings if not available
    const storeSettings: StoreSettings = settings || {
        id: '',
        name: 'Cửa hàng',
        phone: '',
        address: '',
        taxCode: '',
        bankAccount: '',
        bankName: '',
        facebook: '',
        zalo: '',
        website: '',
        defaultVat: 10,
        logoUrl: '',
        updatedAt: new Date()
    };

    return (
        <div ref={ref} className="pos-print-content bg-white p-2 font-mono text-xs" style={{ width: '58mm', padding: '5px' }}>
            {/* Header */}
            <div className="text-center border-b border-black pb-2 mb-2">
                {storeSettings.logoUrl && (
                    <div className="flex justify-center mb-1">
                        <img
                            src={storeSettings.logoUrl}
                            alt="Store Logo"
                            className="w-12 h-12 object-contain"
                        />
                    </div>
                )}
                <h1 className="font-bold uppercase text-sm mb-1">{storeSettings.name}</h1>
                <p className="text-[10px]">{storeSettings.address}</p>
                <p className="text-[10px]">SĐT: {storeSettings.phone}</p>
            </div>

            {/* Invoice Info */}
            <div className="text-[10px] mb-2">
                <p>HĐ: {invoice.code}</p>
                <p>Ngày: {formatDate(invoice.invoiceDate)}</p>
                <p>Khách: {invoice.customerName}</p>
            </div>

            {/* Items */}
            <table className="w-full text-[10px] border-collapse mb-2">
                <thead>
                    <tr className="border-b border-black border-dashed">
                        <th className="text-left py-1">SP</th>
                        <th className="text-center py-1 w-6">SL</th>
                        <th className="text-right py-1">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-300 border-dashed">
                            <td className="py-1 pr-1 truncate max-w-[25mm]">{item.productName}</td>
                            <td className="text-center py-1 font-bold">{item.quantity}</td>
                            <td className="text-right py-1">{formatCurrency(item.amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="text-[10px] space-y-1 border-t border-black pt-2 mb-2">
                <div className="flex justify-between">
                    <span>Tổng tiền:</span>
                    <span className="font-bold">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.shippingCost > 0 && (
                    <div className="flex justify-between">
                        <span>Phí ship:</span>
                        <span>{formatCurrency(invoice.shippingCost)}</span>
                    </div>
                )}
                {invoice.discount > 0 && (
                    <div className="flex justify-between">
                        <span>Giảm giá:</span>
                        <span>-{formatCurrency(invoice.discount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t border-dashed border-black pt-1 mt-1">
                    <span>THANH TOÁN:</span>
                    <span>{formatCurrency(invoice.totalAmount)}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[9px] mt-4 italic">
                <p>Cảm ơn quý khách!</p>
                <p>Hẹn gặp lại</p>
            </div>
            {storeSettings.website && (
                <div className="text-center text-[9px] mt-1">
                    {storeSettings.website}
                </div>
            )}
        </div>
    );
});

InvoicePOSPrint.displayName = 'InvoicePOSPrint';

export default InvoicePOSPrint;
