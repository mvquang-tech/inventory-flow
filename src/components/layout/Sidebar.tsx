import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Users,
  BarChart3,
  Settings,
  Truck,
  PackagePlus
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/' },
  { icon: Package, label: 'Sản phẩm', path: '/products' },
  { icon: PackagePlus, label: 'Nhập hàng', path: '/import' },
  { icon: ShoppingCart, label: 'Bán hàng', path: '/sales' },
  { icon: Users, label: 'Khách hàng', path: '/customers' },
  { icon: FileText, label: 'Hóa đơn', path: '/invoices' },
  { icon: Truck, label: 'Nhà cung cấp', path: '/suppliers' },
  { icon: BarChart3, label: 'Báo cáo', path: '/reports' },
  { icon: Settings, label: 'Cài đặt', path: '/settings' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">KhoHàng</h1>
            <p className="text-xs text-sidebar-foreground/60">Quản lý kho thông minh</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Admin</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">admin@khohang.vn</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
