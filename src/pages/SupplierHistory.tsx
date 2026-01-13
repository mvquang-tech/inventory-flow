import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Eye, History, Truck, Calendar, ShoppingCart } from 'lucide-react';
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
import { Import as ImportData } from '@/types/inventory';

const SupplierHistory: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { suppliers, imports } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingTicket, setViewingTicket] = useState<ImportData | null>(null);
    const [isTicketDetailOpen, setIsTicketDetailOpen] = useState(false);

    const supplier = suppliers.find(s => s.id === id);

    if (!supplier) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <Truck className="w-16 h-16 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold">Không tìm thấy nhà cung cấp</h2>
                    <Button variant="link" onClick={() => navigate('/suppliers')} className="mt-2">
                        Quay lại danh sách
                    </Button>
                </div>
            </MainLayout>
        );
    }

    const supplierImports = imports.filter(i => i.supplierId === id);
    const filteredImports = supplierImports.filter(
        i => i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.notes && i.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleViewTicket = (ticket: ImportData) => {
        setViewingTicket(ticket);
        setIsTicketDetailOpen(true);
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
                            onClick={() => navigate('/suppliers')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại danh sách
                        </Button>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <History className="w-8 h-8 text-primary" />
                            Lịch sử nhập hàng: {supplier.name}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Xem tất cả các phiếu nhập hàng từ {supplier.name} ({supplier.code})
                        </p>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số phiếu</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{supplierImports.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng giá trị nhập</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">
                                {formatCurrency(supplierImports.reduce((sum, i) => sum + i.totalAmount, 0))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Nhập gần nhất</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-semibold">
                                {supplierImports.length > 0 ? formatDate(supplierImports[0].importDate) : '-'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search & Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Danh sách phiếu nhập</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm mã phiếu, ghi chú..."
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
                                        <TableHead>Ngày nhập</TableHead>
                                        <TableHead>Mã phiếu</TableHead>
                                        <TableHead className="text-right">Số mặt hàng</TableHead>
                                        <TableHead className="text-right">Tổng tiền</TableHead>
                                        <TableHead>Ghi chú</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredImports.map((imp) => (
                                        <TableRow key={imp.id}>
                                            <TableCell className="text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(imp.importDate)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{imp.code}</TableCell>
                                            <TableCell className="text-right">{imp.items.length}</TableCell>
                                            <TableCell className="text-right font-semibold">{formatCurrency(imp.totalAmount)}</TableCell>
                                            <TableCell className="max-w-[200px] truncate">{imp.notes || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => handleViewTicket(imp)}
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Chi tiết
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredImports.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                                {searchTerm ? 'Không tìm thấy phiếu nào khớp với từ khóa' : 'Chưa có lịch sử nhập hàng cho nhà cung cấp này'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Ticket Detail Dialog */}
            <Dialog open={isTicketDetailOpen} onOpenChange={setIsTicketDetailOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            Chi tiết phiếu nhập: {viewingTicket?.code}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-muted/30 rounded-lg">
                            <div>
                                <p className="text-muted-foreground">Ngày nhập</p>
                                <p className="font-semibold">{viewingTicket && formatDate(viewingTicket.importDate)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Nhà cung cấp</p>
                                <p className="font-semibold">{viewingTicket?.supplierName}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-muted-foreground">Ghi chú</p>
                                <p>{viewingTicket?.notes || 'Không có ghi chú'}</p>
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
                                    {viewingTicket?.items.map((item, index) => (
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

                        <div className="flex justify-between items-center bg-primary p-4 rounded-lg text-primary-foreground">
                            <span className="font-bold">Tổng cộng:</span>
                            <span className="text-2xl font-bold">
                                {viewingTicket && formatCurrency(viewingTicket.totalAmount)}
                            </span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
};

export default SupplierHistory;
