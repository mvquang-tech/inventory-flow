import React, { useState } from 'react';
import { Plus, Trash2, ShoppingCart, Calculator } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useInventory } from '@/contexts/InventoryContext';
import { formatCurrency, generateCode } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { InvoiceItem } from '@/types/inventory';

const paymentMethods = ['Tiền mặt', 'Chuyển khoản', 'Thẻ tín dụng', 'Ví điện tử'];

const Sales: React.FC = () => {
  const { products, invoices, addInvoice } = useInventory();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vat, setVat] = useState(10);
  const [shippingCost, setShippingCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');
  const [notes, setNotes] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  const addItem = () => {
    if (!selectedProductId) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const existingItem = items.find(i => i.productId === selectedProductId);
    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock) {
        toast.error('Số lượng vượt quá tồn kho');
        return;
      }
      setItems(items.map(i => 
        i.productId === selectedProductId 
          ? { ...i, quantity: i.quantity + 1, amount: (i.quantity + 1) * i.unitPrice }
          : i
      ));
    } else {
      if (product.stock < 1) {
        toast.error('Sản phẩm đã hết hàng');
        return;
      }
      setItems([...items, {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        quantity: 1,
        unitPrice: product.sellingPrice,
        discount: 0,
        amount: product.sellingPrice,
      }]);
    }
    setSelectedProductId('');
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stock) {
      toast.error('Số lượng vượt quá tồn kho');
      return;
    }
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(items.map(i => 
      i.productId === productId 
        ? { ...i, quantity, amount: quantity * i.unitPrice - i.discount }
        : i
    ));
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  const vatAmount = subtotal * (vat / 100);
  const totalAmount = subtotal + vatAmount + shippingCost - discount;

  const handleSubmit = () => {
    if (items.length === 0) {
      toast.error('Vui lòng thêm sản phẩm vào hóa đơn');
      return;
    }

    const invoiceCode = generateCode('HD', invoices.map(i => i.code));

    addInvoice({
      code: invoiceCode,
      customerName: customerName || 'Khách lẻ',
      customerPhone,
      items,
      subtotal,
      vat,
      vatAmount,
      shippingCost,
      discount,
      totalAmount,
      paymentMethod,
      status: 'completed',
      notes,
      invoiceDate: new Date(),
    });

    toast.success(`Tạo hóa đơn ${invoiceCode} thành công!`);
    
    // Reset form
    setItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setShippingCost(0);
    setDiscount(0);
    setNotes('');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bán hàng</h1>
          <p className="text-muted-foreground mt-1">Tạo hóa đơn bán hàng mới</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Product Selection & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Product */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Thêm sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Chọn sản phẩm..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.filter(p => p.stock > 0).map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.code} - {p.name} (Còn: {p.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addItem} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Thêm
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Items Table */}
            <Card>
              <CardHeader>
                <CardTitle>Danh sách sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="table-header">
                      <TableHead>Mã SP</TableHead>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-center w-32">Số lượng</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">{item.productCode}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.productId, Number(e.target.value))}
                              className="w-16 text-center h-8"
                            />
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(item.amount)}</TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Chưa có sản phẩm nào trong hóa đơn
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Right - Customer & Payment */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin khách hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="input-label">Tên khách hàng</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Khách lẻ"
                  />
                </div>
                <div>
                  <Label className="input-label">Số điện thoại</Label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0901234567"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">VAT (%)</span>
                  <Input
                    type="number"
                    value={vat}
                    onChange={(e) => setVat(Number(e.target.value))}
                    className="w-20 text-right"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thuế VAT</span>
                  <span className="font-medium">{formatCurrency(vatAmount)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <Input
                    type="number"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(Number(e.target.value))}
                    className="w-32 text-right"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Giảm giá</span>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-32 text-right"
                  />
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-primary">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
                <div>
                  <Label className="input-label">Phương thức thanh toán</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="input-label">Ghi chú</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ghi chú thêm..."
                    rows={2}
                  />
                </div>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleSubmit}
                  disabled={items.length === 0}
                >
                  Hoàn tất đơn hàng
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Sales;
