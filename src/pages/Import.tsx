import { Plus, Search, Package, Calendar, Trash2, ShoppingCart, Eye, Edit2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useInventory } from '@/contexts/InventoryContext';
import { formatCurrency, formatDate, generateCode } from '@/utils/format';
import { Product, Supplier, Import as ImportData, Invoice, InventoryStats, ImportItem } from '@/types/inventory';
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
  DialogFooter,
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
import { useState } from 'react';

const Import: React.FC = () => {
  const { products, suppliers, imports, addImport, updateImport, deleteImport } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Active records for dialogs
  const [editingImport, setEditingImport] = useState<ImportData | null>(null);
  const [viewingImport, setViewingImport] = useState<ImportData | null>(null);
  const [deletingImport, setDeletingImport] = useState<ImportData | null>(null);

  // Header form states
  const [supplierId, setSupplierId] = useState('');
  const [importDate, setImportDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Item list state
  const [items, setItems] = useState<Omit<ImportItem, 'id' | 'importId'>[]>([]);

  // Current adding item state
  const [currentProductId, setCurrentProductId] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [currentUnitPrice, setCurrentUnitPrice] = useState(0);

  const filteredImports = imports.filter(
    i => i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSupplierChange = (newSupplierId: string) => {
    setSupplierId(newSupplierId);
    setItems([]); // Clear items if supplier changes
    setCurrentProductId('');
    setCurrentUnitPrice(0);
  };

  const handleProductChange = (productId: string) => {
    setCurrentProductId(productId);
    const product = products.find(p => p.id === productId);
    setCurrentUnitPrice(product?.importPrice || 0);
  };

  const addItem = () => {
    if (!currentProductId) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }
    if (currentQuantity <= 0) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    const product = products.find(p => p.id === currentProductId)!;

    // Check if item already exists
    const existingIndex = items.findIndex(item => item.productId === currentProductId);
    if (existingIndex > -1) {
      const newItems = [...items];
      newItems[existingIndex].quantity += currentQuantity;
      newItems[existingIndex].amount = newItems[existingIndex].quantity * newItems[existingIndex].unitPrice;
      setItems(newItems);
    } else {
      setItems([...items, {
        productId: currentProductId,
        productCode: product.code,
        productName: product.name,
        quantity: currentQuantity,
        unitPrice: currentUnitPrice,
        amount: currentQuantity * currentUnitPrice
      }]);
    }

    setCurrentProductId('');
    setCurrentQuantity(1);
    setCurrentUnitPrice(0);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      toast.error('Vui lòng chọn nhà cung cấp');
      return;
    }
    if (items.length === 0) {
      toast.error('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    try {
      const supplier = suppliers.find(s => s.id === supplierId)!;
      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

      if (editingImport) {
        await updateImport(editingImport.id, {
          supplierId,
          supplierName: supplier.name,
          items: items as ImportItem[],
          totalAmount,
          importDate: new Date(importDate),
          notes,
        });
        toast.success('Cập nhật phiếu nhập thành công');
      } else {
        const importCode = generateCode('PN', imports.map(i => i.code));
        await addImport({
          code: importCode,
          supplierId,
          supplierName: supplier.name,
          items: items as ImportItem[],
          totalAmount,
          importDate: new Date(importDate),
          notes,
        });
        toast.success('Nhập hàng thành công');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error('Lỗi khi lưu phiếu nhập: ' + error.message);
    }
  };

  const handleEdit = (imp: ImportData) => {
    setEditingImport(imp);
    setSupplierId(imp.supplierId);
    setItems(imp.items.map(item => ({ ...item })));
    setImportDate(new Date(imp.importDate).toISOString().split('T')[0]);
    setNotes(imp.notes || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingImport) return;
    try {
      await deleteImport(deletingImport.id);
      toast.success('Xóa phiếu nhập thành công');
      setIsDeleteOpen(false);
    } catch (error: any) {
      toast.error('Lỗi khi xóa phiếu nhập: ' + error.message);
    }
  };

  const resetForm = () => {
    setEditingImport(null);
    setSupplierId('');
    setItems([]);
    setNotes('');
    setImportDate(new Date().toISOString().split('T')[0]);
    setCurrentProductId('');
    setCurrentQuantity(1);
    setCurrentUnitPrice(0);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nhập hàng</h1>
            <p className="text-muted-foreground mt-1">Quản lý phiếu nhập hàng từ nhà cung cấp</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Tạo phiếu nhập</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingImport ? `Sửa phiếu nhập: ${editingImport.code}` : 'Tạo phiếu nhập hàng mới'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="input-label">Bước 1: Chọn nhà cung cấp</Label>
                    <Select value={supplierId} onValueChange={handleSupplierChange}>
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

                  <div className="col-span-2 border rounded-lg p-4 bg-muted/30 space-y-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <ShoppingCart className="w-4 h-4" />
                      Bước 2: Thêm sản phẩm vào phiếu
                    </div>
                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-12 md:col-span-5">
                        <Label className="text-xs">Sản phẩm</Label>
                        <Select
                          value={currentProductId}
                          onValueChange={handleProductChange}
                          disabled={!supplierId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={supplierId ? "Chọn sản phẩm" : "Vui lòng chọn nhà cung cấp"} />
                          </SelectTrigger>
                          <SelectContent>
                            {products
                              .filter(p => !supplierId || p.supplierId === supplierId)
                              .map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.code} - {p.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <Label className="text-xs">Số lượng</Label>
                        <Input
                          type="number"
                          min="1"
                          value={currentQuantity}
                          onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-4 md:col-span-3">
                        <Label className="text-xs">Giá nhập</Label>
                        <Input
                          type="number"
                          value={currentUnitPrice}
                          onChange={(e) => setCurrentUnitPrice(Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <Button type="button" onClick={addItem} disabled={!currentProductId} className="w-full">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Temporary Items Table */}
                    <div className="border rounded-md bg-background overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50 h-8">
                            <TableHead className="text-xs h-8">Tên sản phẩm</TableHead>
                            <TableHead className="text-xs text-right h-8">SL</TableHead>
                            <TableHead className="text-xs text-right h-8">Đơn giá</TableHead>
                            <TableHead className="text-xs text-right h-8">Thành tiền</TableHead>
                            <TableHead className="w-8 h-8"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, index) => (
                            <TableRow key={index} className="h-10">
                              <TableCell className="text-xs py-2">{item.productName}</TableCell>
                              <TableCell className="text-xs text-right py-2">{item.quantity}</TableCell>
                              <TableCell className="text-xs text-right py-2">{formatCurrency(item.unitPrice)}</TableCell>
                              <TableCell className="text-xs text-right font-medium py-2">{formatCurrency(item.amount)}</TableCell>
                              <TableCell className="py-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive"
                                  onClick={() => removeItem(index)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {items.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-xs py-4 text-muted-foreground">
                                Chưa có sản phẩm
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="col-span-1">
                    <Label className="input-label">Ngày nhập</Label>
                    <Input
                      type="date"
                      value={importDate}
                      onChange={(e) => setImportDate(e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <Label className="input-label">Tổng cộng</Label>
                    <div className="h-10 flex items-center px-3 border rounded-md bg-muted font-bold text-primary">
                      {formatCurrency(items.reduce((sum, i) => sum + i.amount, 0))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label className="input-label">Ghi chú</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ghi chú thêm..."
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={items.length === 0}>
                    Hoàn tất phiếu nhập
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
                  <p className="text-2xl font-bold">{imports.length}</p>
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
                  <p className="text-2xl font-bold">{formatCurrency(imports.reduce((sum, r) => sum + r.totalAmount, 0))}</p>
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
                  <TableHead>Mã phiếu</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead className="text-right">Số mặt hàng</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredImports.map((imp) => (
                  <TableRow key={imp.id} className="hover:bg-muted/50">
                    <TableCell>{formatDate(imp.importDate)}</TableCell>
                    <TableCell className="font-medium">{imp.code}</TableCell>
                    <TableCell>{imp.supplierName}</TableCell>
                    <TableCell className="text-right">{imp.items.length}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(imp.totalAmount)}</TableCell>
                    <TableCell className="text-muted-foreground">{imp.notes || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600"
                          onClick={() => {
                            setViewingImport(imp);
                            setIsViewOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600"
                          onClick={() => handleEdit(imp)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => {
                            setDeletingImport(imp);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredImports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Không có phiếu nhập nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* View Detail Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết phiếu nhập: {viewingImport?.code}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nhà cung cấp</p>
                <p className="font-semibold">{viewingImport?.supplierName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ngày nhập</p>
                <p className="font-semibold">{viewingImport && formatDate(viewingImport.importDate)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Ghi chú</p>
                <p>{viewingImport?.notes || 'Không có ghi chú'}</p>
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
                  {viewingImport?.items.map((item, index) => (
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

            <div className="flex justify-between items-center bg-primary/5 p-4 rounded-lg">
              <span className="font-bold">Tổng giá trị phiếu:</span>
              <span className="text-xl font-bold text-primary">
                {viewingImport && formatCurrency(viewingImport.totalAmount)}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa phiếu nhập</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Bạn có chắc chắn muốn xóa phiếu nhập <span className="font-bold">{deletingImport?.code}</span>?</p>
            <p className="text-sm text-destructive mt-2 italic">* Lưu ý: Tồn kho của các sản phẩm trong phiếu sẽ bị giảm tương ứng.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xác nhận xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Import;
