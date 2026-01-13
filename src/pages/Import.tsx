import React, { useState } from 'react';
import { Plus, Search, Package, Calendar } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useInventory } from '@/contexts/InventoryContext';
import { formatCurrency, formatDate, generateCode } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const Import: React.FC = () => {
  const { products, suppliers, importRecords, addImportRecord } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    supplierId: '',
    quantity: 1,
    unitPrice: 0,
    importDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const filteredRecords = importRecords.filter(
    r => r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         r.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
         r.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProduct = products.find(p => p.id === formData.productId);
  const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setFormData({
      ...formData,
      productId,
      unitPrice: product?.importPrice || 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }
    if (!formData.supplierId) {
      toast.error('Vui lòng chọn nhà cung cấp');
      return;
    }
    if (formData.quantity <= 0) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    const product = products.find(p => p.id === formData.productId)!;
    const supplier = suppliers.find(s => s.id === formData.supplierId)!;

    addImportRecord({
      productId: formData.productId,
      productCode: product.code,
      productName: product.name,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      totalAmount: formData.quantity * formData.unitPrice,
      supplierId: formData.supplierId,
      supplierName: supplier.name,
      importDate: new Date(formData.importDate),
      notes: formData.notes,
    });

    toast.success('Nhập hàng thành công');
    setIsDialogOpen(false);
    setFormData({
      productId: '',
      supplierId: '',
      quantity: 1,
      unitPrice: 0,
      importDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const totalAmount = formData.quantity * formData.unitPrice;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nhập hàng</h1>
            <p className="text-muted-foreground mt-1">Quản lý phiếu nhập hàng từ nhà cung cấp</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Tạo phiếu nhập
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo phiếu nhập hàng mới</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="input-label">Sản phẩm</Label>
                    <Select value={formData.productId} onValueChange={handleProductChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn sản phẩm" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.code} - {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="input-label">Nhà cung cấp</Label>
                    <Select value={formData.supplierId} onValueChange={(v) => setFormData({ ...formData, supplierId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhà cung cấp" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.code} - {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="input-label">Số lượng</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="input-label">Đơn giá nhập</Label>
                    <Input
                      type="number"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="input-label">Ngày nhập</Label>
                    <Input
                      type="date"
                      value={formData.importDate}
                      onChange={(e) => setFormData({ ...formData, importDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="input-label">Thành tiền</Label>
                    <Input
                      value={formatCurrency(totalAmount)}
                      disabled
                      className="bg-muted font-semibold"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="input-label">Ghi chú</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Ghi chú thêm..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">
                    Tạo phiếu nhập
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng phiếu nhập</p>
                  <p className="text-2xl font-bold">{importRecords.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <Calendar className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng giá trị nhập</p>
                  <p className="text-2xl font-bold">{formatCurrency(importRecords.reduce((sum, r) => sum + r.totalAmount, 0))}</p>
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
                placeholder="Tìm kiếm theo sản phẩm hoặc nhà cung cấp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Import Records Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Ngày nhập</TableHead>
                  <TableHead>Mã SP</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                  <TableHead>Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/50">
                    <TableCell>{formatDate(record.importDate)}</TableCell>
                    <TableCell className="font-medium">{record.productCode}</TableCell>
                    <TableCell>{record.productName}</TableCell>
                    <TableCell>{record.supplierName}</TableCell>
                    <TableCell className="text-right">{record.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(record.unitPrice)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(record.totalAmount)}</TableCell>
                    <TableCell className="text-muted-foreground">{record.notes || '-'}</TableCell>
                  </TableRow>
                ))}
                {filteredRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Không có phiếu nhập nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Import;
