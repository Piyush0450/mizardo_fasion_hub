import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Truck, FileText, Plus, Edit, Trash2, RefreshCw, Bell } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProductForm from '../components/admin/ProductForm';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const { showToast } = useNotifications();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedUser, setSelectedUser] = useState(null);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    if (user?.role === 'super_admin') {
        tabs.push({ id: 'logs', label: 'System Logs', icon: FileText });
    }

    return (
        <div className="min-h-screen bg-brand-light-bg dark:bg-brand-black text-brand-light-text dark:text-white flex transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col fixed h-full bg-white dark:bg-brand-black z-10 transition-colors duration-300">
                <div className="mb-10 flex items-center justify-center">
                    <img src="/logo.jpg" alt="Mizardo Logo" className="h-16 w-auto object-contain" />
                </div>

                <nav className="flex-1 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === tab.id ? 'bg-brand-green text-black font-bold shadow-glow' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white'}`}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.full_name}&background=random`} alt="Admin" className="w-10 h-10 rounded-full" />
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">{user?.full_name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full flex items-center gap-2 text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors">
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 ml-64 overflow-y-auto min-h-screen">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold">{tabs.find(t => t.id === activeTab)?.label}</h2>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Welcome back, Admin</div>
                    </div>
                </header>

                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'products' && <ProductsTab showToast={showToast} />}
                {activeTab === 'orders' && <OrdersTab showToast={showToast} />}
                {activeTab === 'users' && <UsersTab currentUser={user} showToast={showToast} onSendNotification={(u) => { setSelectedUser(u); setActiveTab('notifications'); }} />}
                {activeTab === 'notifications' && <NotificationsTab showToast={showToast} preSelectedUser={selectedUser} />}
                {activeTab === 'logs' && <SystemLogsTab />}
            </main>
        </div>
    );
}

