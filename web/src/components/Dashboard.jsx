import React, { useState } from 'react';
import { LayoutDashboard, Box, Settings, LogOut, Plus, User as UserIcon, Clock, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Viewer3D from './Viewer3D';
import UploadZone from './UploadZone';
import ProfileModal from './ProfileModal';
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('viewer');
  const [modelUrl, setModelUrl] = useState('http://localhost:3000/models/mock_room.obj');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [recentScans, setRecentScans] = useState([
    { id: 1, name: "Living Room Scan", date: "24 Jan 2026", status: "completed", url: "http://localhost:3000/models/room_1765907062441.obj" },
    { id: 2, name: "Kitchen 360", date: "22 Jan 2026", status: "completed", url: "http://localhost:3000/models/room_1765189288731.obj" },
    { id: 3, name: "Master Bedroom", date: "20 Jan 2026", status: "processing", url: "#" },
  ]);
  const { user, logout } = useAuth();

  const handleUploadComplete = (data) => {
    if (data.modelUrl) {
      const newScan = {
        id: Date.now(),
        name: `New Scan ${recentScans.length + 1}`,
        date: "Today",
        status: "completed",
        url: data.modelUrl
      };
      setRecentScans([newScan, ...recentScans]);
      setModelUrl(data.modelUrl);
      setActiveTab('viewer');
    }
  };

  const navItems = [
    { id: 'viewer', icon: Box, label: '3D Viewer' },
    { id: 'upload', icon: Plus, label: 'New Scan' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="w-72 flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl p-6"
      >
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <LayoutDashboard className="text-white" size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">RoomScan</h1>
        </div>

        {/* User Profile Card */}
        <div
          onClick={() => setShowProfileModal(true)}
          className="group flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer mb-8"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg border-2 border-white/10 group-hover:scale-105 transition-transform">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.username || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-medium"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col bg-gradient-to-br from-transparent to-primary/5">
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary/30 py-1 px-3">
              Pro Version
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            {activeTab === 'viewer' && (
              <p className="text-sm text-muted-foreground italic">Rendering in photorealistic mode</p>
            )}
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full flex flex-col"
            >
              {activeTab === 'viewer' && (
                <div className="h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/20">
                  <Viewer3D modelUrl={modelUrl} />
                </div>
              )}

              {activeTab === 'upload' && (
                <div className="h-full flex items-center justify-center">
                  <UploadZone onUploadComplete={handleUploadComplete} />
                </div>
              )}

              {activeTab === 'history' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentScans.map((scan) => (
                    <Card key={scan.id} className="bg-white/5 border-white/10 hover:border-primary/50 transition-all cursor-pointer" onClick={() => { setModelUrl(scan.url); setActiveTab('viewer'); }}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {scan.name}
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold mb-1">Room Model</div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {scan.date}
                          </p>
                          <Badge variant={scan.status === 'completed' ? 'default' : 'secondary'} className={scan.status === 'completed' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/20' : ''}>
                            {scan.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="max-w-2xl">
                  <h2 className="text-3xl font-bold mb-8">System Settings</h2>
                  <div className="space-y-6">
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold mb-1">User Profile</h3>
                            <p className="text-sm text-muted-foreground">Manage your account details and preferences.</p>
                          </div>
                          <Button onClick={() => setShowProfileModal(true)} variant="outline">
                            Manage Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <ProfileModal onClose={() => setShowProfileModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
