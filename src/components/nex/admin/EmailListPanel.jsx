import React, { useState, useMemo } from "react";
import { Mail, Copy, Check, Search, Download, Users, Clock, Phone } from "lucide-react";
import GlassCard from "@/components/nex/GlassCard";

export default function EmailListPanel({ waitlist, users }) {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const [filter, setFilter] = useState("all"); // all | waitlist | active | registered

  // Merge: waitlist emails + registered user emails (deduplicated)
  const allEmails = useMemo(() => {
    const seen = new Set();
    const list = [];

    waitlist.forEach((entry) => {
      const email = entry.email?.trim().toLowerCase();
      if (!email || seen.has(email)) return;
      seen.add(email);
      list.push({
        email: entry.email,
        phone: entry.phone,
        source: "waitlist",
        status: entry.status,
        zip_code: entry.zip_code,
        date: entry.created_date,
      });
    });

    users.forEach((u) => {
      const email = u.email?.trim().toLowerCase();
      if (!email || seen.has(email)) return;
      seen.add(email);
      list.push({
        email: u.email,
        phone: u.phone || "",
        source: "registered",
        status: u.is_banned ? "banned" : u.is_suspended ? "suspended" : "active",
        zip_code: u.zip_code,
        date: u.created_date,
      });
    });

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [waitlist, users]);

  const filtered = useMemo(() => {
    return allEmails.filter((e) => {
      if (filter === "waitlist" && e.source !== "waitlist") return false;
      if (filter === "active" && e.source !== "waitlist") return false;
      if (filter === "active" && e.status !== "active") return false;
      if (filter === "registered" && e.source !== "registered") return false;
      if (search && !e.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allEmails, search, filter]);

  const handleCopyAll = () => {
    const csv = filtered.map((e) => e.email).join(", ");
    navigator.clipboard?.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPhones = () => {
    const phones = filtered.filter((e) => e.phone).map((e) => e.phone).join(", ");
    if (!phones) return;
    navigator.clipboard?.writeText(phones);
    setPhoneCopied(true);
    setTimeout(() => setPhoneCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const header = "Email,Phone,Source,Status,ZIP,Signup Date\n";
    const rows = filtered
      .map((e) => `${e.email},${e.phone || ""},${e.source},${e.status || ""},${e.zip_code || ""},${new Date(e.date).toLocaleDateString()}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nex-emails-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyOne = (email) => {
    navigator.clipboard?.writeText(email);
  };

  const counts = {
    all: allEmails.length,
    waitlist: allEmails.filter((e) => e.source === "waitlist").length,
    active: allEmails.filter((e) => e.source === "waitlist" && e.status === "active").length,
    registered: allEmails.filter((e) => e.source === "registered").length,
  };

  const filterChips = [
    { key: "all", label: "All", icon: Mail, count: counts.all },
    { key: "waitlist", label: "Waitlist", icon: Clock, count: counts.waitlist },
    { key: "active", label: "Active", icon: Check, count: counts.active },
    { key: "registered", label: "Registered", icon: Users, count: counts.registered },
  ];

  return (
    <div className="space-y-3">
      {/* Bulk action bar */}
      <GlassCard strong className="!p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-semibold text-sm">All Emails</p>
            <p className="text-white/40 text-xs">{filtered.length} shown · {counts.all} total</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadCsv}
              className="px-3 py-2 rounded-lg glass text-white/60 text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={handleCopyPhones}
              className="px-3 py-2 rounded-lg glass text-white/60 text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              {phoneCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {phoneCopied ? "Copied!" : "Copy Phones"}
            </button>
            <button
              onClick={handleCopyAll}
              className="px-4 py-2 rounded-lg gradient-blue text-white text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Emails"}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="glass rounded-lg flex items-center gap-3 px-3 py-2.5 mb-3">
          <Search className="w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emails..."
            className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-white/30"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filterChips.map((chip) => {
            const Icon = chip.icon;
            return (
              <button
                key={chip.key}
                onClick={() => setFilter(chip.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                  filter === chip.key ? "gradient-blue text-white" : "glass text-white/40"
                }`}
              >
                <Icon className="w-3 h-3" />
                {chip.label}
                <span className={`text-[10px] ${filter === chip.key ? "text-white/70" : "text-white/30"}`}>
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Email list */}
      <div className="space-y-2">
        {filtered.length > 0 ? filtered.map((entry) => (
          <div
            key={entry.email}
            className="glass rounded-xl p-3 flex items-center gap-3 active:scale-[0.99] transition-transform cursor-pointer"
            onClick={() => handleCopyOne(entry.email)}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              entry.source === "registered" ? "bg-blue-500/15" : "bg-white/5"
            }`}>
              <Mail className={`w-4 h-4 ${entry.source === "registered" ? "text-blue-400" : "text-white/40"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{entry.email}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  entry.source === "registered"
                    ? "bg-blue-500/20 text-blue-400"
                    : entry.status === "active"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {entry.source === "registered" ? "User" : entry.status || "waitlist"}
                </span>
                {entry.phone && (
                  <span className="text-white/40 text-[11px] flex items-center gap-0.5">
                    <Phone className="w-2.5 h-2.5" />{entry.phone}
                  </span>
                )}
                {entry.zip_code && (
                  <span className="text-white/30 text-[11px]">{entry.zip_code}</span>
                )}
                <span className="text-white/30 text-[11px]">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Copy className="w-4 h-4 text-white/20 flex-shrink-0" />
          </div>
        )) : (
          <GlassCard className="text-center !py-8">
            <p className="text-white/30 text-sm">No emails found</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}