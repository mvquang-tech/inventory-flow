import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Users, Phone, Mail, MapPin, History, Upload, Download, FileSpreadsheet, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
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
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Customer } from '@/types/inventory';

const Customers: React.FC = () => {
    const navigate = useNavigate();
    const { customers, addCustomer, updateCustomer, deleteCustomer } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        phone: '',
        email: '',
        address: '',
    });
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);

    const filteredCustomers = customers.filter(
        c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm)
    );

    const resetForm = () => {
        const newCode = generateCode('KH', customers.map(c => c.code));
        setFormData({
            code: newCode,
            name: '',
            phone: '',
            email: '',
            address: '',
        });
        setEditingCustomer(null);
    };

    const handleOpenDialog = (customer?: Customer) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                code: customer.code,
                name: customer.name,
                phone: customer.phone,
                email: customer.email || '',
                address: customer.address || '',
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên khách hàng');
            return;
        }
        if (!formData.phone.trim()) {
            toast.error('Vui lòng nhập số điện thoại');
            return;
        }

        try {
            if (editingCustomer) {
                await updateCustomer(editingCustomer.id, formData);
                toast.success('Cập nhật khách hàng thành công');
            } else {
                await addCustomer(formData);
                toast.success('Thêm khách hàng thành công');
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error('Lỗi: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bạn có chắc muốn xóa khách hàng này?')) {
            try {
                await deleteCustomer(id);
                toast.success('Xóa khách hàng thành công');
            } catch (error: any) {
                toast.error('Lỗi khi xóa: ' + error.message);
            }
        }
    };

    const handleOpenHistory = (customer: Customer) => {
        navigate(`/customers/${customer.id}/history`);
    };

    const handleExportExcel = () => {
        try {
            const dataToExport = customers.map(c => ({
                'Mã KH': c.code,
                'Tên khách hàng': c.name,
                'Số điện thoại': c.phone,
                'Email': c.email || '',
                'Địa chỉ': c.address || '',
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "KhachHang");
            XLSX.writeFile(wb, "DanhSachKhachHang.xlsx");
            toast.success('Xuất file Excel thành công');
        } catch (error: any) {
            toast.error('Lỗi xuất file: ' + error.message);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const bstr = event.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json<any>(ws);

                if (data.length === 0) {
                    toast.error('File không có dữ liệu');
                    setImporting(false);
                    return;
                }

                let successCount = 0;
                let errorCount = 0;

                for (const item of data) {
                    // Try to map various column names
                    const name = item['Tên khách hàng'] || item['Name'] || item['Ho ten'] || item['Họ tên'];
                    const phone = item['Số điện thoại'] || item['Phone'] || item['SDT'] || item['SĐT'];
                    const email = item['Email'] || item['Thu dien tu'];
                    const address = item['Địa chỉ'] || item['Address'] || item['Dia chi'];
                    const code = item['Mã KH'] || item['Code'] || item['Ma KH'];

                    if (!name || !phone) {
                        errorCount++;
                        continue;
                    }

                    // Check if exists by phone or code (if provided)
                    const exists = customers.some(c => c.phone === phone || (code && c.code === code));
                    if (exists) {
                        errorCount++; // Skip duplicates strictly for now, or could update
                        continue;
                    }

                    try {
                        await addCustomer({
                            code: code || generateCode('KH', customers.map(c => c.code)), // Generate if missing
                            name: String(name),
                            phone: String(phone),
                            email: email ? String(email) : '',
                            address: address ? String(address) : '',
                        });
                        successCount++;
                    } catch (err) {
                        console.error('Error adding customer:', err);
                        errorCount++;
                    }
                }

                toast.success(`Nhập thành công ${successCount} khách hàng. Bỏ qua/Lỗi: ${errorCount}`);
            } catch (error: any) {
                toast.error('Lỗi đọc file: ' + error.message);
            } finally {
                setImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.readAsBinaryString(file);
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Khách hàng</h1>
                        <p className="text-muted-foreground mt-1">Quản lý cơ sở dữ liệu khách hàng</p>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImportExcel}
                        />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="text-muted-foreground">
                                        <Info className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="font-semibold mb-1">Hướng dẫn nhập file:</p>
                                    <ul className="list-disc pl-4 text-xs space-y-1">
                                        <li>Định dạng file: .xlsx, .xls</li>
                                        <li>Cột bắt buộc: <strong>Tên khách hàng, Số điện thoại</strong></li>
                                        <li>Cột tùy chọn: Mã KH, Email, Địa chỉ</li>
                                    </ul>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button variant="outline" onClick={handleImportClick} disabled={importing} className="gap-2">
                            <Upload className="w-4 h-4" />
                            {importing ? 'Đang nhập...' : 'Nhập Excel'}
                        </Button>
                        <Button variant="outline" onClick={handleExportExcel} className="gap-2">
                            <Download className="w-4 h-4" />
                            Xuất Excel
                        </Button>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => handleOpenDialog()} className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    Thêm khách hàng
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingCustomer ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="input-label">Mã khách hàng</Label>
                                            <Input
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                placeholder="KH001"
                                                disabled={!!editingCustomer}
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
                                    </div>
                                    <div>
                                        <Label className="input-label">Tên khách hàng</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Nguyễn Văn A"
                                        />
                                    </div>
                                    <div>
                                        <Label className="input-label">Email (không bắt buộc)</Label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="nguyenvana@gmail.com"
                                        />
                                    </div>
                                    <div>
                                        <Label className="input-label">Địa chỉ (không bắt buộc)</Label>
                                        <Textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Số 123 Lê Lợi..."
                                            rows={2}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                            Hủy
                                        </Button>
                                        <Button type="submit">
                                            {editingCustomer ? 'Cập nhật' : 'Thêm mới'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm theo tên, mã hoặc số điện thoại..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Customers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCustomers.map((customer) => (
                        <Card key={customer.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{customer.name}</p>
                                            <p className="text-sm text-muted-foreground">{customer.code}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-primary hover:text-primary hover:bg-primary/10"
                                            onClick={() => handleOpenHistory(customer)}
                                            title="Lịch sử mua hàng"
                                        >
                                            <History className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleOpenDialog(customer)}
                                            title="Sửa thông tin"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(customer.id)}
                                            title="Xóa khách hàng"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="w-4 h-4" />
                                        <span>{customer.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                        <span>{customer.email || '-'}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-muted-foreground">
                                        <MapPin className="w-4 h-4 mt-0.5" />
                                        <span>{customer.address || '-'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredCustomers.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            Không tìm thấy khách hàng nào
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Customers;
