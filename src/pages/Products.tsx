import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, X } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Link } from 'react-router-dom';
import { useInventory } from '@/contexts/InventoryContext';
import { formatCurrency, formatNumber, formatDateTime, generateCode } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Product } from '@/types/inventory';

const categories = ['Điện tử', 'Điện thoại', 'Phụ kiện', 'Gia dụng', 'Thời trang', 'Khác'];
const units = ['Cái', 'Hộp', 'Bộ', 'Kg', 'Lít', 'Mét'];

const Products: React.FC = () => {
  const { products, suppliers, imports, invoices, addProduct, updateProduct, deleteProduct } = useInventory();
    // ...existing code...
    // Hàm xử lý copy sản phẩm
    const handleCopyProduct = async (product: Product) => {
      // Tạo mã mới cho sản phẩm copy
      const newCode = generateCode('SP', products.map(p => p.code));
      const copyData = {
        ...product,
        id: undefined,
        code: newCode,
        name: product.name + ' (Copy)',
      };
      try {
        await addProduct(copyData);
        toast.success('Đã copy sản phẩm thành công');
      } catch (error: any) {
        toast.error('Lỗi khi copy: ' + error.message);
      }
    } 
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState({
    code: '',
    name: '',
    category: '',
    supplier: '',
  });
  const handleColumnFilterChange = (field: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [field]: value }));
  };
  const clearFilters = () => {
    setSearchTerm('');
    setColumnFilters({ code: '', name: '', category: '', supplier: '' });
  };
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    unit: 'Cái',
    category: 'Điện tử',
    importPrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStock: 5,
    supplierId: '',
  });

  const filteredProducts = products.filter(p => {
    const term = searchTerm.trim().toLowerCase();
    if (term && !(p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term))) return false;
    if (columnFilters.code && !p.code.toLowerCase().includes(columnFilters.code.toLowerCase())) return false;
    if (columnFilters.name && !p.name.toLowerCase().includes(columnFilters.name.toLowerCase())) return false;
    if (columnFilters.category && columnFilters.category !== 'all' && !p.category.toLowerCase().includes(columnFilters.category.toLowerCase())) return false;
    if (columnFilters.supplier && columnFilters.supplier !== 'all') {
      const supplierName = (p.supplierName || '').toLowerCase();
      if (!supplierName.includes(columnFilters.supplier.toLowerCase())) return false;
    }
    return true;
  });

  // Aggregate import and sales stats per product
  const importStats = imports.reduce((acc: Record<string, { qty: number; amount: number }>, imp: any) => {
    imp.items.forEach((it: any) => {
      const id = it.productId;
      if (!id) return;
      if (!acc[id]) acc[id] = { qty: 0, amount: 0 };
      acc[id].qty += Number(it.quantity || 0);
      acc[id].amount += Number(it.amount || 0);
    });
    return acc;
  }, {});

  const salesStats = invoices.reduce((acc: Record<string, { qty: number; amount: number }>, inv: any) => {
    inv.items.forEach((it: any) => {
      const id = it.productId;
      if (!id) return;
      if (!acc[id]) acc[id] = { qty: 0, amount: 0 };
      acc[id].qty += Number(it.quantity || 0);
      acc[id].amount += Number(it.amount || 0);
    });
    return acc;
  }, {});


  const resetForm = () => {
    const newCode = generateCode('SP', products.map(p => p.code));
    setFormData({
      code: newCode,
      name: '',
      unit: 'Cái',
      category: 'Điện tử',
      importPrice: 0,
      sellingPrice: 0,
      stock: 0,
      minStock: 5,
      supplierId: '',
    });
    setEditingProduct(null);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        code: product.code,
        name: product.name,
        unit: product.unit,
        category: product.category,
        importPrice: product.importPrice,
        sellingPrice: product.sellingPrice,
        stock: product.stock,
        minStock: product.minStock,
        supplierId: product.supplierId || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        supplierId: formData.supplierId === 'none' ? undefined : formData.supplierId
      };
      if (editingProduct) {
        await updateProduct(editingProduct.id, dataToSave);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await addProduct(dataToSave);
        toast.success('Thêm sản phẩm thành công');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await deleteProduct(id);
        toast.success('Xóa sản phẩm thành công');
      } catch (error: any) {
        toast.error('Lỗi khi xóa: ' + error.message);
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sản phẩm</h1>
            <p className="text-muted-foreground mt-1">Quản lý danh sách sản phẩm trong kho</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="w-4 h-4" />
                Thêm sản phẩm
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="input-label">Mã sản phẩm</Label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="SP001"
                      disabled={!!editingProduct}
                    />
                  </div>
                  <div>
                    <Label className="input-label">Tên sản phẩm</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nhập tên sản phẩm"
                    />
                  </div>
                  <div>
                    <Label className="input-label">Đơn vị</Label>
                    <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map(u => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="input-label">Danh mục</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="input-label">Giá nhập</Label>
                    <Input
                      type="number"
                      value={formData.importPrice}
                      onChange={(e) => setFormData({ ...formData, importPrice: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="input-label">Giá bán</Label>
                    <Input
                      type="number"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="input-label">Số lượng tồn</Label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="input-label">Tồn kho tối thiểu</Label>
                    <Input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                      placeholder="5"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="input-label">Nhà cung cấp</Label>
                    <Select value={formData.supplierId} onValueChange={(v) => setFormData({ ...formData, supplierId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhà cung cấp" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Không có</SelectItem>
                        {suppliers.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">
                    {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc mã sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <X className="w-4 h-4" />
                Xóa bộ lọc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Mã SP</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead className="text-right">Giá nhập</TableHead>
                  <TableHead className="text-right">Giá bán</TableHead>                  <TableHead className="text-right">Nhập</TableHead>
                  <TableHead className="text-right">Bán</TableHead>                  <TableHead className="text-center">Tồn kho</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableRow className="table-filters">
                <TableCell>
                  <Input value={columnFilters.code} onChange={(e) => handleColumnFilterChange('code', e.target.value)} placeholder="Tìm mã..." className="w-full" />
                </TableCell>
                <TableCell>
                  <Input value={columnFilters.name} onChange={(e) => handleColumnFilterChange('name', e.target.value)} placeholder="Tìm tên..." className="w-full" />
                </TableCell>
                <TableCell>
                  <Select value={columnFilters.category} onValueChange={(v) => handleColumnFilterChange('category', v)}>
                    <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {categories.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select value={columnFilters.supplier} onValueChange={(v) => handleColumnFilterChange('supplier', v)}>
                    <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="none">Không có</SelectItem>
                      {suppliers.map(s => (
                        <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{product.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <Link to={`/products/${product.id}`} className="text-primary hover:underline">
                          {product.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{product.supplierName || '-'}</p>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(product.importPrice)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.sellingPrice)}</TableCell>
                    {/* Import totals */}
                    <TableCell className="text-right">
                      <div className="text-sm font-medium">{formatNumber(importStats[product.id]?.qty || 0)}</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(importStats[product.id]?.amount || 0)}</div>
                    </TableCell>
                    {/* Sales totals */}
                    <TableCell className="text-right">
                      <div className="text-sm font-medium">{formatNumber(salesStats[product.id]?.qty || 0)}</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(salesStats[product.id]?.amount || 0)}</div>
                    </TableCell>
                    {/* Computed stock = total imported - total sold */}
                    <TableCell className="text-center font-medium">{formatNumber((importStats[product.id]?.qty || 0) - (salesStats[product.id]?.qty || 0))}</TableCell>
                    <TableCell className="text-center">
                      {((importStats[product.id]?.qty || 0) - (salesStats[product.id]?.qty || 0)) < product.minStock ? (
                        <Badge variant="destructive">Sắp hết</Badge>
                      ) : (
                        <Badge variant="default" className="bg-success text-success-foreground">Còn hàng</Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatDateTime(product.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleCopyProduct(product)}
                          title="Copy sản phẩm"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>                  </TableRow>                ))}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy sản phẩm nào
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

export default Products;
