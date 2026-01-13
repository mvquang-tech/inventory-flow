import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useInventory } from '@/contexts/InventoryContext';
import { formatCurrency, formatNumber } from '@/utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)', 'hsl(340, 75%, 55%)'];

const Reports: React.FC = () => {
  const { products, invoices, imports, stats } = useInventory();

  // Calculate revenue
  const totalRevenue = invoices
    .filter(inv => inv.status === 'completed')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  // Calculate cost
  const totalCost = imports.reduce((sum, r) => sum + r.totalAmount, 0);

  // Profit
  const profit = totalRevenue - totalCost;

  // Category breakdown
  const categoryData = products.reduce((acc, product) => {
    const existing = acc.find(c => c.name === product.category);
    if (existing) {
      existing.value += product.stock * product.importPrice;
      existing.count += 1;
    } else {
      acc.push({ name: product.category, value: product.stock * product.importPrice, count: 1 });
    }
    return acc;
  }, [] as { name: string; value: number; count: number }[]);

  // Top selling products (by quantity sold)
  const productSales = invoices.flatMap(inv => inv.items).reduce((acc, item) => {
    const existing = acc.find(p => p.productId === item.productId);
    if (existing) {
      existing.quantity += item.quantity;
      existing.revenue += item.amount;
    } else {
      acc.push({
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        quantity: item.quantity,
        revenue: item.amount,
      });
    }
    return acc;
  }, [] as { productId: string; productCode: string; productName: string; quantity: number; revenue: number }[]);

  const topProducts = productSales.sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  // Low stock products
  const lowStockProducts = products
    .filter(p => p.stock < p.minStock)
    .sort((a, b) => a.stock / a.minStock - b.stock / b.minStock);

  // Monthly revenue (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    const monthInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.invoiceDate);
      return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear();
    });
    return {
      month: monthYear,
      revenue: monthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    };
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Báo cáo & Thống kê</h1>
          <p className="text-muted-foreground mt-1">Phân tích hoạt động kinh doanh</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-warning/5 border-warning/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng chi phí nhập</p>
                  <p className="text-2xl font-bold text-warning">{formatCurrency(totalCost)}</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/10">
                  <TrendingDown className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-success/5 border-success/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lợi nhuận</p>
                  <p className={`text-2xl font-bold ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(profit)}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${profit >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <TrendingUp className={`w-6 h-6 ${profit >= 0 ? 'text-success' : 'text-destructive'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Giá trị kho hàng</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted">
                  <Package className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Doanh thu theo tháng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Phân bổ theo danh mục
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Sản phẩm bán chạy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="text-right">Đã bán</TableHead>
                    <TableHead className="text-right">Doanh thu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.productId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center p-0">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{product.productName}</p>
                            <p className="text-sm text-muted-foreground">{product.productCode}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(product.quantity)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(product.revenue)}</TableCell>
                    </TableRow>
                  ))}
                  {topProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        Chưa có dữ liệu bán hàng
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card className={lowStockProducts.length > 0 ? 'border-warning/50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${lowStockProducts.length > 0 ? 'text-warning' : ''}`} />
                Cảnh báo tồn kho
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="text-center">Tồn kho</TableHead>
                    <TableHead className="text-center">Tối thiểu</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.code}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-destructive">{product.stock}</TableCell>
                      <TableCell className="text-center">{product.minStock}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="destructive">
                          Thiếu {product.minStock - product.stock}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {lowStockProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Tất cả sản phẩm đều đủ tồn kho
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Reports;
