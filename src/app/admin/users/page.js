"use client";
import React, { useState, useEffect } from "react";
import AddUserModal from "./components/AddUserModal";
import SendEmailModal from "./components/SendEmailModal";
import { api, getCookie } from "@/lib/helper";
import { useAlert } from "@/components/providers/AlertProvider";
import { useDialog } from "@/components/providers/DialogProvider";
import SewerTable from "@/components/ui/SewerTable";
import AuditTable from "@/components/ui/AuditTable";
import { useRouter } from "next/navigation";
import CardList from "./components/CardList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Download,
  Mail,
  Power,
  Trash2,
  Shield,
  Activity,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: "", status: "" });
  const { showAlert } = useAlert();
  const { showDelete } = useDialog();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page, search, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(filters.role && filters.role !== 'all' && { role: filters.role }),
        ...(filters.status && filters.status !== 'all' && { status: filters.status }),
      });

      const { ok, data } = await api(`/api/users/get-all-user?${queryParams}`, "GET");

      if (ok && Array.isArray(data.users)) {
        setUsers(data.users);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalUsers(data.pagination?.total || 0);
      }
      else {
        console.error("Failed to fetch users or users is not an array");
        setUsers([]);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user_id) => {
    showDelete({
      title: "Delete User",
      description:
        "Are you sure it will be deleted to our system but you can create another one ?",
      onConfirm: async () => {
        try {
          const actorUsername = getCookie("username") || "unknown-admin";
          const actorRole = getCookie("role") || "admin";

          await api("/api/users/delete-account", "DELETE", {
            user_id,
            actorUsername,
            actorRole,
          });
          setUsers((prev) => prev.filter((u) => u._id !== user_id));
          showAlert("User deleted", "success");
          fetchUsers();
        } catch (error) {
          showAlert("Failed to delete user", "error");
        }
      },
      onCancel: () => showAlert("Cancelled", "info"),
    });
  };

  const filteredUsers = users;

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedUserForEmail, setSelectedUserForEmail] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("users");

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditFilters, setAuditFilters] = useState({ action: "all" });
  const [auditSearch, setAuditSearch] = useState("");
  const [auditTotal, setAuditTotal] = useState(0);

  const handleDisable = async (item) => {
    const userId = item.user.user_id;
    const currentStatus = item.status === 'Active';
    const newActive = !currentStatus;

    try {
      const { ok } = await api('/api/users/change-info', 'PUT', {
        user_id: userId,
        active: newActive
      });

      if (ok) {
        setUsers(prev => prev.map(u => {
          if (u._id === userId || u.user_id === userId) {
            return { ...u, active: newActive, status: newActive ? 'Active' : 'Inactive' };
          }
          return u;
        }));
        showAlert(newActive ? "User enabled" : "User disabled", "success");
      } else {
        showAlert("Failed to update status", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("Failed to update status", "error");
    }
  }

  const handleOpenEmailModal = (item) => {
    setSelectedUserForEmail(item);
    setEmailModalOpen(true);
  }

  const handleSendEmail = async (subject, message) => {
    if (!selectedUserForEmail) return;
    try {
      const { ok } = await api('/api/users/send-email', 'POST', {
        user_id: selectedUserForEmail.user.user_id,
        subject,
        message
      });

      if (ok) {
        showAlert("Email sent successfully", "success");
      } else {
        showAlert("Failed to send email", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error sending email", "error");
    }
  }

  const columns = [
    { key: "user", name: "USER" },
    { key: "roleTag", name: "ROLE" },
    { key: "status", name: "STATUS" },
  ];

  const getRoleBadge = (u) => {
    const role = (u.role || "").toLowerCase();
    let label = u.role;
    let classes =
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-700 border-gray-200";

    if (role === "admin") {
      label = "Admin";
      classes =
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-rose-100 text-rose-700 border-rose-200";
    } else if (role === "user") {
      label = "User";
      classes =
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-200";
    } else if (role === "operator") {
      label = "Operator";
      classes =
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-700 border-blue-200";
    } else if (role === "qc-technician") {
      label = "QC Technician";
      classes =
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-100 text-emerald-700 border-emerald-200";
    } else if (role === "customer") {
      label = "Customer";
      classes =
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-amber-100 text-amber-700 border-amber-200";
    }

    return <span className={classes}>{label}</span>;
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
    status: u.status,
  }));

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
    if (selectedUsers.length === 0) {
      showAlert("Please select users first", "warning");
      return;
    }

    showDelete({
      title: "Disable Selected Users",
      description: `Are you sure you want to disable ${selectedUsers.length} user(s)?`,
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedUsers.map((userId) =>
              api('/api/users/change-info', 'PUT', {
                user_id: userId,
                active: false
              })
            )
          );
          showAlert(`Successfully disabled ${selectedUsers.length} user(s)`, "success");
          setSelectedUsers([]);
          fetchUsers();
        } catch (err) {
          showAlert("Failed to disable users", "error");
        }
      },
      onCancel: () => showAlert("Cancelled", "info"),
    });
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      showAlert("Please select users first", "warning");
      return;
    }

    showDelete({
      title: "Delete Selected Users",
      description: `Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedUsers.map((userId) =>
              api("/api/users/delete-account", "DELETE", { user_id: userId })
            )
          );
          showAlert(`Successfully deleted ${selectedUsers.length} user(s)`, "success");
          setSelectedUsers([]);
          fetchUsers();
        } catch (err) {
          showAlert("Failed to delete users", "error");
        }
      },
      onCancel: () => showAlert("Cancelled", "info"),
    });
  };

  const handleBulkEmail = () => {
    if (selectedUsers.length === 0) {
      showAlert("Please select users first", "warning");
      return;
    }
    showAlert(`Bulk email feature for ${selectedUsers.length} user(s) - Coming soon!`, "info");
  };

  const handleExportSelected = () => {
    if (selectedUsers.length === 0) {
      showAlert("Please select users first", "warning");
      return;
    }

    const selectedData = users.filter(u => selectedUsers.includes(u.user_id || u._id));
    const csvContent = [
      ["Name", "Email", "Role", "Status"],
      ...selectedData.map(u => [u.name, u.email, u.role, u.status])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `selected_users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showAlert(`Exported ${selectedUsers.length} user(s)`, "success");
  };

  // Fetch audit logs
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

  useEffect(() => {
    if (activeTab !== "audit") return;
    fetchAuditLogs();
  }, [activeTab, auditPage, auditFilters]);

  // Compute audit summary stats
  const auditStats = {
    total: auditTotal,
    created: auditLogs.filter((l) => l.action?.includes("created")).length,
    updated: auditLogs.filter((l) => l.action?.includes("updated")).length,
    deleted: auditLogs.filter((l) => l.action?.includes("deleted")).length,
  };

  return (
    <div className="max-w-7xl mx-auto bg-gray-100">
      {/* Clean Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-500">
                  Manage users, roles, and permissions across your organization
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AddUserModal fetchUser={fetchUsers} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <CardList />
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
              </TabsList>
            </div>

            {/* User Management Tab */}
            <TabsContent value="users" className="p-0 m-0">
              {/* Bulk Actions Bar */}
              {selectedUsers.length > 0 && (
                <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                          {selectedUsers.length}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {selectedUsers.length === 1 ? 'user' : 'users'} selected
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExportSelected}
                        className="gap-2 h-9 text-xs bg-white hover:bg-gray-50"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBulkEmail}
                        className="gap-2 h-9 text-xs bg-white hover:bg-gray-50"
                      >
                        <Mail className="w-4 h-4" />
                        Email All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBulkDisable}
                        className="gap-2 h-9 text-xs bg-white hover:bg-gray-50"
                      >
                        <Power className="w-4 h-4" />
                        Disable
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleBulkDelete}
                        className="gap-2 h-9 text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedUsers([])}
                        className="h-9 text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <SewerTable
                data={tableData}
                columns={columns}
                filters={filterOptions}
                search={search}
                onSearch={setSearch}
                onFilterChange={handleFilterChange}
                loading={loading}
                ButtonPlacement={null}
                onDelete={handleDelete}
                onDisable={handleDisable}
                onEmail={handleOpenEmailModal}
                onView={(item) => {
                  router.push(`/admin/users/${item.user.user_id}`);
                }}
                selectedRows={selectedUsers}
                onSelectionChange={setSelectedUsers}
              />
            </TabsContent>

            {/* Audit Logs Tab */}
            <TabsContent value="audit" className="p-6">
              <div className="space-y-5">
                {/* Audit Header with Stats */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Track all user management actions across your organization
                    </p>
                  </div>
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
                </div>

                {/* Mini Stats Row */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Total Events", value: auditStats.total, color: "bg-gray-100 text-gray-700" },
                    { label: "Created", value: auditStats.created, color: "bg-emerald-50 text-emerald-700" },
                    { label: "Updated", value: auditStats.updated, color: "bg-blue-50 text-blue-700" },
                    { label: "Deleted", value: auditStats.deleted, color: "bg-red-50 text-red-700" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={`${stat.color} rounded-lg px-4 py-3 flex items-center justify-between`}
                    >
                      <span className="text-xs font-medium opacity-80">{stat.label}</span>
                      <span className="text-lg font-bold">{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Audit Table */}
                <AuditTable
                  data={auditLogs
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
                    .map((log) => ({
                      id: log._id || `${log.action}-${log.createdAt}`,
                      time: log.createdAt
                        ? new Date(log.createdAt).toLocaleString()
                        : "-",
                      action: log.action
                        ? log.action.replace("user_", "").replace("_", " ")
                        : "-",
                      target: {
                        username: log.targetSnapshot?.username,
                        email: log.targetSnapshot?.email,
                        role: log.targetSnapshot?.role,
                      },
                      actor: log.actor || "admin-panel",
                    }))}
                  columns={[
                    { key: "time", name: "TIME" },
                    { key: "action", name: "ACTION" },
                    { key: "target", name: "TARGET USER" },
                    { key: "actor", name: "ACTOR" },
                  ]}
                  loading={auditLoading}
                  currentPage={auditPage}
                  totalPages={auditTotalPages}
                  onPageChange={setAuditPage}
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
                />
              </div>
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
    </div>
  );
};

export default UserPage;