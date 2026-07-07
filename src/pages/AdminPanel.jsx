import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Flag, BarChart3, Shield, Ban, Check, X, Search, Eye } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";
import UserAvatar from "@/components/nex/UserAvatar";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [u, r] = await Promise.all([
        base44.entities.UserProfile.list("-created_date", 50),
        base44.entities.Report.list("-created_date", 30),
      ]);
      setUsers(u);
      setReports(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId, suspended) => {
    await base44.entities.UserProfile.update(userId, { is_suspended: suspended });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_suspended: suspended } : u)));
  };

  const handleBan = async (userId, banned) => {
    await base44.entities.UserProfile.update(userId, { is_banned: banned });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_banned: banned } : u)));
  };

  const handleVerify = async (userId, verified) => {
    await base44.entities.UserProfile.update(userId, { is_verified: verified });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_verified: verified } : u)));
  };

  const handleReportStatus = async (reportId, status) => {
    await base44.entities.Report.update(reportId, { status });
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)));
  };

  const tabs = [
    { key: "users", label: "Users", icon: Users },
    { key: "reports", label: "Reports", icon: Flag },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const filteredUsers = users.filter((u) => u.username?.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 safe-top pb-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl glass flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </button>
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                tab === t.key ? "gradient-blue text-white" : "glass text-white/40"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Users Tab */}
      {tab === "users" && (
        <div>
          <div className="glass rounded-xl flex items-center gap-3 px-3 py-2.5 mb-4">
            <Search className="w-5 h-5 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-white/30"
            />
          </div>
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <GlassCard key={user.id} className="!p-3">
                <div className="flex items-center gap-3 mb-3">
                  <UserAvatar src={user.profile_photo} size="sm" isOnline={user.is_online} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-white text-sm font-medium truncate">{user.username}</p>
                      {user.is_verified && <Shield className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <p className="text-white/30 text-xs">
                      {user.plan || "free"} · {user.is_banned ? "Banned" : user.is_suspended ? "Suspended" : "Active"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerify(user.id, !user.is_verified)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium ${user.is_verified ? "gradient-blue text-white" : "glass text-white/40"}`}
                  >
                    {user.is_verified ? "Verified" : "Verify"}
                  </button>
                  <button
                    onClick={() => handleSuspend(user.id, !user.is_suspended)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium ${user.is_suspended ? "bg-yellow-500/20 text-yellow-400" : "glass text-white/40"}`}
                  >
                    {user.is_suspended ? "Unsuspend" : "Suspend"}
                  </button>
                  <button
                    onClick={() => handleBan(user.id, !user.is_banned)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium ${user.is_banned ? "bg-red-500/20 text-red-400" : "glass text-white/40"}`}
                  >
                    {user.is_banned ? "Unban" : "Ban"}
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {tab === "reports" && (
        <div className="space-y-2">
          {reports.length > 0 ? reports.map((report) => (
            <GlassCard key={report.id} className="!p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/40 text-xs uppercase font-medium">{report.reason}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  report.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                  report.status === "resolved" ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/40"
                }`}>
                  {report.status}
                </span>
              </div>
              {report.description && <p className="text-white/60 text-sm mb-3">{report.description}</p>}
              {report.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => handleReportStatus(report.id, "resolved")} className="flex-1 py-2 rounded-lg glass text-green-400 text-xs font-medium">
                    Resolve
                  </button>
                  <button onClick={() => handleReportStatus(report.id, "dismissed")} className="flex-1 py-2 rounded-lg glass text-white/40 text-xs font-medium">
                    Dismiss
                  </button>
                </div>
              )}
            </GlassCard>
          )) : (
            <GlassCard className="text-center !py-8">
              <p className="text-white/30 text-sm">No reports</p>
            </GlassCard>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {tab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <GlassCard className="text-center">
              <p className="text-3xl font-bold gradient-text">{users.length}</p>
              <p className="text-white/30 text-xs mt-1">Total Users</p>
            </GlassCard>
            <GlassCard className="text-center">
              <p className="text-3xl font-bold gradient-text">{users.filter((u) => u.is_online).length}</p>
              <p className="text-white/30 text-xs mt-1">Online Now</p>
            </GlassCard>
            <GlassCard className="text-center">
              <p className="text-3xl font-bold gradient-text">{users.filter((u) => u.is_verified).length}</p>
              <p className="text-white/30 text-xs mt-1">Verified</p>
            </GlassCard>
            <GlassCard className="text-center">
              <p className="text-3xl font-bold gradient-text">{reports.filter((r) => r.status === "pending").length}</p>
              <p className="text-white/30 text-xs mt-1">Pending Reports</p>
            </GlassCard>
          </div>

          <GlassCard>
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Plan Distribution</p>
            {["free", "plus", "pro"].map((plan) => {
              const count = users.filter((u) => (u.plan || "free") === plan).length;
              const pct = users.length > 0 ? (count / users.length) * 100 : 0;
              return (
                <div key={plan} className="flex items-center gap-3 mb-3">
                  <span className="text-white/50 text-xs capitalize w-10">{plan}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full gradient-blue rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-white/30 text-xs w-8 text-right">{count}</span>
                </div>
              );
            })}
          </GlassCard>
        </div>
      )}
    </div>
  );
}