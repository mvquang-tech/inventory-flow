import React, { useState, useRef } from 'react';
import { Search, FileText, Eye, CheckCircle, XCircle, Clock, Printer, Download, ScrollText } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useInventory } from '@/contexts/InventoryContext';
import InvoicePOSPrint from '@/components/InvoicePOSPrint';
import InvoicePrint from '@/components/InvoicePrint';
import { formatCurrency, formatDate } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Invoice } from '@/types/inventory';

const statusConfig = {
  pending: { label: 'Chờ xử lý', icon: Clock, color: 'bg-warning/10 text-warning' },
  completed: { label: 'Hoàn thành', icon: CheckCircle, color: 'bg-success/10 text-success' },
  cancelled: { label: 'Đã hủy', icon: XCircle, color: 'bg-destructive/10 text-destructive' },
};

const Invoices: React.FC = () => {
  const { invoices, updateInvoiceStatus, settings } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);
  const [posPrintingInvoice, setPosPrintingInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter(
    inv => inv.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = invoices
    .filter(inv => inv.status === 'completed')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const handlePrint = (invoice: Invoice) => {
    setPrintingInvoice(invoice);
    // Use setTimeout to ensure the printing content is rendered before window.print()
    setTimeout(() => {
      window.print();
      setPrintingInvoice(null);
    }, 100);
  };

  const handleExportPDF = async (invoice: Invoice) => {
    setPrintingInvoice(invoice);

    // Wait for the component to render
    setTimeout(async () => {
      const element = document.querySelector('.print-content') as HTMLElement | null;
      if (element) {
        const html2pdf = (await import('html2pdf.js')).default;
        const opt = {
          margin: 10,
          filename: `HoaDon_${invoice.code}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };

        // Generate PDF and open in new browser tab
        const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      }
      setPrintingInvoice(null);
    }, 200);
  };

  const handleExportPOS = async (invoice: Invoice) => {
    setPosPrintingInvoice(invoice);

    setTimeout(async () => {
      const element = document.querySelector('.pos-print-content') as HTMLElement | null;
      if (element) {
        const html2pdf = (await import('html2pdf.js')).default;
        const opt = {
          margin: 0,
          filename: `HoaDon_POS_${invoice.code}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, scrollY: 0, windowWidth: 350 },
          jsPDF: { unit: 'mm' as const, format: [58, 200] as [number, number], orientation: 'portrait' as const }
        };

        const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      }
      setPosPrintingInvoice(null);
    }, 200);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hóa đơn</h1>
          <p className="text-muted-foreground mt-1">Quản lý danh sách hóa đơn bán hàng</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng hóa đơn</p>
                  <p className="text-2xl font-bold">{invoices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
                  <p className="text-2xl font-bold">{invoices.filter(i => i.status === 'completed').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã hóa đơn hoặc tên khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Mã HĐ</TableHead>
                  <TableHead>Ngày lập</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const status = statusConfig[invoice.status];
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={invoice.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{invoice.code}</TableCell>
                      <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>{invoice.customerPhone || '-'}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{invoice.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </div>
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          onClick={() => handleExportPOS(invoice)}
                          title="Xuất Bill POS"
                        >
                          <ScrollText className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleExportPDF(invoice)}
                          title="Xuất PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handlePrint(invoice)}
                          title="In hóa đơn"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setSelectedInvoice(invoice)}
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Không có hóa đơn nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Invoice Detail Dialog */}
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle>Chi tiết hóa đơn {selectedInvoice?.code}</DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  onClick={() => selectedInvoice && handleExportPOS(selectedInvoice)}
                >
                  <ScrollText className="w-4 h-4 mr-2" />
                  Bill POS
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                <Button
                  variant="outline"
                  size="sm"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
                  onClick={() => selectedInvoice && handleExportPOS(selectedInvoice)}
                >
                  <ScrollText className="w-4 h-4 mr-2" />
                  Bill POS
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => selectedInvoice && handleExportPDF(selectedInvoice)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Xuất PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedInvoice && handlePrint(selectedInvoice)}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  In hóa đơn
                </Button>
              </div>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Khách hàng</p>
                    <p className="font-medium">{selectedInvoice.customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium">{selectedInvoice.customerPhone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ngày lập</p>
                    <p className="font-medium">{formatDate(selectedInvoice.invoiceDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phương thức thanh toán</p>
                    <p className="font-medium">{selectedInvoice.paymentMethod}</p>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="table-header">
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead className="text-right">Đơn giá</TableHead>
                        <TableHead className="text-center">SL</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">{item.productCode}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT ({selectedInvoice.vat}%)</span>
                    <span>{formatCurrency(selectedInvoice.vatAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span>{formatCurrency(selectedInvoice.shippingCost)}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giảm giá</span>
                      <span className="text-destructive">-{formatCurrency(selectedInvoice.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-primary">{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ghi chú</p>
                    <p className="text-sm">{selectedInvoice.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Printing visible container (only when printingInvoice is set) */}
      {printingInvoice && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100%', zIndex: -9999 }}>
          <InvoicePrint invoice={printingInvoice} settings={settings} />
        </div>
      )}

      {posPrintingInvoice && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '58mm', zIndex: -9999 }}>
          <InvoicePOSPrint invoice={posPrintingInvoice} settings={settings} />
        </div>
      )}
    </MainLayout>
  );
};

export default Invoices;
