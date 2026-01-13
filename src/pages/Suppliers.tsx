import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Truck, Phone, Mail, MapPin } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useInventory } from '@/contexts/InventoryContext';
import { generateCode } from '@/utils/format';
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
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Supplier } from '@/types/inventory';
import { History } from 'lucide-react';

const Suppliers: React.FC = () => {
  const navigate = useNavigate();
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  const filteredSuppliers = suppliers.filter(
    s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    const newCode = generateCode('NCC', suppliers.map(s => s.code));
    setFormData({
      code: newCode,
      name: '',
      phone: '',
      email: '',
      address: '',
    });
    setEditingSupplier(null);
  };

  const handleOpenHistory = (supplier: Supplier) => {
    navigate(`/suppliers/${supplier.id}/history`);
  };

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        code: supplier.code,
        name: supplier.name,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên nhà cung cấp');
      return;
    }

    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, formData);
        toast.success('Cập nhật nhà cung cấp thành công');
      } else {
        await addSupplier(formData);
        toast.success('Thêm nhà cung cấp thành công');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa nhà cung cấp này?')) {
      try {
        await deleteSupplier(id);
        toast.success('Xóa nhà cung cấp thành công');
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
            <h1 className="text-3xl font-bold text-foreground">Nhà cung cấp</h1>
            <p className="text-muted-foreground mt-1">Quản lý danh sách nhà cung cấp hàng hóa</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="w-4 h-4" />
                Thêm nhà cung cấp
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp mới'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="input-label">Mã nhà cung cấp</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="NCC001"
                    disabled={!!editingSupplier}
                  />
                </div>
                <div>
                  <Label className="input-label">Tên nhà cung cấp</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Công ty TNHH ABC"
                  />
                </div>
                <div>
                  <Label className="input-label">Số điện thoại</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0901234567"
                  />
                </div>
                <div>
                  <Label className="input-label">Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@company.com"
                  />
                </div>
                <div>
                  <Label className="input-label">Địa chỉ</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Địa chỉ nhà cung cấp..."
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">
                    {editingSupplier ? 'Cập nhật' : 'Thêm mới'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc mã nhà cung cấp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{supplier.name}</p>
                      <p className="text-sm text-muted-foreground">{supplier.code}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-primary hover:text-primary hover:bg-primary/5"
                      onClick={() => handleOpenHistory(supplier)}
                      title="Xem lịch sử nhập hàng"
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenDialog(supplier)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(supplier.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => handleOpenHistory(supplier)}
                >
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{supplier.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{supplier.email || '-'}</span>
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>{supplier.address || '-'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredSuppliers.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Không tìm thấy nhà cung cấp nào
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Suppliers;
