"use client";
import React, { useState, useEffect, useMemo } from "react";
import AddUserModal from "@/components/admin/users/user-management/AddUserModal";
import SendEmailModal from "@/components/admin/users/user-management/SendEmailModal";
import ChangePasswordModal from "@/components/admin/users/user-management/ChangePasswordModal";
import { api, getCookie } from "@/lib/helper";
import { useAlert } from "@/components/providers/AlertProvider";
import { useDialog } from "@/components/providers/DialogProvider";
import { useAllUsers } from "@/hooks/useQueryHooks";
import SewerTable from "@/components/ui/SewerTable";
import { useRouter } from "next/navigation";
import CardList from "@/components/admin/users/user-management/CardList";
import PermissionLevelsTab from "@/components/admin/users/permissions/PermissionLevelsTab";
import permissionLevelApi from "@/data/permissionLevelApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Users,
  Download,
  Mail,
  Power,
  Trash2,
  Shield,
  Activity,
  RefreshCw,
  Plus,
} from "lucide-react";

/* ─── action badge config (for audit logs) ─── */
const ACTION_BADGE = {
  created: "bg-emerald-100 text-emerald-700 border-emerald-200",
  updated: "bg-blue-100 text-blue-700 border-blue-200",
  deleted: "bg-red-100 text-red-700 border-red-200",
  enabled: "bg-emerald-100 text-emerald-700 border-emerald-200",
  disabled: "bg-amber-100 text-amber-700 border-amber-200",
  password: "bg-purple-100 text-purple-700 border-purple-200",
};

function getActionBadgeClass(action) {
  const key = Object.keys(ACTION_BADGE).find((k) => action?.toLowerCase().includes(k));
  return ACTION_BADGE[key] || "bg-gray-100 text-gray-700 border-gray-200";
}

/* ─── role badge config ─── */
const ROLE_BADGE = {
  admin: "bg-rose-100 text-rose-700 border-rose-200",
  user: "bg-red-100 text-red-700 border-red-200",
  operator: "bg-blue-100 text-blue-700 border-blue-200",
  "qc-technician": "bg-emerald-100 text-emerald-700 border-emerald-200",
  customer: "bg-amber-100 text-amber-700 border-amber-200",
  "customer-rep": "bg-teal-100 text-teal-700 border-teal-200",
};

