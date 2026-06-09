// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   IconHome, 
//   IconPackage, 
//   IconShoppingCart, 
//   IconCategory, 
//   IconLogout 
// } from '@tabler/icons-react';

// import DashboardHome from './sections/DashboardHome';
// import ProductsManager from './sections/ProductsManager';
// import OrdersManager from './sections/OrdersManager';

// const TABS = [
//   { key: 'dashboard', label: 'Dashboard', icon: IconHome },
//   { key: 'products',  label: 'Products',  icon: IconPackage },
//   { key: 'orders',    label: 'Orders',    icon: IconShoppingCart },
//   { key: 'categories',label: 'Categories',icon: IconCategory },
// ];

// const AdminPage = () => {
//   const [active, setActive] = useState('dashboard');
//   const navigate = useNavigate();

//   // Simple auth protection
//   const token = localStorage.getItem('token');
//   if (!token) {
//     navigate('/login');
//     return null;
//   }

//   return (
//     <div className="flex h-screen bg-gray-50 overflow-hidden">
//       {/* Sidebar */}
//       <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
//         <div className="px-6 py-8 border-b border-gray-100">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl">
//               🏟️
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">City Sports</h1>
//               <p className="text-xs text-gray-500 -mt-1">Admin Panel</p>
//             </div>
//           </div>
//         </div>

//         <nav className="flex-1 px-4 py-6 space-y-1">
//           {TABS.map((tab) => (
//             <button
//               key={tab.key}
//               onClick={() => setActive(tab.key)}
//               className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium transition-all ${
//                 active === tab.key
//                   ? 'bg-emerald-50 text-emerald-700 shadow-sm'
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               <tab.icon size={22} />
//               {tab.label}
//             </button>
//           ))}
//         </nav>

//         <div className="p-4 border-t border-gray-100 mt-auto">
//           <button
//             onClick={() => {
//               localStorage.removeItem('token');
//               localStorage.removeItem('user');
//               navigate('/login');
//             }}
//             className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all"
//           >
//             <IconLogout size={20} />
//             Sign Out
//           </button>
//         </div>
//       </aside>

//       {/* Main Content Area */}
//       <main className="flex-1 overflow-auto bg-gray-50">
//         <div className="p-8">
//           {/* Top Bar */}
//           <div className="flex justify-between items-center mb-10">
//             <h2 className="text-3xl font-semibold text-gray-900 capitalize">
//               {active}
//             </h2>
            
//             <div className="flex items-center gap-4">
//               <div className="bg-white px-4 py-2 rounded-2xl text-sm text-gray-500 flex items-center gap-2 border border-gray-100">
//                 July 2025
//               </div>
//               <div className="w-9 h-9 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-semibold text-sm">
//                 SA
//               </div>
//             </div>
//           </div>

//           {/* Render Active Section */}
//           {active === 'dashboard' && <DashboardHome />}
//           {active === 'products' && <ProductsManager />}
//           {active === 'orders' && <OrdersManager />}
//           {active === 'categories' && (
//             <div className="text-center py-20 text-gray-400">
//               Categories Manager Coming Soon...
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default AdminPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IconHome, 
  IconChartBar, 
  IconShoppingBag, 
  IconTag, 
  IconBox, 
  IconClipboardList,
  IconChartLine,
  IconUsers,
  IconMail,
  IconSettings,
  IconBell,
  IconLogout 
} from '@tabler/icons-react';

import DashboardHome from './sections/DashboardHome';
import ProductsManager from './sections/ProductsManager';
import OrdersManager from './sections/OrdersManager';
import AnalyticsManager from './sections/AnalyticsManager';
import InventoryManager from './sections/InventoryManager';
import CustomerManager from './sections/CustomerManager';
import SalesManager from './sections/SalesManager';
import CategoryManager from './sections/CategoryManager';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: IconHome },
  { key: 'products',  label: 'Products',  icon: IconShoppingBag },
  { key: 'orders',    label: 'Orders',    icon: IconClipboardList },
  { key: 'categories',label: 'Categories',icon: IconTag },
  { key: 'inventory', label: 'Inventory', icon: IconBox },
  { key: 'analytics', label: 'Analytics', icon: IconChartBar },
  { key: 'customers', label: 'Customers', icon: IconUsers },
  { key: 'sales',     label: 'Sales',     icon: IconChartLine },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  // Simple Auth Protection
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-8 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl">
              🏟️
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">City Sports</h1>
              <p className="text-xs text-gray-500 -mt-1">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={22} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 mt-auto">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all"
          >
            <IconLogout size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-semibold text-gray-900 capitalize">
              {activeTab}
            </h2>

            <div className="flex items-center gap-4">
              <button className="p-3 hover:bg-gray-100 rounded-2xl">
                <IconBell size={22} className="text-gray-600" />
              </button>
              <div className="w-9 h-9 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-semibold">
                SA
              </div>
            </div>
          </div>

          {/* Dynamic Content Based on Active Tab */}
          {activeTab === 'dashboard' && <DashboardHome />}
          
          {activeTab === 'products' && <ProductsManager />}
          
          {activeTab === 'orders' && <OrdersManager />}
          
         {activeTab === 'categories' && <CategoryManager/>}
          {activeTab === 'inventory' && <InventoryManager />}
          {activeTab === 'analytics' && <AnalyticsManager />}
         {activeTab === 'customers' && <CustomerManager />}

          {activeTab === 'sales' && <SalesManager />}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;