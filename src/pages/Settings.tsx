import React, { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, Store, Printer, Bell, Database, Trash2, Cloud, CreditCard, Share2, Globe, Percent, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { DataMigration } from '@/components/DataMigration';
import { useInventory } from '@/contexts/InventoryContext';
import { StoreSettings } from '@/types/inventory';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useInventory();
  const [formData, setFormData] = useState<Partial<StoreSettings>>({
    name: '',
    phone: '',
    address: '',
    taxCode: '',
    bankAccount: '',
    bankName: '',
    facebook: '',
    zalo: '',
    website: '',
    defaultVat: 10
  });

  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [printReceipt, setPrintReceipt] = useState(true);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (field: keyof StoreSettings, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate if it's an image
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    // Limit size to 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được quá 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('store-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('store-logos')
        .getPublicUrl(filePath);

      // Update form data and show preview
      setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
      toast.success('Tải logo lên thành công!');

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Lỗi tải ảnh: ' + (error.message || 'Không xác định'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      toast.success('Đã lưu cài đặt thành công');
    } catch (error: any) {
      toast.error('Lỗi khi lưu cài đặt: ' + error.message);
    }
  };

  const handleClearData = () => {
    if (confirm('Bạn có chắc muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.')) {
      toast.warning('Tính năng xóa toàn bộ dữ liệu Supabase chưa được triển khai mặc định để tránh rủi ro.');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cài đặt</h1>
            <p className="text-muted-foreground mt-1">Quản lý cấu hình hệ thống và cửa hàng</p>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <SettingsIcon className="w-4 h-4" />
            Lưu cài đặt
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Store Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Store className="w-5 h-5" />
                Thông tin cơ bản
              </CardTitle>
              <CardDescription>Các thông tin xuất hiện trên hóa đơn và liên hệ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Logo cửa hàng</Label>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors relative"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Store Logo" className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <ImageIcon className="w-8 h-8 mb-1" />
                          <span className="text-xs">Tải ảnh</span>
                        </div>
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Logo sẽ hiển thị trên tất cả hóa đơn in ra. Định dạng: PNG, JPG (Max 2MB).
                      </p>
                      <Input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {formData.logoUrl ? 'Thay đổi Logo' : 'Tải Logo lên'}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeName">Tên cửa hàng</Label>
                  <Input
                    id="storeName"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Nhập tên cửa hàng"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Số điện thoại</Label>
                  <Input
                    id="storePhone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="Số điện thoại liên hệ"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="storeAddress">Địa chỉ</Label>
                  <Input
                    id="storeAddress"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Địa chỉ chi tiết"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxCode">Mã số thuế</Label>
                  <Input
                    id="taxCode"
                    value={formData.taxCode || ''}
                    onChange={(e) => handleChange('taxCode', e.target.value)}
                    placeholder="Nhập mã số thuế"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="website"
                      value={formData.website || ''}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="https://example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Bank Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <CreditCard className="w-5 h-5" />
                Thông tin thanh toán
              </CardTitle>
              <CardDescription>Thông tin tài khoản nhận chuyển khoản</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Tên ngân hàng</Label>
                <Input
                  id="bankName"
                  value={formData.bankName || ''}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  placeholder="Ví dụ: Vietcombank, Techcombank..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Số tài khoản</Label>
                <Input
                  id="bankAccount"
                  value={formData.bankAccount || ''}
                  onChange={(e) => handleChange('bankAccount', e.target.value)}
                  placeholder="Số tài khoản ngân hàng"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-600">
                <Share2 className="w-5 h-5" />
                Mạng xã hội
              </CardTitle>
              <CardDescription>Các liên kết mạng xã hội chính thức</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={formData.facebook || ''}
                  onChange={(e) => handleChange('facebook', e.target.value)}
                  placeholder="Link fanpage hoặc profile"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zalo">Zalo</Label>
                <Input
                  id="zalo"
                  value={formData.zalo || ''}
                  onChange={(e) => handleChange('zalo', e.target.value)}
                  placeholder="Số điện thoại hoặc link Zalo"
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Cấu hình hệ thống
              </CardTitle>
              <CardDescription>Các giá trị mặc định khi vận hành</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultVat">VAT mặc định (%)</Label>
                <Input
                  id="defaultVat"
                  type="number"
                  value={formData.defaultVat}
                  onChange={(e) => handleChange('defaultVat', Number(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cảnh báo hết hàng</p>
                  <p className="text-sm text-muted-foreground">Thông báo khi sản phẩm sắp hết hàng</p>
                </div>
                <Switch checked={lowStockAlert} onCheckedChange={setLowStockAlert} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">In hóa đơn tự động</p>
                  <p className="text-sm text-muted-foreground">Tự động in hóa đơn sau khi tạo</p>
                </div>
                <Switch checked={printReceipt} onCheckedChange={setPrintReceipt} />
              </div>
            </CardContent>
          </Card>

          {/* Migration Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-500">
                <Cloud className="w-5 h-5" />
                Công cụ di chuyển
              </CardTitle>
              <CardDescription>Đồng bộ dữ liệu LocalStorage sang Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <DataMigration />
            </CardContent>
          </Card>
        </div>

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
            <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20 text-sm">
              <div>
                <p className="font-medium text-destructive">Xóa dữ liệu</p>
                <p className="text-muted-foreground">Xóa toàn bộ dữ liệu hiện tại để bắt đầu lại.</p>
              </div>
              <Button variant="destructive" onClick={handleClearData} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Reset hệ thống
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Settings;