/* ─── relative time helper ─── */
function formatRelativeTime(dateStr) {
  if (!dateStr || dateStr === "-") return "-";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

const UserPage = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ role: "", status: "" });
  const { showAlert } = useAlert();
  const { showDelete } = useDialog();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  // Build filter object for the TanStack Query hook
  const queryFilters = useMemo(() => ({
    page,
    limit,
    ...(search && { search }),
    ...(filters.role && filters.role !== "all" && { role: filters.role }),
    ...(filters.status && filters.status !== "all" && { status: filters.status }),
  }), [page, limit, search, filters]);

  const { data: usersData, isLoading: loading, refetch } = useAllUsers(queryFilters);

  const users = usersData?.users || [];
  const totalPages = usersData?.pagination?.totalPages || 1;
  const totalUsers = usersData?.pagination?.total || 0;

  const handleDelete = async (user_id) => {
    showDelete({
      title: "Delete User",
      description: "Are you sure it will be deleted to our system but you can create another one ?",
      onConfirm: async () => {
        try {
          const actorUsername = getCookie("username") || "unknown-admin";
          const actorRole = getCookie("role") || "admin";

          await api("/api/users/delete-account", "DELETE", {
            user_id,
            actorUsername,
            actorRole,
          });
          showAlert("User deleted", "success");
          refetch();
        } catch (error) {
          showAlert("Failed to delete user", "error");
        }
      },
      onCancel: () => showAlert("Cancelled", "info"),
    });
  };

  const filteredUsers = users.filter((u) => {
    if (filters.permission && filters.permission !== "all") {
      if (filters.permission === "default") {
        if (u.permissionLevel) return false;
      } else {
        if (u.permissionLevel?.name !== filters.permission) return false;
      }
    }
    return true;
  });

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedUserForEmail, setSelectedUserForEmail] = useState(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("users");

  // Permission levels count (fetched independently for accurate stats)
  const [permissionLevelCount, setPermissionLevelCount] = useState(0);

  // Fetch permission levels count for accurate stats
  useEffect(() => {
    const fetchPermissionLevelCount = async () => {
      try {
        const response = await permissionLevelApi.getAll();
        const raw = response?.data?.data ?? response?.data ?? response;
        const list = Array.isArray(raw) ? raw : [];
        setPermissionLevelCount(list.length);
      } catch (e) {
        console.error("Failed to fetch permission levels count:", e);
      }
    };
    fetchPermissionLevelCount();
  }, [activeTab]);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditFilters, setAuditFilters] = useState({ action: "all" });
  const [auditSearch, setAuditSearch] = useState("");
  const [auditTotal, setAuditTotal] = useState(0);

  // Cache user list for resolving actor names
  const [userMap, setUserMap] = useState({});

  const handleDisable = async (item) => {
    const userId = item.user.user_id;
    const currentStatus = item.status === "Active";
    const newActive = !currentStatus;

    try {
      const { ok } = await api("/api/users/change-info", "PUT", {
        user_id: userId,
        active: newActive,
      });

      if (ok) {
        showAlert(newActive ? "User enabled" : "User disabled", "success");
        refetch();
      } else {
        showAlert("Failed to update status", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("Failed to update status", "error");
    }
  };

  const handleOpenEmailModal = (item) => {
    setSelectedUserForEmail(item);
    setEmailModalOpen(true);
  };

  const handleSendEmail = async (subject, message) => {
    if (!selectedUserForEmail) return;
    try {
      const { ok } = await api("/api/users/send-email", "POST", {
        user_id: selectedUserForEmail.user.user_id,
        subject,
        message,
      });
      if (ok) showAlert("Email sent successfully", "success");
      else showAlert("Failed to send email", "error");
    } catch (err) {
      console.error(err);
      showAlert("Error sending email", "error");
    }
  };

  const handleOpenPasswordModal = (item) => {
    setSelectedUserForPassword(item);
    setPasswordModalOpen(true);
  };

  const handleChangePassword = async (newPassword) => {
    if (!selectedUserForPassword) return;
    const { ok, data } = await api("/api/users/admin-change-password", "POST", {
      user_id: selectedUserForPassword.user.user_id,
      newPassword,
    });
    if (ok) showAlert("Password changed successfully. User has been notified via email.", "success");
    else throw new Error(data?.message || "Failed to change password");
  };

  /* ───── User Management table config ───── */

  const userColumns = [
    { key: "user", name: "USER" },
    { key: "roleTag", name: "ROLE" },
    { key: "permissionLevel", name: "PERMISSION" },
    { key: "status", name: "STATUS" },
  ];

  const getRoleBadge = (u) => {
    const role = (u.role || "").toLowerCase();

    const classes = ROLE_BADGE[role] || "bg-gray-100 text-gray-700 border-gray-200";
    
    const labels = { 
      admin: "Admin", user: "User", operator: "Operator", "qc-technician": "QC Technician", customer: "Customer", "customer-rep": "Customer Representative"
     };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${classes}`}>
        {labels[role] || u.role}
      </span>
    );
  };

  const tableData = filteredUsers.map((u) => ({
    user: {
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      user_id: u.user_id,
    },
    roleTag: getRoleBadge(u),
    role: u.role,
    permissionLevel: u.permissionLevel?.name || null,
    permissionLevelId: u.permissionLevel?._id || null,
    status: u.status,
  }));

  // Collect unique permission level names for filter
  const permissionLevelNames = [...new Set(
    users.map((u) => u.permissionLevel?.name).filter(Boolean)
  )];

  const renderUserCell = (item, col) => {
    if (col.key === "permissionLevel") {
      if (!item.permissionLevel) {
        return <span className="text-xs text-gray-400 italic">Default Access</span>;
      }
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">
          {item.permissionLevel}
        </span>
      );
    }
    return null; 
  };

  const filterOptions = [
    {
      key: "role",
      label: "Role",
      options: [
        { label: "Show All", value: "all" },
        { label: "Admin", value: "admin" },
        { label: "Customer", value: "customer" },
        { label: "QC Technician", value: "qc-technician" },
        { label: "Operator", value: "operator" },
        { label: "Management User", value: "user" },
      ],
    },
    {
      key: "permission",
      label: "Permission",
      options: [
        { label: "Show All", value: "all" },
        { label: "Default Access", value: "default" },
        ...permissionLevelNames.map((name) => ({ label: name, value: name })),
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Show All", value: "all" },
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
        { label: "Pending", value: "Pending" },
      ],
    },
  ];

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  // Bulk actions
  const handleBulkDisable = async () => {
    if (selectedUsers.length === 0) return showAlert("Please select users first", "warning");
    showDelete({
      title: "Disable Selected Users",
      description: `Are you sure you want to disable ${selectedUsers.length} user(s)?`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedUsers.map((userId) => api("/api/users/change-info", "PUT", { user_id: userId, active: false })));
          showAlert(`Successfully disabled ${selectedUsers.length} user(s)`, "success");
          setSelectedUsers([]);
          refetch();
        } catch (err) {
          showAlert("Failed to disable users", "error");
        }
      },
      onCancel: () => showAlert("Cancelled", "info"),
    });
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return showAlert("Please select users first", "warning");
    showDelete({
      title: "Delete Selected Users",
      description: `Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedUsers.map((userId) => api("/api/users/delete-account", "DELETE", { user_id: userId })));
          showAlert(`Successfully deleted ${selectedUsers.length} user(s)`, "success");
          setSelectedUsers([]);
          refetch();
        } catch (err) {
          showAlert("Failed to delete users", "error");
        }
      },
      onCancel: () => showAlert("Cancelled", "info"),
    });
  };

  const handleBulkEmail = () => {
    if (selectedUsers.length === 0) return showAlert("Please select users first", "warning");
    showAlert(`Bulk email feature for ${selectedUsers.length} user(s) - Coming soon!`, "info");
  };

  const handleExportSelected = () => {
    if (selectedUsers.length === 0) return showAlert("Please select users first", "warning");
    const selectedData = users.filter((u) => selectedUsers.includes(u.user_id || u._id));
    const csvContent = [["Name", "Email", "Role", "Status"], ...selectedData.map((u) => [u.name, u.email, u.role, u.status])]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `selected_users_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    showAlert(`Exported ${selectedUsers.length} user(s)`, "success");
  };

  /* ───── Audit Logs ───── */

  const fetchAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const params = new URLSearchParams({
        page: auditPage.toString(),
        limit: "25",
        ...(auditFilters.action && auditFilters.action !== "all" && { action: auditFilters.action }),
      });

      const { ok, data } = await api(`/api/audit/user-management?${params.toString()}`, "GET");
      if (ok && Array.isArray(data.logs)) {
        setAuditLogs(data.logs);
        setAuditTotalPages(data.pagination?.totalPages || 1);
        setAuditTotal(data.pagination?.total || data.logs.length);
      } else {
        setAuditLogs([]);
      }
    } catch (err) {
      console.error("Fetch audit logs error:", err);
      showAlert("Failed to load audit logs", "error");
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  };

  // Build username → { name, avatar } map from loaded users
  useEffect(() => {
    if (users.length > 0) {
      const map = {};
      users.forEach((u) => {
        const entry = { name: u.name || u.username, avatar: u.avatar || null };
        if (u.username) map[u.username] = entry;
        if (u.name) map[u.name] = entry;
      });
      setUserMap(map);
    }
  }, [users]);

  useEffect(() => {
    if (activeTab !== "audit") return;
    fetchAuditLogs();
  }, [activeTab, auditPage, auditFilters]);

  const auditStats = {
    created: auditLogs.filter((l) => l.action?.includes("created")).length,
    updated: auditLogs.filter((l) => l.action?.includes("updated")).length,
    deleted: auditLogs.filter((l) => l.action?.includes("deleted")).length,
  };

  /* ─── audit table columns & data ─── */
  const auditColumns = [
    { key: "time", name: "TIMESTAMP" },
    { key: "action", name: "ACTION" },
    { key: "target", name: "TARGET USER" },
    { key: "performedBy", name: "PERFORMED BY" },
  ];

  const resolveUser = (identifier) => {
    if (!identifier) return { name: "System", avatar: null };
    const entry = userMap[identifier];
    if (entry) return entry;
    return { name: identifier, avatar: null };
  };

  const auditTableData = auditLogs
    .filter((log) => {
      if (!auditSearch) return true;
      const q = auditSearch.toLowerCase();
      const target = log.targetSnapshot || {};
      return (
        (log.actor && log.actor.toLowerCase().includes(q)) ||
        (target.username && target.username.toLowerCase().includes(q)) ||
        (target.email && target.email.toLowerCase().includes(q))
      );
    })
    .map((log) => {
      const actionStr = log.action ? log.action.replace("user_", "").replace(/_/g, " ") : "-";
      const actorInfo = resolveUser(log.actor);
      const targetInfo = resolveUser(log.targetSnapshot?.username);

      return {
        id: log._id || `${log.action}-${log.createdAt}`,
        time: log.createdAt || "-",
        action: actionStr,
        target: {
          username: log.targetSnapshot?.username,
          email: log.targetSnapshot?.email,
          role: log.targetSnapshot?.role,
          avatar: targetInfo.avatar,
        },
        performedBy: {
          name: actorInfo.name,
          username: log.actor || "System",
          avatar: actorInfo.avatar,
        },
      };
    });

  /* ─── custom cell renderer for audit table ─── */
  const renderAuditCell = (item, col) => {
    if (col.key === "time") {
      return (
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{formatRelativeTime(item.time)}</p>
          <p className="text-[11px] text-gray-400 truncate">
            {item.time !== "-" ? new Date(item.time).toLocaleString() : "-"}
          </p>
        </div>
      );
    }

    if (col.key === "action") {
      const badgeClass = getActionBadgeClass(item.action);
      const label = item.action.charAt(0).toUpperCase() + item.action.slice(1);
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}>
          {label}
        </span>
      );
    }

    if (col.key === "target") {
      if (!item.target?.username) return <span className="text-sm text-gray-400 italic">—</span>;
      const avatarUrl = item.target.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.target.username)}&background=random&color=fff`;
      const roleBadge = item.target.role
        ? ROLE_BADGE[item.target.role.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200"
        : null;
      return (
        <div className="flex items-center gap-3 min-w-0">
          <img src={avatarUrl} alt={item.target.username} className="w-9 h-9 rounded-full object-cover shadow-sm flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{item.target.username}</div>
            <div className="flex items-center gap-1.5">
              {item.target.email && <span className="text-xs text-gray-500 truncate">{item.target.email}</span>}
              {roleBadge && (
                <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${roleBadge}`}>
                  {item.target.role}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (col.key === "performedBy") {
      const pb = item.performedBy;
      const avatarUrl = pb.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(pb.name || "S")}&background=random&color=fff`;
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={avatarUrl} alt={pb.name} className="w-8 h-8 rounded-full object-cover shadow-sm flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-700 truncate">{pb.name}</div>
            {pb.name !== pb.username && (
              <div className="text-[11px] text-gray-400 truncate">@{pb.username}</div>
            )}
          </div>
        </div>
      );
    }

    return null; // fallback to default rendering
  };

  /* ─── permission stats ─── */
  const permissionStats = {
    total: permissionLevelCount,
    assigned: users.filter((u) => u.permissionLevel).length,
    unassigned: users.filter((u) => !u.permissionLevel && u.role !== 'admin').length,
  };

  /* ─── dynamic page title ─── */
  const pageTitles = {
    users: { title: "User Management", desc: "Manage users, roles, and permissions across your organization" },
    audit: { title: "Audit Logs", desc: "Track all user management actions across your organization" },
    permissions: { title: "Permission Levels", desc: "Create and manage module access levels for each role" },
  };

  const pageTitle = pageTitles[activeTab]?.title || "User Management";
  const pageDescription = pageTitles[activeTab]?.desc || "";

  return (
    <div className="max-w-7xl mx-auto bg-gray-100">
      {/* Header — title changes based on tab */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                activeTab === "audit" ? "bg-blue-100" : activeTab === "permissions" ? "bg-amber-100" : "bg-rose-100"
              }`}>
                {activeTab === "audit" ? (
                  <Activity className="w-6 h-6 text-blue-600" />
                ) : activeTab === "permissions" ? (
                  <Shield className="w-6 h-6 text-amber-600" />
                ) : (
                  <Users className="w-6 h-6 text-rose-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
                <p className="text-sm text-gray-500">{pageDescription}</p>
              </div>
            </div>
            {activeTab === "users" && (
              <div className="flex items-center gap-3">
                <AddUserModal fetchUser={refetch} />
              </div>
            )}
            {activeTab === "audit" && (
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAuditLogs}
                disabled={auditLoading}
                className="gap-2 h-9 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            )}

            {activeTab === 'permissions' && (
              <Button onClick={() => router.push("/admin/users/permissions/create")} variant='rose'>
                <Plus className="w-4 h-4 mr-1.5" />
                Create Level
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <CardList activeTab={activeTab} auditStats={auditStats} permissionStats={permissionStats} />
      </div>

      {/* Main Content with Tabs */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-100 px-6 pt-4">
              <TabsList className="bg-gray-50/50 p-1">
                <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-rose-600">
                  <Users className="w-4 h-4" />
                  User Management
                </TabsTrigger>
                <TabsTrigger value="audit" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-rose-600">
                  <Activity className="w-4 h-4" />
                  Audit Logs
                </TabsTrigger>
                <TabsTrigger value="permissions" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-rose-600">
                  <Shield className="w-4 h-4" />
                  Permission Levels
                </TabsTrigger>
              </TabsList>
            </div>

            {/* User Management Tab */}
            <TabsContent value="users" className="p-0 m-0">
              {selectedUsers.length > 0 && (
                <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                          {selectedUsers.length}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {selectedUsers.length === 1 ? "user" : "users"} selected
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={handleExportSelected} className="gap-2 h-9 text-xs bg-white hover:bg-gray-50">
                        <Download className="w-4 h-4" /> Export
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleBulkEmail} className="gap-2 h-9 text-xs bg-white hover:bg-gray-50">
                        <Mail className="w-4 h-4" /> Email All
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleBulkDisable} className="gap-2 h-9 text-xs bg-white hover:bg-gray-50">
                        <Power className="w-4 h-4" /> Disable
                      </Button>
                      <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="gap-2 h-9 text-xs">
                        <Trash2 className="w-4 h-4" /> Delete
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedUsers([])} className="h-9 text-xs">
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <SewerTable
                data={tableData}
                columns={userColumns}
                filters={filterOptions}
                search={search}
                onSearch={setSearch}
                onFilterChange={handleFilterChange}
                loading={loading}
                renderCell={renderUserCell}
                onDelete={handleDelete}
                onDisable={handleDisable}
                onEmail={handleOpenEmailModal}
                onChangePassword={handleOpenPasswordModal}
                onView={(item) => router.push(`/admin/users/${item.user.user_id}`)}
                selectedRows={selectedUsers}
                onSelectionChange={setSelectedUsers}
                columnDefaults={{ user: 280, roleTag: 160, status: 120 }}
                emptyMessage="No users found"
              />
            </TabsContent>

            {/* Audit Logs Tab — uses SewerTable with custom cell renderer */}
            <TabsContent value="audit" className="p-0 m-0">
              <SewerTable
                data={auditTableData}
                columns={auditColumns}
                filters={[
                  {
                    key: "action",
                    label: "Action",
                    options: [
                      { label: "All actions", value: "all" },
                      { label: "User created", value: "user_created" },
                      { label: "User updated", value: "user_updated" },
                      { label: "User deleted", value: "user_deleted" },
                    ],
                  },
                ]}
                search={auditSearch}
                onSearch={setAuditSearch}
                onFilterChange={(key, val) => {
                  if (key === "action") {
                    setAuditFilters({ action: val });
                    setAuditPage(1);
                  }
                }}
                loading={auditLoading}
                renderCell={renderAuditCell}
                showCheckbox={false}
                showActions={false}
                showCsvActions={true}
                getRowId={(item) => item.id}
                columnDefaults={{ time: 180, action: 140, target: 280, performedBy: 200 }}
                emptyMessage="No audit logs found"
                emptySubtext="Activity will appear here as changes are made"
                rowsPerPageOptions={[10, 25, 50]}
              />
            </TabsContent>

            {/* Permission Levels Tab */}
            <TabsContent value="permissions" className="p-6 m-0">
              <PermissionLevelsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <SendEmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onSend={handleSendEmail}
        recipientName={selectedUserForEmail?.user?.name || "User"}
      />

      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
        user={selectedUserForPassword}
      />
    </div>
  );
};

export default UserPage;
