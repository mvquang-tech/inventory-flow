import Sidebar from './Sidebar';
import { useInventory } from '@/contexts/InventoryContext';
import { Loader2 } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isLoading } = useInventory();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 p-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};

export default MainLayout;
