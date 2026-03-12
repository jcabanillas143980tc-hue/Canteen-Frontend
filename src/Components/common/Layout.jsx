import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';
import './Layout.css';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`layout ${collapsed ? 'collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} />
      <div className="layout-body">
        <Navbar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}