import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Eye, History, Users, Calendar, FileText, ShoppingBag } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useInventory } from '@/contexts/InventoryContext';
import { formatCurrency, formatDate } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Invoice } from '@/types/inventory';

const CustomerHistory: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { customers, invoices } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
    const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false);

    const customer = customers.find(c => c.id === id);

    if (!customer) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <Users className="w-16 h-16 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold">Không tìm thấy khách hàng</h2>
                    <Button variant="link" onClick={() => navigate('/customers')} className="mt-2">
                        Quay lại danh sách
                    </Button>
                </div>
            </MainLayout>
        );
    }

    const customerInvoices = invoices.filter(i => i.customerId === id);
    const filteredInvoices = customerInvoices.filter(
        i => i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.notes && i.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleViewInvoice = (invoice: Invoice) => {
        setViewingInvoice(invoice);
        setIsInvoiceDetailOpen(true);
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Button
                            variant="ghost"
                            className="pl-0 hover:bg-transparent -ml-2 mb-2"
                            onClick={() => navigate('/customers')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại danh sách
                        </Button>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <History className="w-8 h-8 text-primary" />
                            Lịch sử mua hàng: {customer.name}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Xem tất cả các hóa đơn từ khách hàng {customer.name} ({customer.code})
                        </p>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số đơn hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{customerInvoices.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng doanh thu</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">
                                {formatCurrency(customerInvoices.reduce((sum, i) => sum + i.totalAmount, 0))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Mua gần nhất</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-semibold">
                                {customerInvoices.length > 0 ? formatDate(customerInvoices[0].invoiceDate) : '-'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search & Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Danh sách hóa đơn</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm mã hóa đơn, ghi chú..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Ngày đơn hàng</TableHead>
                                        <TableHead>Mã hóa đơn</TableHead>
                                        <TableHead className="text-right">Số mặt hàng</TableHead>
                                        <TableHead className="text-right">Tổng tiền</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInvoices.map((inv) => (
                                        <TableRow key={inv.id}>
                                            <TableCell className="text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(inv.invoiceDate)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{inv.code}</TableCell>
                                            <TableCell className="text-right">{inv.items.length}</TableCell>
                                            <TableCell className="text-right font-semibold">{formatCurrency(inv.totalAmount)}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        inv.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {inv.status === 'completed' ? 'Hoàn thành' :
                                                        inv.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => handleViewInvoice(inv)}
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Chi tiết
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredInvoices.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                                {searchTerm ? 'Không tìm thấy hóa đơn nào khớp với từ khóa' : 'Chưa có lịch sử mua hàng cho khách hàng này'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Invoice Detail Dialog */}
            <Dialog open={isInvoiceDetailOpen} onOpenChange={setIsInvoiceDetailOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Chi tiết hóa đơn: {viewingInvoice?.code}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-muted/30 rounded-lg">
                            <div>
                                <p className="text-muted-foreground">Ngày đơn hàng</p>
                                <p className="font-semibold">{viewingInvoice && formatDate(viewingInvoice.invoiceDate)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Khách hàng</p>
                                <p className="font-semibold">{viewingInvoice?.customerName}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Số điện thoại</p>
                                <p className="font-semibold">{viewingInvoice?.customerPhone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">PT Thanh toán</p>
                                <p className="font-semibold">{viewingInvoice?.paymentMethod}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-muted-foreground">Ghi chú</p>
                                <p>{viewingInvoice?.notes || 'Không có ghi chú'}</p>
                            </div>
                        </div>

                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 h-10">
                                        <TableHead>Sản phẩm</TableHead>
                                        <TableHead className="text-right">Số lượng</TableHead>
                                        <TableHead className="text-right">Đơn giá</TableHead>
                                        <TableHead className="text-right">Thành tiền</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {viewingInvoice?.items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <p className="font-medium">{item.productName}</p>
                                                <p className="text-xs text-muted-foreground">{item.productCode}</p>
                                            </TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                            <TableCell className="text-right font-semibold">{formatCurrency(item.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="space-y-2 pt-2 border-t text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tạm tính:</span>
                                <span>{viewingInvoice && formatCurrency(viewingInvoice.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Thuế VAT ({viewingInvoice?.vat}%):</span>
                                <span>{viewingInvoice && formatCurrency(viewingInvoice.vatAmount)}</span>
                            </div>
                            {viewingInvoice?.shippingCost && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phí vận chuyển:</span>
                                    <span>{formatCurrency(viewingInvoice.shippingCost)}</span>
                                </div>
                            )}
                            {viewingInvoice?.discount && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Giảm giá:</span>
                                    <span className="text-red-500">-{formatCurrency(viewingInvoice.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center bg-primary p-4 rounded-lg text-primary-foreground mt-2">
                                <span className="font-bold">Tổng cộng:</span>
                                <span className="text-2xl font-bold">
                                    {viewingInvoice && formatCurrency(viewingInvoice.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
};

export default CustomerHistory;
