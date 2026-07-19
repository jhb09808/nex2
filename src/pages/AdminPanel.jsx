import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Flag, BarChart3, Shield, BadgeCheck, Star, Ban, Check, X, Search, Eye, MapPin, AlertTriangle, Plus, Mail, Copy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";
import UserAvatar from "@/components/nex/UserAvatar";
import EmailListPanel from "@/components/nex/admin/EmailListPanel";
import GrowthDashboard from "@/components/nex/admin/GrowthDashboard";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("reports");
  const [users, setUsers] = useState([]);
  const [allRegisteredUsers, setAllRegisteredUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [zones, setZones] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newZone, setNewZone] = useState({ name: "", latitude: "", longitude: "", radius_miles: "0.25", restriction_reason: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [u, r, z, w, registered] = await Promise.all([
        base44.entities.UserProfile.list("-created_date", 50),
        base44.entities.Report.list("-created_date", 50),
        base44.entities.GeoZone.list("-created_date", 50),
        base44.entities.Waitlist.list("-created_date", 200),
        base44.entities.User.list("-created_date", 500),
      ]);
      setUsers(u);
      setAllRegisteredUsers(registered);
      // Sort reports: high severity first, then pending, then by date
      const sorted = [...r].sort((a, b) => {
        if (a.is_high_severity !== b.is_high_severity) return b.is_high_severity ? 1 : -1;
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (b.status === "pending" && a.status !== "pending") return 1;
        return 0;
      });
      setReports(sorted);
      setZones(z);
      setWaitlist(w);
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

  const handleToggleOg = async (userId, og) => {
    await base44.entities.UserProfile.update(userId, { is_og: og });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_og: og } : u)));
  };

  const handleReportStatus = async (reportId, status) => {
    await base44.entities.Report.update(reportId, { status });
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)));
  };

  const handleCreateZone = async () => {
    if (!newZone.name || !newZone.latitude || !newZone.longitude) return;
    try {
      await base44.entities.GeoZone.create({
        name: newZone.name,
        latitude: parseFloat(newZone.latitude),
        longitude: parseFloat(newZone.longitude),
        radius_miles: parseFloat(newZone.radius_miles) || 0.25,
        is_restricted: true,
        restriction_reason: newZone.restriction_reason || "Restricted area",
        created_by_admin_id: (await base44.auth.me()).id,
      });
      setNewZone({ name: "", latitude: "", longitude: "", radius_miles: "0.25", restriction_reason: "" });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleZone = async (zoneId, restricted) => {
    await base44.entities.GeoZone.update(zoneId, { is_restricted: restricted });
    setZones((prev) => prev.map((z) => (z.id === zoneId ? { ...z, is_restricted: restricted } : z)));
  };

  const handleWaitlistStatus = async (entry, status) => {
    if (status === "approved") {
      const res = await base44.functions.invoke("approveWaitlist", { entryId: entry.id });
      if (!res.data?.success) throw new Error(res.data?.error || "Approval failed");
      setWaitlist((prev) => prev.map((w) => (w.id === entry.id ? { ...w, status } : w)));
    } else {
      await base44.entities.Waitlist.update(entry.id, { status });
      setWaitlist((prev) => prev.map((w) => (w.id === entry.id ? { ...w, status } : w)));
    }
  };

  const copyEmail = (email) => {
    navigator.clipboard?.writeText(email);
  };

  const tabs = [
    { key: "reports", label: "Reports", icon: Flag },
    { key: "users", label: "Users", icon: Users },
    { key: "waitlist", label: "Waitlist", icon: Mail },
    { key: "emails", label: "Emails", icon: Mail },
    { key: "zones", label: "Zones", icon: MapPin },
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
                  <UserAvatar src={user.profile_photo} size="sm" isOnline={user.is_online} plan={user.plan} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-white text-sm font-medium truncate">{user.username}</p>
                      {user.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />}
                      {user.is_og && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />}
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
                    onClick={() => handleToggleOg(user.id, !user.is_og)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${user.is_og ? "bg-amber-500/20 text-amber-400" : "glass text-white/40"}`}
                  >
                    <Star className="w-3 h-3" />
                    {user.is_og ? "OG" : "Make OG"}
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
          {reports.filter((r) => r.is_high_severity).length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-xs font-medium">
                {reports.filter((r) => r.is_high_severity && r.status === "pending").length} high-severity reports require manual review
              </p>
            </div>
          )}
          {reports.length > 0 ? reports.map((report) => (
            <GlassCard key={report.id} className="!p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-xs uppercase font-medium">{report.reason}</span>
                  {report.is_high_severity && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> High
                    </span>
                  )}
                  {report.requires_manual_review && report.status === "pending" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">Manual review</span>
                  )}
                </div>
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

      {/* Waitlist Tab */}
      {tab === "waitlist" && (
        <div className="space-y-2">
          {waitlist.length > 0 ? waitlist.map((entry) => (
            <GlassCard key={entry.id} className="!p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{entry.email}</p>
                  <p className="text-white/30 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{entry.zip_code || "No ZIP"} · {new Date(entry.created_date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                  entry.status === "approved" ? "bg-green-500/20 text-green-400" :
                  entry.status === "rejected" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {entry.status}
                </span>
              </div>
              <div className="flex gap-2">
                {entry.status !== "approved" && (
                  <button
                    onClick={() => handleWaitlistStatus(entry, "approved")}
                    className="flex-1 py-2 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                )}
                {entry.status !== "rejected" && (
                  <button
                    onClick={() => handleWaitlistStatus(entry, "rejected")}
                    className="flex-1 py-2 rounded-lg glass text-red-400 text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                )}
                <button
                  onClick={() => copyEmail(entry.email)}
                  className="px-3 py-2 rounded-lg glass text-white/40 text-xs font-medium flex items-center justify-center"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </GlassCard>
          )) : (
            <GlassCard className="text-center !py-8">
              <p className="text-white/30 text-sm">No waitlist entries yet</p>
            </GlassCard>
          )}
        </div>
      )}

      {/* Emails Tab */}
      {tab === "emails" && (
        <EmailListPanel waitlist={waitlist} users={allRegisteredUsers} />
      )}

      {/* Zones Tab */}
      {tab === "zones" && (
        <div className="space-y-3">
          <GlassCard className="!p-4">
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Create restricted zone</p>
            <div className="space-y-2">
              <input
                value={newZone.name}
                onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                placeholder="Zone name (e.g. Near School)"
                className="w-full px-3 py-2.5 rounded-lg glass text-white text-sm placeholder:text-white/20 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={newZone.latitude}
                  onChange={(e) => setNewZone({ ...newZone, latitude: e.target.value })}
                  placeholder="Latitude"
                  type="number"
                  className="px-3 py-2.5 rounded-lg glass text-white text-sm placeholder:text-white/20 focus:outline-none"
                />
                <input
                  value={newZone.longitude}
                  onChange={(e) => setNewZone({ ...newZone, longitude: e.target.value })}
                  placeholder="Longitude"
                  type="number"
                  className="px-3 py-2.5 rounded-lg glass text-white text-sm placeholder:text-white/20 focus:outline-none"
                />
              </div>
              <input
                value={newZone.restriction_reason}
                onChange={(e) => setNewZone({ ...newZone, restriction_reason: e.target.value })}
                placeholder="Reason (e.g. School zone safety)"
                className="w-full px-3 py-2.5 rounded-lg glass text-white text-sm placeholder:text-white/20 focus:outline-none"
              />
              <button onClick={handleCreateZone} className="w-full py-2.5 rounded-lg gradient-blue text-white text-sm font-medium flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Zone
              </button>
            </div>
          </GlassCard>
          {zones.length > 0 ? zones.map((zone) => (
            <GlassCard key={zone.id} className="!p-3 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${zone.is_restricted ? "bg-red-500/20" : "bg-white/5"}`}>
                <MapPin className={`w-5 h-5 ${zone.is_restricted ? "text-red-400" : "text-white/40"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{zone.name}</p>
                <p className="text-white/30 text-xs">{zone.restriction_reason}</p>
              </div>
              <button
                onClick={() => handleToggleZone(zone.id, !zone.is_restricted)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${zone.is_restricted ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}
              >
                {zone.is_restricted ? "Restricted" : "Active"}
              </button>
            </GlassCard>
          )) : (
            <GlassCard className="text-center !py-8">
              <p className="text-white/30 text-sm">No zones</p>
            </GlassCard>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {tab === "analytics" && (
        <div className="space-y-4">
          <GrowthDashboard />
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