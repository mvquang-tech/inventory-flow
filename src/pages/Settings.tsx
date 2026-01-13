import React, { useState } from 'react';
import { Settings as SettingsIcon, Store, Printer, Bell, Database, Trash2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const [storeName, setStoreName] = useState('Cửa hàng KhoHàng');
  const [storePhone, setStorePhone] = useState('0901234567');
  const [storeAddress, setStoreAddress] = useState('123 Nguyễn Văn A, Quận 1, TP.HCM');
  const [defaultVat, setDefaultVat] = useState(10);
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [printReceipt, setPrintReceipt] = useState(true);

  const handleSave = () => {
    toast.success('Đã lưu cài đặt thành công');
  };

  const handleClearData = () => {
    if (confirm('Bạn có chắc muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.')) {
      localStorage.removeItem('inventory_products');
      localStorage.removeItem('inventory_suppliers');
      localStorage.removeItem('inventory_imports');
      localStorage.removeItem('inventory_invoices');
      toast.success('Đã xóa tất cả dữ liệu');
      window.location.reload();
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cài đặt</h1>
          <p className="text-muted-foreground mt-1">Quản lý cấu hình hệ thống</p>
        </div>

        {/* Store Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Thông tin cửa hàng
            </CardTitle>
            <CardDescription>Cấu hình thông tin cơ bản của cửa hàng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="input-label">Tên cửa hàng</Label>
                <Input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Tên cửa hàng"
                />
              </div>
              <div>
                <Label className="input-label">Số điện thoại</Label>
                <Input
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  placeholder="Số điện thoại"
                />
              </div>
              <div className="col-span-2">
                <Label className="input-label">Địa chỉ</Label>
                <Input
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="Địa chỉ cửa hàng"
                />
              </div>
              <div>
                <Label className="input-label">VAT mặc định (%)</Label>
                <Input
                  type="number"
                  value={defaultVat}
                  onChange={(e) => setDefaultVat(Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Thông báo
            </CardTitle>
            <CardDescription>Cấu hình thông báo và cảnh báo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Cảnh báo hết hàng</p>
                <p className="text-sm text-muted-foreground">Thông báo khi sản phẩm sắp hết hàng</p>
              </div>
              <Switch checked={lowStockAlert} onCheckedChange={setLowStockAlert} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">In hóa đơn tự động</p>
                <p className="text-sm text-muted-foreground">Tự động in hóa đơn sau khi tạo</p>
              </div>
              <Switch checked={printReceipt} onCheckedChange={setPrintReceipt} />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Database className="w-5 h-5" />
              Quản lý dữ liệu
            </CardTitle>
            <CardDescription>Xóa và reset dữ liệu hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div>
                <p className="font-medium text-destructive">Xóa tất cả dữ liệu</p>
                <p className="text-sm text-muted-foreground">Xóa toàn bộ sản phẩm, hóa đơn, phiếu nhập và nhà cung cấp</p>
              </div>
              <Button variant="destructive" onClick={handleClearData} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Xóa dữ liệu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            Lưu cài đặt
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