function OverviewTab() {
    const [stats, setStats] = useState({
        total_revenue: 0,
        active_orders: 0,
        total_products: 0,
        total_users: 0
    });
    const [chartData, setChartData] = useState([]);
    const [timeFilter, setTimeFilter] = useState('week');
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        fetchStats();
        fetchChartData();
    }, [timeFilter]);

    async function fetchStats() {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/analytics/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        }
    }

    async function fetchChartData() {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/analytics/chart-data?period=${timeFilter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChartData(res.data);
        } catch (error) {
            console.error("Failed to fetch chart data", error);
        }
    }

    const ChartCard = ({ title, dataKey, color, value }) => (
        <div className="bg-white dark:bg-brand-dark p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500`}>
                    {/* Icon placeholder if needed */}
                </div>
            </div>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color === 'brand-green' ? '#1DB954' : color} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={color === 'brand-green' ? '#1DB954' : color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            tickFormatter={(str) => {
                                if (!str) return '';
                                const date = new Date(str);
                                if (isNaN(date.getTime())) return str;
                                if (timeFilter === 'day') return date.getHours() + ':00';
                                if (timeFilter === 'week') return date.toLocaleDateString('en-US', { weekday: 'short' });
                                if (timeFilter === 'month') return date.getDate();
                                if (timeFilter === 'year') return date.toLocaleDateString('en-US', { month: 'short' });
                                return str;
                            }}
                            dy={10}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            allowDecimals={false}
                            width={45}
                            tickFormatter={(value) => {
                                if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                                return value;
                            }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0b0b0f', borderColor: '#1f2937', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            labelStyle={{ color: '#9ca3af', marginBottom: '0.25rem', fontSize: '0.75rem' }}
                            labelFormatter={(label) => {
                                const date = new Date(label);
                                if (isNaN(date.getTime())) return label;
                                return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: timeFilter === 'day' ? 'numeric' : undefined });
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color === 'brand-green' ? '#1DB954' : color}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill={`url(#color${dataKey})`}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Time Filter */}
            <div className="flex justify-end">
                <div className="bg-gray-100 dark:bg-gray-900 p-1 rounded-lg inline-flex">
                    {['day', 'week', 'month', 'year'].map((period) => (
                        <button
                            key={period}
                            onClick={() => setTimeFilter(period)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeFilter === period
                                ? 'bg-brand-green text-black shadow-lg'
                                : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                                }`}
                        >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid with Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard
                    title="Total Revenue"
                    dataKey="revenue"
                    color="#1DB954" // brand-green hex
                    value={`₹${stats.total_revenue}`}
                />
                <ChartCard
                    title="New Orders"
                    dataKey="orders"
                    color="#3b82f6" // blue-500
                    value={stats.active_orders} // Showing active orders count, but chart shows new orders flow
                />
                <ChartCard
                    title="New Products"
                    dataKey="products"
                    color="#eab308" // yellow-500
                    value={stats.total_products}
                />
                <ChartCard
                    title="New Users"
                    dataKey="users"
                    color="#a855f7" // purple-500
                    value={stats.total_users}
                />
            </div>
        </div>
    );
}

function ProductsTab({ showToast }) {
    const [products, setProducts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/products`);
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast("Product deleted successfully", "success");
            fetchProducts();
        } catch (error) {
            showToast("Failed to delete product", "error");
        }
    };

    if (isEditing) {
        return (
            <ProductForm
                product={currentProduct}
                onSuccess={() => {
                    setIsEditing(false);
                    fetchProducts();
                    showToast("Product saved successfully", "success");
                }}
                onCancel={() => setIsEditing(false)}
            />
        );
    }

    if (loading) return <div>Loading products...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Product Inventory</h3>
                <button
                    onClick={() => { setCurrentProduct(null); setIsEditing(true); }}
                    className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product.id || product._id} className="bg-white dark:bg-brand-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none overflow-hidden group hover:border-brand-green/50 transition-all duration-300">
                        <div className="aspect-square relative overflow-hidden">
                            <img
                                src={product.images?.[0] || '/hero-mock.png'}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button
                                    onClick={() => { setCurrentProduct(product); setIsEditing(true); }}
                                    className="p-3 bg-white text-black rounded-full hover:bg-brand-green transition-colors"
                                >
                                    <Edit size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id || product._id)}
                                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold truncate pr-2">{product.name}</h4>
                                <span className="text-brand-green font-bold">₹{product.price}</span>
                            </div>
                            <div className="flex gap-2 text-xs text-gray-500 mb-3">
                                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{product.category}</span>
                                {product.variants?.length > 0 && (
                                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{product.variants.length} Variants</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function OrdersTab({ showToast }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('request');
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const createShipment = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/orders/${orderId}/delhivery/create-shipment`, {
                dimensions: { length: 10, width: 10, height: 10 }, // Mock dimensions
                weight: 0.5
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast(`Shipment Created! AWB: ${res.data.awb}`, "success");
            fetchOrders();
        } catch (error) {
            console.error(error);
            showToast("Failed to create shipment: " + (error.response?.data?.detail || error.message), "error");
        }
    };

    const downloadLabel = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/orders/${orderId}/delhivery/label`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `label_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error(error);
            showToast("Failed to download label", "error");
        }
    };

    const downloadInvoice = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/orders/${orderId}/invoice`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            showToast("Failed to download invoice", "error");
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/orders/${orderId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast(`Order status updated to ${newStatus}`, "success");
            fetchOrders();
        } catch (error) {
            showToast("Failed to update status", "error");
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeCategory === 'request') return ['created', 'paid', 'processing'].includes(order.status);
        if (activeCategory === 'shipped') return order.status === 'shipped';
        if (activeCategory === 'completed') return order.status === 'delivered';
        if (activeCategory === 'canceled') return order.status === 'cancelled';
        return true;
    });

    const categories = [
        { id: 'request', label: 'Order Requests' },
        { id: 'shipped', label: 'Shipped Orders' },
        { id: 'completed', label: 'Completed Orders' },
        { id: 'canceled', label: 'Canceled Orders' },
    ];

    if (loading) return <div>Loading orders...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === cat.id ? 'bg-brand-green text-black shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
                <button onClick={fetchOrders} className="flex items-center gap-2 text-brand-green hover:text-white transition-colors">
                    <RefreshCw size={16} /> Refresh Orders
                </button>
            </div>

            {filteredOrders.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    No orders found in this category.
                </div>
            )}

            {filteredOrders.map(order => (
                <div key={order.id} className="bg-white dark:bg-brand-dark p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none flex flex-col md:flex-row justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg">Order #{order.id.slice(-6).toUpperCase()}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                                    order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                            order.status === 'delivered' ? 'bg-purple-500/20 text-purple-400' :
                                                'bg-gray-700 text-gray-300'
                                }`}>
                                {order.status.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Date: {new Date(order.created).toLocaleDateString()}</p>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            <p className="font-bold text-black dark:text-white">{order.address?.fullName}</p>
                            <p>{order.address?.addressLine1}</p>
                            <p>{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
                            <p>Phone: {order.address?.phone}</p>
                            <p className="text-xs mt-1">User ID: {order.user_id}</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                            {order.products.map((p, i) => (
                                <img key={i} src={p.image || '/hero-mock.png'} className="w-10 h-10 rounded object-cover border border-gray-700" title={p.name} />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <p className="text-xl font-bold">₹{order.total_amount}</p>
                        <div className="flex gap-2">
                            {(order.status === 'created' || order.status === 'paid') && (
                                <>
                                    <button
                                        onClick={() => updateStatus(order.id, 'processing')}
                                        className="btn-primary py-2 px-4 text-sm bg-green-600 hover:bg-green-700"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => updateStatus(order.id, 'cancelled')}
                                        className="btn-secondary py-2 px-4 text-sm border-red-500 text-red-500 hover:bg-red-500/10"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}

                            {order.status === 'processing' && (
                                <button
                                    onClick={() => createShipment(order.id)}
                                    className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                                >
                                    <Truck size={16} /> Ship
                                </button>
                            )}

                            {order.status === 'shipped' && (
                                <>
                                    <button
                                        onClick={() => updateStatus(order.id, 'delivered')}
                                        className="btn-primary py-2 px-4 text-sm bg-purple-600 hover:bg-purple-700"
                                    >
                                        Mark Delivered
                                    </button>
                                    <button
                                        onClick={() => downloadLabel(order.id)}
                                        className="btn-secondary py-2 px-4 text-sm flex items-center gap-2 border-brand-green text-brand-green hover:bg-brand-green/10"
                                    >
                                        <FileText size={16} /> Label
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() => downloadInvoice(order.id)}
                                className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
                            >
                                <FileText size={16} /> Invoice
                            </button>
                        </div>
                        {order.awb_code && (
                            <p className="text-xs text-brand-green">AWB: {order.awb_code}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function UsersTab({ currentUser, showToast, onSendNotification }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/auth/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/auth/users/${userId}/role`, { role: newRole }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast(`User role updated to ${newRole}`, "success");
            fetchUsers(); // Refresh list
        } catch (error) {
            showToast("Failed to update role: " + (error.response?.data?.detail || error.message), "error");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/auth/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast("User deleted successfully", "success");
            fetchUsers();
        } catch (error) {
            showToast("Failed to delete user: " + (error.response?.data?.detail || error.message), "error");
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    className="input-field pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white dark:bg-brand-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase">
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="p-4 font-medium">{u.full_name}</td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'super_admin' ? 'bg-purple-500/20 text-purple-400' :
                                            u.role === 'admin' ? 'bg-brand-green/20 text-brand-green' :
                                                'bg-gray-700 text-gray-300'
                                            }`}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {currentUser.role === 'super_admin' && u.email !== currentUser.email && (
                                            <div className="flex gap-2 items-center">
                                                <button
                                                    onClick={() => onSendNotification(u)}
                                                    className="p-2 text-brand-green hover:bg-brand-green/10 rounded transition-colors"
                                                    title="Send Notification"
                                                >
                                                    <Bell size={16} />
                                                </button>
                                                {u.role !== 'admin' && u.role !== 'super_admin' && (
                                                    <button
                                                        onClick={() => handleRoleUpdate(u.id, 'admin')}
                                                        className="text-xs bg-brand-green text-black px-3 py-1 rounded hover:bg-brand-neon transition"
                                                    >
                                                        Promote
                                                    </button>
                                                )}
                                                {u.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleRoleUpdate(u.id, 'user')}
                                                        className="text-xs border border-gray-600 px-3 py-1 rounded hover:bg-gray-700 transition"
                                                    >
                                                        Demote
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">
                                    No users found matching "{searchTerm}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function NotificationsTab({ showToast, preSelectedUser }) {
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const [type, setType] = useState(preSelectedUser ? 'individual' : 'broadcast');
    const [email, setEmail] = useState(preSelectedUser ? preSelectedUser.email : '');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (preSelectedUser) {
            setType('individual');
            setEmail(preSelectedUser.email);
        }
    }, [preSelectedUser]);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-brand-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
                <h2 className="text-xl font-bold mb-4">Send Notification</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Type</label>
                        <select
                            className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-black dark:text-white focus:border-brand-green focus:outline-none"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="broadcast">Broadcast (All Users)</option>
                            <option value="individual">Individual User</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">User Email (if individual)</label>
                        <input
                            type="email"
                            className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-black dark:text-white focus:border-brand-green focus:outline-none"
                            placeholder="User Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={type === 'broadcast'}
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                    <input
                        type="text"
                        className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-black dark:text-white focus:border-brand-green focus:outline-none"
                        placeholder="Notification Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1">Message</label>
                    <textarea
                        className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-black dark:text-white h-24 focus:border-brand-green focus:outline-none"
                        placeholder="Notification Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                </div>
                <button
                    onClick={async () => {
                        if (!title || !message) return showToast("Title and Message are required", "error");
                        if (type === 'individual' && !email) return showToast("User Email is required for individual notification", "error");

                        try {
                            const token = localStorage.getItem('token');
                            const endpoint = type === 'broadcast' ? '/notifications/broadcast' : '/notifications/send';
                            const payload = type === 'broadcast'
                                ? { scope: 'all_users', title, message, type: 'manual' }
                                : { email: email, title, message, type: 'manual' };

                            await axios.post(`${API_URL}${endpoint}`, payload, {
                                headers: { Authorization: `Bearer ${token}` }
                            });

                            showToast("Notification Sent!", "success");
                            setTitle('');
                            setMessage('');
                        } catch (error) {
                            console.error(error);
                            showToast("Failed to send notification", "error");
                        }
                    }}
                    className="btn-primary py-2 px-6"
                >
                    Send Notification
                </button>
            </div>
        </div>
    );
}

function SystemLogsTab() {
    // Mock logs for now, as backend implementation might be complex for this step
    const logs = [
        { id: 1, action: 'User Login', user: 'piyushchaurasiya771@gmail.com', time: '2 mins ago', status: 'Success' },
        { id: 2, action: 'Order Created', user: 'john.doe@example.com', time: '15 mins ago', status: 'Success' },
        { id: 3, action: 'Product Updated', user: 'admin@mizardo.com', time: '1 hour ago', status: 'Success' },
        { id: 4, action: 'Failed Login', user: 'unknown@ip.addr', time: '2 hours ago', status: 'Failed' },
    ];

    return (
        <div className="bg-brand-dark rounded-2xl border border-gray-800 p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileText className="text-brand-green" /> System Activity Logs
            </h3>
            <div className="space-y-4">
                {logs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${log.status === 'Success' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <div>
                                <p className="font-bold text-sm">{log.action}</p>
                                <p className="text-xs text-gray-500">{log.user}</p>
                            </div>
                        </div>
                        <span className="text-xs text-gray-400">{log.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
