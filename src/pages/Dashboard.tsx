import React from 'react';
import { Package, TrendingUp, AlertTriangle, ShoppingCart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import StatCard from '@/components/dashboard/StatCard';
import { useInventory } from '@/contexts/InventoryContext';
import { formatCurrency, formatNumber, formatDate } from '@/utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Dashboard: React.FC = () => {
  const { products, invoices, imports, stats } = useInventory();

  const todaySales = invoices
    .filter(inv => {
      const today = new Date();
      const invDate = new Date(inv.invoiceDate);
      return invDate.toDateString() === today.toDateString();
    })
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const lowStockProducts = products.filter(p => p.stock < p.minStock);
  const recentInvoices = [...invoices].sort((a, b) =>
    new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
  ).slice(0, 5);

  const recentImports = [...imports].sort((a, b) =>
    new Date(b.importDate).getTime() - new Date(a.importDate).getTime()
  ).slice(0, 5);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tổng quan</h1>
          <p className="text-muted-foreground mt-1">Theo dõi hoạt động kinh doanh của bạn</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng sản phẩm"
            value={formatNumber(stats.totalProducts)}
            icon={Package}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Tổng tồn kho"
            value={formatNumber(stats.totalStock)}
            icon={Package}
            variant="default"
          />
          <StatCard
            title="Giá trị kho hàng"
            value={formatCurrency(stats.totalValue)}
            icon={TrendingUp}
            variant="success"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Sản phẩm sắp hết"
            value={stats.lowStockCount}
            icon={AlertTriangle}
            variant={stats.lowStockCount > 0 ? 'warning' : 'default'}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Hóa đơn gần đây</CardTitle>
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {recentInvoices.length > 0 ? (
                <div className="space-y-4">
                  {recentInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <ArrowUpRight className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{invoice.code}</p>
                          <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-success">{formatCurrency(invoice.totalAmount)}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(invoice.invoiceDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Chưa có hóa đơn nào</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Imports */}
          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Nhập hàng gần đây</CardTitle>
              <Package className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {recentImports.length > 0 ? (
                <div className="space-y-4">
                  {recentImports.map((imp) => (
                    <div key={imp.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                          <ArrowDownRight className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium">{imp.code}</p>
                          <p className="text-sm text-muted-foreground">{imp.supplierName} ({imp.items.length} mặt hàng)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(imp.totalAmount)}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(imp.importDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Chưa có phiếu nhập nào</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="border-warning/50 bg-warning/5 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-warning">
                <AlertTriangle className="w-5 h-5" />
                Cảnh báo sản phẩm sắp hết hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 rounded-lg bg-card border">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.code}</p>
                    </div>
                    <Badge variant="destructive" className="ml-2">
                      Còn {product.stock}/{product.minStock}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
