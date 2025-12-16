import React, { useState } from 'react';
import { LayoutDashboard, Box, Settings, LogOut, Plus, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Viewer3D from './Viewer3D';
import UploadZone from './UploadZone';
import ProfileModal from './ProfileModal';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('viewer');
  const [modelUrl, setModelUrl] = useState('http://localhost:3000/models/mock_room.obj');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user, logout } = useAuth();

  const handleUploadComplete = (data) => {
    if (data.modelUrl) {
      setModelUrl(data.modelUrl);
      setActiveTab('viewer');
    }
  };

  const navItems = [
    { id: 'viewer', icon: Box, label: '3D Viewer' },
    { id: 'upload', icon: Plus, label: 'New Scan' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="sidebar glass-panel"
      >
        <div className="sidebar-header">
          <div className="logo-box">
            <LayoutDashboard size={18} />
          </div>
          <h1>RoomScan</h1>
        </div>

        {/* User Info */}
        <div className="mb-6 p-3 bg-white/5 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setShowProfileModal(true)}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user?.username || 'User'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="nav-item logout">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="content-panel glass-panel"
          >
            {activeTab === 'viewer' && (
              <Viewer3D modelUrl={modelUrl} />
            )}
            
            {activeTab === 'upload' && (
              <UploadZone onUploadComplete={handleUploadComplete} />
            )}

            {activeTab === 'settings' && (
              <div className="settings-panel">
                <h2>Settings</h2>
                <div className="mt-6">
                    <button 
                        onClick={() => setShowProfileModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <UserIcon size={18} />
                        Edit Profile
                    </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showProfileModal && (
            <ProfileModal onClose={() => setShowProfileModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
