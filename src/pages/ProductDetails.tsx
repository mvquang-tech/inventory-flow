import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useInventory } from '@/contexts/InventoryContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime, formatNumber } from '@/utils/format';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, imports, invoices, isLoading } = useInventory();

  if (isLoading) {
    return (
      <MainLayout>
        <div>Đang tải...</div>
      </MainLayout>
    );
  }

  const product = products.find(p => p.id === id);
  if (!product) {
    return (
      <MainLayout>
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm không tồn tại</CardTitle>
          </CardHeader>
          <CardContent>
            <div>Không tìm thấy sản phẩm.</div>
            <div className="mt-4">
              <Button variant="outline" onClick={() => navigate(-1)}>Quay lại</Button>
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  // Import (stock in) history for this product
  const importHistory = imports
    .map(imp => {
      const item = imp.items.find((it: any) => it.productId === product.id);
      if (!item) return null;
      return {
        importId: imp.id,
        code: imp.code,
        date: imp.importDate || imp.createdAt,
        supplierName: imp.supplierName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
      };
    })
    .filter(Boolean) as Array<any>;

  // Sales (stock out) history for this product
  const salesHistory = invoices
    .map(inv => {
      const item = inv.items.find((it: any) => it.productId === product.id);
      if (!item) return null;
      return {
        invoiceId: inv.id,
        code: inv.code,
        date: inv.invoiceDate || inv.createdAt,
        customerName: inv.customerName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
        status: inv.status,
      };
    })
    .filter(Boolean) as Array<any>;

  const totalImported = importHistory.reduce((s, it) => s + it.quantity, 0);
  const totalSold = salesHistory.reduce((s, it) => s + it.quantity, 0);
  const totalImportAmount = importHistory.reduce((s, it) => s + (it.amount || 0), 0);
  const totalSoldAmount = salesHistory.reduce((s, it) => s + (it.amount || 0), 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} title="Quay lại">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{product.code} - {product.name}</h1>
              <div className="text-sm text-muted-foreground">Danh mục: {product.category || '-'} • Nhà cung cấp: {product.supplierName || '-'}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Tồn kho hiện tại</div>
            <div className="text-lg font-bold">{formatNumber(product.stock)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><strong>Mã:</strong> {product.code}</div>
                <div><strong>Tên:</strong> {product.name}</div>
                <div><strong>Đơn vị:</strong> {product.unit}</div>
                <div><strong>Danh mục:</strong> {product.category || '-'}</div>
                <div><strong>Nhà cung cấp:</strong> {product.supplierName || '-'}</div>
                <div><strong>Giá nhập:</strong> {formatCurrency(product.importPrice)}</div>
                <div><strong>Giá bán:</strong> {formatCurrency(product.sellingPrice)}</div>
                <div><strong>Tồn kho tối thiểu:</strong> {formatNumber(product.minStock)}</div>
                <div><strong>Ngày tạo:</strong> {formatDateTime(product.createdAt)}</div>
                <div className="pt-2 border-t mt-2 space-y-1">
                  <div className="text-sm text-muted-foreground">Tổng nhập: <strong>{formatNumber(totalImported)}</strong> — <strong>{formatCurrency(totalImportAmount)}</strong></div>
                  <div className="text-sm text-muted-foreground">Tổng bán: <strong>{formatNumber(totalSold)}</strong> — <strong>{formatCurrency(totalSoldAmount)}</strong></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử nhập hàng</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="table-header">
                      <TableHead>Mã phiếu</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Nhà cung cấp</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importHistory.length ? importHistory.map(item => (
                      <TableRow key={item.importId}>
                        <TableCell className="font-medium">{item.code}</TableCell>
                        <TableCell>{formatDateTime(item.date)}</TableCell>
                        <TableCell>{item.supplierName || '-'}</TableCell>
                        <TableCell className="text-right">{formatNumber(item.quantity)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Chưa có lịch sử nhập hàng</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lịch sử bán hàng</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="table-header">
                      <TableHead>Mã hóa đơn</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                      <TableHead className="text-center">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesHistory.length ? salesHistory.map(item => (
                      <TableRow key={item.invoiceId}>
                        <TableCell className="font-medium">{item.code}</TableCell>
                        <TableCell>{formatDateTime(item.date)}</TableCell>
                        <TableCell>{item.customerName || '-'}</TableCell>
                        <TableCell className="text-right">{formatNumber(item.quantity)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        <TableCell className="text-center">{item.status}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">Chưa có lịch sử bán hàng</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetails;
