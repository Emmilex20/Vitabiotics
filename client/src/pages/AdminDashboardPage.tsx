// /client/src/pages/AdminDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Plus, Package, ShoppingCart, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminDashboardOverview from '../components/AdminDashboardOverview';
import AdminProductForm from '../components/AdminProductForm';
import AdminProductList from '../components/AdminProductList';
import AdminOrdersList from '../components/AdminOrdersList';
import AdminPaystackDebug from '../components/AdminPaystackDebug';
import AdminUsersList from '../components/AdminUsersList';

const AdminDashboardPage: React.FC = () => {
    const [currentView, setCurrentView] = useState<'overview' | 'create' | 'list' | 'orders' | 'users' | 'payments'>('overview');
    const [editingProduct, setEditingProduct] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Dev-time helper: warn if API base isn't configured to help debug HTML responses (Vite index.html)
    const apiBase = import.meta.env.VITE_API_URL || '';
    const isDev = import.meta.env.MODE !== 'production';

    // Helper to render the navigation + logout (used in both desktop and mobile)
    const renderNavAndLogout = () => (
      <>
        <nav className="space-y-2">
            {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => {
                            setCurrentView(item.id as any);
                            setEditingProduct(null);
                            setSidebarOpen(false); // close on mobile
                        }}
                        className={`w-full flex items-center gap-3 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                            currentView === item.id
                                ? 'bg-vita-secondary text-vita-text shadow-lg'
                                : 'hover:bg-white/10 text-white/90'
                        }`}
                    >
                        <IconComponent className="w-5 h-5" />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </nav>

        <div className="border-t border-white/20 pt-6 mt-auto">
            <button
                onClick={() => { setSidebarOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-3 py-3 px-4 rounded-lg font-medium transition-colors hover:bg-red-500/20 text-white/90 hover:text-white"
            >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
            </button>
        </div>
      </>
    );

    useEffect(() => {
        if (isDev && !apiBase) {
            console.warn('VITE_API_URL is not set — API requests may hit the front-end dev server and return HTML. Set VITE_API_URL (e.g., http://localhost:5000) in client .env and restart the dev server.');
        }
    }, []);

    const handleProductSaved = () => {
        setEditingProduct(null);
        setCurrentView('list');
    };

    const handleEditProduct = (product: any) => {
        setEditingProduct(product);
        setCurrentView('create');
    };

    const handleProductDeleted = () => {
        setCurrentView('overview');
    };

    const handleLogout = () => {
        // Ensure mobile sidebar is closed on logout
        setSidebarOpen(false);
        logout();
        navigate('/');
    };

    const navItems = [
        { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
        { id: 'create', label: 'Add New Product', icon: Plus },
        { id: 'list', label: 'Manage Products', icon: Package },
        { id: 'orders', label: 'View Orders', icon: ShoppingCart },
        { id: 'users', label: 'Manage Users', icon: LayoutDashboard },
        { id: 'payments', label: 'Payments', icon: LayoutDashboard },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            
            {/* Sidebar Navigation (desktop only) */}
            <aside className="hidden md:block w-64 bg-gradient-to-b from-vita-primary to-vita-primary/90 text-white p-6 space-y-6 shadow-2xl fixed h-full overflow-y-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-vita-secondary/20 rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="w-6 h-6 text-vita-secondary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Admin Panel</h1>
                        <p className="text-xs text-white/70">Vitabiotics Management</p>
                    </div>
                </div>

                {renderNavAndLogout()}
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-50 md:hidden">
                <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-vita-primary to-vita-primary/90 text-white p-6 space-y-6 shadow-2xl overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-vita-secondary/20 rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="w-6 h-6 text-vita-secondary" />
                      </div>
                      <div>
                        <h1 className="text-lg font-bold">Admin Panel</h1>
                        <p className="text-xs text-white/70">Vitabiotics</p>
                      </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="p-2 rounded bg-white/10">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {renderNavAndLogout()}
                </aside>
              </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                  {/* Mobile menu button */}
                  <div className="mb-4 md:hidden">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md bg-white shadow inline-flex items-center">
                      <Menu className="w-5 h-5 text-vita-primary" />
                      <span className="sr-only">Open menu</span>
                    </button>
                  </div>

                    {isDev && !apiBase && (
                        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-800">
                            <strong>⚠️ VITE_API_URL not set.</strong> Requests may hit the Vite dev server and return HTML. Set <code>VITE_API_URL</code> (e.g., <em>http://localhost:5000</em>) in your client <code>.env</code> and restart the dev server.
                        </div>
                    )}
                    {currentView === 'overview' && <AdminDashboardOverview onNavigate={(view) => setCurrentView(view as any)} />}
                    
                    {currentView === 'create' && (
                        <AdminProductForm 
                            initialData={editingProduct || undefined} 
                            onProductSaved={handleProductSaved}
                        />
                    )}
                    
                    {currentView === 'list' && (
                        <AdminProductList
                            onEditProduct={handleEditProduct}
                            onProductDeleted={handleProductDeleted}
                        />
                    )}
                    
                    {currentView === 'orders' && <AdminOrdersList />}
                    {currentView === 'users' && <AdminUsersList />}
                    {currentView === 'payments' && <AdminPaystackDebug />}
                </div>
            </main>
        </div>
    );
}

export default AdminDashboardPage;