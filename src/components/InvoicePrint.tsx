import React, { forwardRef } from 'react';
import { Invoice, StoreSettings } from '@/types/inventory';
import { formatCurrency, formatDate } from '@/utils/format';

interface InvoicePrintProps {
    invoice: Invoice;
    settings: StoreSettings | null;
}

const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(({ invoice, settings }, ref) => {
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
        updatedAt: new Date()
    };

    return (
        <div ref={ref} className="print-content text-black bg-white p-8 font-sans">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        {storeSettings.logoUrl && (
                            <img
                                src={storeSettings.logoUrl}
                                alt="Store Logo"
                                className="w-20 h-20 object-contain"
                            />
                        )}
                        <h1 className="text-2xl font-bold uppercase tracking-wider">{storeSettings.name}</h1>
                    </div>

                    <div className="text-sm mt-1 space-y-0.5">
                        <p><span className="font-semibold">Địa chỉ:</span> {storeSettings.address}</p>
                        <p><span className="font-semibold">Điện thoại:</span> {storeSettings.phone}</p>
                        {storeSettings.taxCode && <p><span className="font-semibold">MST:</span> {storeSettings.taxCode}</p>}
                        {storeSettings.website && <p><span className="font-semibold">Website:</span> {storeSettings.website}</p>}
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-black text-gray-800">HÓA ĐƠN</h2>
                    <p className="text-lg font-bold mt-1">Số: {invoice.code}</p>
                    <p className="text-sm text-gray-600 italic">Ngày: {formatDate(invoice.invoiceDate)}</p>
                </div>
            </div>

            {/* Customer Info */}
            <div className="mb-8 grid grid-cols-2 gap-8">
                <div className="border p-4 rounded-sm">
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-2 border-b pb-1">Thông tin khách hàng</h3>
                    <p className="font-bold text-lg">{invoice.customerName}</p>
                    <p className="text-sm">SĐT: {invoice.customerPhone || 'N/A'}</p>
                </div>
                <div className="border p-4 rounded-sm">
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-2 border-b pb-1">Thanh toán</h3>
                    <p className="text-sm"><span className="font-semibold">Hình thức:</span> {invoice.paymentMethod}</p>
                    <p className="text-sm text-blue-800 font-medium">Trạng thái: {
                        invoice.status === 'completed' ? 'Đã thanh toán' :
                            invoice.status === 'pending' ? 'Chưa thanh toán' : 'Đã hủy'
                    }</p>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse mb-8">
                <thead>
                    <tr className="bg-gray-100 border-y-2 border-black">
                        <th className="py-2 px-3 text-left font-bold text-sm uppercase">STT</th>
                        <th className="py-2 px-3 text-left font-bold text-sm uppercase">Sản phẩm</th>
                        <th className="py-2 px-3 text-right font-bold text-sm uppercase">Đơn giá</th>
                        <th className="py-2 px-3 text-center font-bold text-sm uppercase">SL</th>
                        <th className="py-2 px-3 text-right font-bold text-sm uppercase">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200">
                            <td className="py-3 px-3 text-sm">{index + 1}</td>
                            <td className="py-3 px-3">
                                <p className="font-bold text-sm">{item.productName}</p>
                                <p className="text-xs text-gray-500">{item.productCode}</p>
                            </td>
                            <td className="py-3 px-3 text-right text-sm">{formatCurrency(item.unitPrice)}</td>
                            <td className="py-3 px-3 text-center text-sm">{item.quantity}</td>
                            <td className="py-3 px-3 text-right font-semibold text-sm">{formatCurrency(item.amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-12">
                <div className="w-80 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tạm tính:</span>
                        <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Thuế VAT ({invoice.vat}%):</span>
                        <span>{formatCurrency(invoice.vatAmount)}</span>
                    </div>
                    {invoice.shippingCost > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Phí vận chuyển:</span>
                            <span>{formatCurrency(invoice.shippingCost)}</span>
                        </div>
                    )}
                    {invoice.discount > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                            <span>Giảm giá:</span>
                            <span>-{formatCurrency(invoice.discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between border-t-2 border-black pt-2 mt-2">
                        <span className="font-black text-lg uppercase">Tổng cộng:</span>
                        <span className="font-black text-xl text-primary">{formatCurrency(invoice.totalAmount)}</span>
                    </div>
                </div>
            </div>

            {/* Footer / Bank Info */}
            <div className="grid grid-cols-2 gap-12 text-sm mt-auto border-t pt-8">
                <div>
                    {storeSettings.bankName && (
                        <div className="border p-4 rounded bg-gray-50 inline-block min-w-full">
                            <h4 className="font-bold text-xs uppercase mb-2 text-gray-600">Thông tin chuyển khoản</h4>
                            <p><span className="font-semibold">Ngân hàng:</span> {storeSettings.bankName}</p>
                            <p><span className="font-semibold">Số tài khoản:</span> {storeSettings.bankAccount}</p>
                            <p><span className="font-semibold">Chủ tài khoản:</span> {storeSettings.name}</p>
                        </div>
                    )}
                    <div className="mt-4 text-xs text-gray-500 italic">
                        * Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của chúng tôi!
                    </div>
                </div>
                <div className="flex justify-between text-center px-4">
                    <div>
                        <p className="font-bold mb-16 uppercase text-xs">Người mua hàng</p>
                        <p className="text-gray-400 text-xs italic">(Ký, ghi rõ họ tên)</p>
                    </div>
                    <div>
                        <p className="font-bold mb-16 uppercase text-xs">Người bán hàng</p>
                        <p className="text-gray-400 text-xs italic">(Ký, ghi rõ họ tên)</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

InvoicePrint.displayName = 'InvoicePrint';

export default InvoicePrint;
