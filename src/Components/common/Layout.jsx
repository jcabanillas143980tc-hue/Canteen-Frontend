import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

const SIDEBAR_WIDTH = 240;
const COLLAPSED_WIDTH = 70;

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  const sidebarW = collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#f8fafc' }}>

      {/* ── Sidebar ── */}
      <div
        style={{
          width: sidebarW,
          flexShrink: 0,
          transition: 'width 0.3s ease',
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: 1030,
        }}
      >
        <Sidebar collapsed={collapsed} />
      </div>

      {/* ── Body ── */}
      <div
        className="d-flex flex-column flex-grow-1"
        style={{
          marginLeft: sidebarW,
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
        }}
      >
        {/* Navbar */}
        <Navbar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

        {/* Main content */}
        <main className="flex-grow-1 p-4">
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}