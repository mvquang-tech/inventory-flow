import React, { useState } from 'react';
import { Plus, Trash2, ShoppingCart, Calculator, CheckCircle, ScrollText, Download, Printer, ChevronLeft, ChevronRight, List } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useInventory } from '@/contexts/InventoryContext';
import InvoicePrint from '@/components/InvoicePrint';
import InvoicePOSPrint from '@/components/InvoicePOSPrint';
import { formatCurrency, generateCode } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  const { products, invoices, addInvoice, customers, addCustomer, suppliers, settings } = useInventory();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vat, setVat] = useState(10);
  const [shippingCost, setShippingCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');
  const [notes, setNotes] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk-in');
  const [customerQuery, setCustomerQuery] = useState('');
  const [showCustomerList, setShowCustomerList] = useState(false);

  // New customer dialog states
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');

  // Searchable product select states
  const [productQuery, setProductQuery] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [productPageSize, setProductPageSize] = useState(10);

  // Product modal (list) states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'category' | 'supplier'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSupplierModal, setSelectedSupplierModal] = useState<string | null>(null);
  const [modalProductQuery, setModalProductQuery] = useState('');

  const [printingInvoice, setPrintingInvoice] = useState<any>(null);
  const [posPrintingInvoice, setPosPrintingInvoice] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [lastSavedInvoice, setLastSavedInvoice] = useState<any>(null);

  React.useEffect(() => {
    if (settings) {
      setVat(settings.defaultVat);
    }
  }, [settings]);

  const normalizePhone = (s: string) => (s || '').toString().replace(/\D/g, '');

  const handleCustomerQueryChange = (value: string) => {
    setCustomerQuery(value);
    setShowCustomerList(true);

    const digits = normalizePhone(value);
    // Only auto-select when user types a full phone number (>= 10 digits) — use exact match
    if (digits.length >= 10) {
      const found = customers.find(c => normalizePhone(c.phone) === digits);
      if (found) {
        handleCustomerChange(found.id);
        setCustomerQuery(`${found.code} - ${found.name} (${found.phone || '-'})`);
        setShowCustomerList(false);
        return;
      }
    }
  };

  const handleCustomerChange = (id: string) => {
    setSelectedCustomerId(id);
    if (id === 'walk-in') {
      setCustomerName('');
      setCustomerPhone('');
    } else {
      const customer = customers.find(c => c.id === id);
      if (customer) {
        setCustomerName(customer.name);
        setCustomerPhone(customer.phone);
      }
    }
  }; 

  const handleCreateCustomer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCustomerName.trim()) {
      toast.error('Vui lòng nhập tên khách hàng');
      return;
    }
    if (!newCustomerPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    try {
      const newCode = generateCode('KH', customers.map(c => c.code));
      const created = await addCustomer({
        code: newCode,
        name: newCustomerName,
        phone: newCustomerPhone,
        email: newCustomerEmail,
        address: newCustomerAddress,
      });

      toast.success('Thêm khách hàng thành công');

      // If addCustomer returned the created customer, use it to select and fill fields
      if (created) {
        handleCustomerChange(created.id);
        setCustomerQuery(`${created.code} - ${created.name} (${created.phone || '-'})`);
        setCustomerName(created.name);
        setCustomerPhone(created.phone || '');
      } else {
        // Fallback: prefill query with expected display and fields
        setCustomerQuery(`${newCode} - ${newCustomerName} (${newCustomerPhone || '-'})`);
        setCustomerName(newCustomerName);
        setCustomerPhone(newCustomerPhone);
      }

      setIsNewCustomerDialogOpen(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerEmail('');
      setNewCustomerAddress('');
    } catch (error: any) {
      toast.error('Lỗi khi thêm khách hàng: ' + error.message);
    }
  };

  const handlePrint = (invoice: any) => {
    setPrintingInvoice(invoice);
    setTimeout(() => {
      window.print();
      setPrintingInvoice(null);
    }, 100);
  };

  const handleExportPOS = async (invoice: any) => {
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

  const handleNewSale = () => {
    setShowSuccessDialog(false);
    setLastSavedInvoice(null);
    setItems([]);
    setSelectedCustomerId('walk-in');
    setCustomerName('');
    setCustomerPhone('');
    setShippingCost(0);
    setDiscount(0);
    setNotes('');
  };

  const addItemById = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = items.find(i => i.productId === productId);
    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock) {
        toast.error('Số lượng vượt quá tồn kho');
        return;
      }
      setItems(items.map(i =>
        i.productId === productId
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
    setProductQuery('');
    setShowProductList(false);
    setProductPage(1);
  };

  const addItem = () => {
    if (!selectedProductId) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }

    addItemById(selectedProductId);
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

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error('Vui lòng thêm sản phẩm vào hóa đơn');
      return;
    }

    try {
      const invoiceCode = generateCode('HD', invoices.map(i => i.code));

      const newInvoice = await addInvoice({
        code: invoiceCode,
        customerId: selectedCustomerId === 'walk-in' ? undefined : selectedCustomerId,
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

      // Show success dialog instead of auto print
      setLastSavedInvoice(newInvoice);
      setShowSuccessDialog(true);

      // We don't clear form immediately here anymore, wait for "New Sale"
    } catch (error: any) {
      toast.error('Lỗi khi tạo hóa đơn: ' + error.message);
    }
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
                  {/* Searchable product select */}
                  <div className="relative flex-1">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Tìm sản phẩm (mã hoặc tên)..."
                        value={productQuery}
                        onChange={(e) => { setProductQuery(e.target.value); setShowProductList(true); setProductPage(1); }}
                        onFocus={() => setShowProductList(true)}
                        className="w-full"
                        onBlur={() => setTimeout(() => setShowProductList(false), 150)}
                      />

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => { setIsProductModalOpen(true); setModalTab('category'); }}
                          title="Chọn từ danh sách"
                        >
                          <List className="w-4 h-4" />
                        </Button>

                        <Button onClick={addItem} className="gap-2 hidden sm:flex">
                          <Plus className="w-4 h-4" />
                          Thêm
                        </Button>
                      </div>
                    </div>

                    {showProductList && (
                      (() => {
                        const filtered = products.filter(p => p.stock > 0).filter(p => {
                          const q = productQuery.trim().toLowerCase();
                          if (!q) return true;
                          return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
                        });
                        const total = filtered.length;
                        const totalPages = Math.max(1, Math.ceil(total / productPageSize));
                        if (productPage > totalPages) setProductPage(totalPages);
                        const pageItems = filtered.slice((productPage - 1) * productPageSize, productPage * productPageSize);

                        return (
                          <div className="absolute z-20 mt-1 w-full max-h-72 overflow-hidden rounded-md border bg-popover">
                            <div className="px-3 py-2 border-b flex items-center justify-between">
                              <div className="text-sm text-muted-foreground">{total} kết quả</div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={productPageSize}
                                  onChange={(e) => { setProductPageSize(Number(e.target.value)); setProductPage(1); }}
                                  onMouseDown={(e) => e.preventDefault()}
                                  className="text-xs bg-transparent p-1"
                                >
                                  <option value={5}>5 / trang</option>
                                  <option value={10}>10 / trang</option>
                                  <option value={20}>20 / trang</option>
                                </select>
                                <div className="text-xs text-muted-foreground">Trang {productPage}/{totalPages}</div>
                              </div>
                            </div>

                            <div className="max-h-52 overflow-auto">
                              {pageItems.length ? (
                                pageItems.map(p => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => { addItemById(p.id); }}
                                    className="w-full text-left px-3 py-2 hover:bg-accent/60"
                                  >
                                    <div className="text-sm font-medium">{p.code} - {p.name} <span className="text-xs text-muted-foreground">(Còn: {p.stock})</span></div>
                                    <div className="text-xs text-muted-foreground">Nhà cung cấp: {p.supplierName || '-'}</div>
                                    <div className="text-xs text-muted-foreground">Giá bán: <span className="font-medium">{formatCurrency(p.sellingPrice)}</span></div>
                                  </button>
                                ))
                              ) : (
                                <div className="p-3 text-sm text-muted-foreground">Không tìm thấy sản phẩm</div>
                              )}
                            </div>

                            <div className="px-3 py-2 border-t flex items-center justify-between">
                              <div className="text-xs text-muted-foreground">Hiển thị {(productPage - 1) * productPageSize + 1} - {Math.min(productPage * productPageSize, total)} của {total}</div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => setProductPage(p => Math.max(1, p - 1))}
                                  disabled={productPage <= 1}
                                  className="p-1 rounded disabled:opacity-40"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => setProductPage(p => Math.min(totalPages, p + 1))}
                                  disabled={productPage >= totalPages}
                                  className="p-1 rounded disabled:opacity-40"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
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
                        <TableCell className="text-right align-middle">
                          <div className="flex items-center justify-end h-full gap-3">
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => {
                                const newPrice = Number(e.target.value);
                                if (isNaN(newPrice) || newPrice < 0) return;
                                setItems(items.map(i =>
                                  i.productId === item.productId
                                    ? { ...i, unitPrice: newPrice, amount: i.quantity * newPrice - i.discount }
                                    : i
                                ));
                              }}
                              className="w-28 text-right h-8"
                            />
                            <div className="text-sm text-muted-foreground whitespace-nowrap">{!isNaN(Number(item.unitPrice)) ? formatCurrency(Number(item.unitPrice)) : '-'}</div>
                          </div>
                        </TableCell>
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
                  <Label className="input-label">Chọn khách hàng</Label>
                  <div className="relative">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Tìm hoặc chọn khách hàng..."
                        value={customerQuery}
                        onChange={(e) => handleCustomerQueryChange(e.target.value)}
                        onFocus={() => setShowCustomerList(true)}
                        onBlur={() => setTimeout(() => setShowCustomerList(false), 150)}
                        className="w-full"
                      />

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setNewCustomerName('');
                          // If current query looks like phone, prefill it
                          const digits = normalizePhone(customerQuery);
                          if (digits.length >= 7) {
                            setNewCustomerPhone(customerQuery.trim());
                          } else {
                            setNewCustomerPhone('');
                          }
                          setNewCustomerEmail('');
                          setNewCustomerAddress('');
                          setIsNewCustomerDialogOpen(true);
                        }}
                        title="Thêm khách hàng mới"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {showCustomerList && (
                      <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover">
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { handleCustomerChange('walk-in'); setCustomerQuery(''); setShowCustomerList(false); }}
                          className="w-full text-left px-3 py-2 hover:bg-accent/60"
                        >
                          Khách lẻ / Khách mới
                        </button>

                        {customers
                          .filter(c => {
                            const q = customerQuery.trim().toLowerCase();
                            if (!q) return true;
                            return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
                          })
                          .map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => { handleCustomerChange(c.id); setCustomerQuery(`${c.code} - ${c.name} (${c.phone || '-'})`); setShowCustomerList(false); }}
                              className="w-full text-left px-3 py-2 hover:bg-accent/60"
                            >
                              <div className="flex items-center justify-between">
                                <div className="truncate">{c.code} - {c.name}</div>
                                <div className="text-xs text-muted-foreground ml-2 whitespace-nowrap">{c.phone || '-'}</div>
                              </div>
                            </button>
                          ))}

                        {customers.filter(c => {
                          const q = customerQuery.trim().toLowerCase();
                          if (!q) return true;
                          return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
                        }).length === 0 && (
                          <div className="p-3 text-sm text-muted-foreground">Không tìm thấy khách hàng</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="input-label">Tên khách hàng</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Tên khách hàng"
                    disabled={selectedCustomerId !== 'walk-in'}
                  />
                </div>
                <div>
                  <Label className="input-label">Số điện thoại</Label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0901234567"
                    disabled={selectedCustomerId !== 'walk-in'}
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

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-2 text-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <span className="text-xl">Thanh toán thành công!</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center text-muted-foreground">
              Hóa đơn <span className="font-semibold text-foreground">{lastSavedInvoice?.code}</span> đã được tạo.
              <br />
              Tổng tiền: <span className="font-bold text-foreground">{lastSavedInvoice && formatCurrency(lastSavedInvoice.totalAmount)}</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="w-full text-purple-600 border-purple-200 hover:bg-purple-50"
                onClick={() => lastSavedInvoice && handleExportPOS(lastSavedInvoice)}
              >
                <ScrollText className="w-5 h-5 mr-2" />
                In Bill POS (58mm)
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => lastSavedInvoice && handlePrint(lastSavedInvoice)}
              >
                <Printer className="w-5 h-5 mr-2" />
                In Hóa đơn (A4/A5)
              </Button>

              <Button
                className="w-full"
                size="lg"
                onClick={handleNewSale}
              >
                <Plus className="w-5 h-5 mr-2" />
                Bán đơn mới
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product List Dialog */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-w-4xl min-h-[500px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Chọn sản phẩm</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue={modalTab} onValueChange={(v) => setModalTab(v as 'category' | 'supplier')}>
            {/* Make tab list sticky within the scrollable area */}
            <div className="flex-1 overflow-auto">
              <div className="sticky top-0 z-10 bg-popover border-b">
                <TabsList className="bg-transparent">
                  <TabsTrigger value="category">Danh mục</TabsTrigger>
                  <TabsTrigger value="supplier">Nhà cung cấp</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="category">
                <div className="flex gap-4">
                  <div className="w-48">
                    <div className="flex flex-col gap-2">
                      {Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-left px-3 py-2 rounded ${selectedCategory === cat ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/30'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    <Input
                      placeholder="Tìm sản phẩm..."
                      value={modalProductQuery}
                      onChange={(e) => setModalProductQuery(e.target.value)}
                      className="mb-2"
                    />
                    <div className="max-h-96 overflow-auto border rounded-md">
                      {products.filter(p => p.stock > 0)
                        .filter(p => !selectedCategory || p.category === selectedCategory)
                        .filter(p => {
                          const q = modalProductQuery.trim().toLowerCase();
                          if (!q) return true;
                          return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
                        })
                        .map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { addItemById(p.id); setIsProductModalOpen(false); }}
                            className="w-full text-left px-3 py-2 hover:bg-accent/60 flex items-center justify-between"
                          >
                            <div>{p.code} - {p.name}</div>
                            <div className="text-xs text-muted-foreground">{formatCurrency(p.sellingPrice)}</div>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="supplier">
                <div className="flex gap-4">
                  <div className="w-48">
                    <div className="flex flex-col gap-2">
                      {suppliers.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedSupplierModal(s.id)}
                          className={`text-left px-3 py-2 rounded ${selectedSupplierModal === s.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/30'}`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    <Input
                      placeholder="Tìm sản phẩm..."
                      value={modalProductQuery}
                      onChange={(e) => setModalProductQuery(e.target.value)}
                      className="mb-2"
                    />
                    <div className="max-h-96 overflow-auto border rounded-md">
                      {products.filter(p => p.stock > 0)
                        .filter(p => !selectedSupplierModal || p.supplierId === selectedSupplierModal)
                        .filter(p => {
                          const q = modalProductQuery.trim().toLowerCase();
                          if (!q) return true;
                          return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
                        })
                        .map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { addItemById(p.id); setIsProductModalOpen(false); }}
                            className="w-full text-left px-3 py-2 hover:bg-accent/60 flex items-center justify-between"
                          >
                            <div>{p.code} - {p.name}</div>
                            <div className="text-xs text-muted-foreground">{formatCurrency(p.sellingPrice)}</div>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Customer Dialog */}
    </MainLayout>
  );
};

export default Sales;
