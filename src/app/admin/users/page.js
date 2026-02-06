"use client";
import React, { useState, useEffect } from "react";
import AddUserModal from "./AddUserModal";
import SendEmailModal from "./SendEmailModal";
import { api } from "@/lib/helper";
import { useAlert } from "@/components/providers/AlertProvider";
import { useDialog } from "@/components/providers/DialogProvider";
import SewerTable from "@/components/ui/SewerTable";
import { useRouter } from "next/navigation";
import CardList from "./CardList";
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
  Activity
} from "lucide-react";

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: "", plan: "", status: "" });
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
        ...(filters.plan && filters.plan !== 'all' && { plan: filters.plan }),
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
          await api("/api/users/delete-account", "DELETE", { user_id });
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



  // Server-side filtering now, so no client-side filtering needed
  // But keep for any remaining client-side operations
  const filteredUsers = users;

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedUserForEmail, setSelectedUserForEmail] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("users");

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
    { key: "role", name: "ROLE" },
    { key: "plan", name: "PLAN" },
    { key: "billing", name: "BILLING" },
    { key: "status", name: "STATUS" },
  ];

  const tableData = filteredUsers.map((u) => ({
    user: {
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      user_id: u.user_id,
    },
    role: u.role,
    plan: u.plan,
    billing: u.billing || "N/A",
    status: u.status,
  }));

  const filterOptions = [{
    key: "role",
    label: "Role",
    options: [
      { label: "Show All", value: "all" },
      { label: "Admin", value: "admin" },
      { label: "Customer", value: "customer" },
      { label: "QC Technician", value: "Qc-Technician" },
      { label: "Operator", value: "Operator" },
    ],
  },
  {
    key: "plan",
    label: "Plan",
    options: [
      { label: "Show All", value: "all" },
      { label: "Enterprise", value: "Enterprise" },
      { label: "Basic", value: "Basic" },
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
      ["Name", "Email", "Role", "Status", "Plan"],
      ...selectedData.map(u => [u.name, u.email, u.role, u.status, u.plan])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `selected_users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showAlert(`Exported ${selectedUsers.length} user(s)`, "success");
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
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-purple-100 mb-4">
                  <Activity className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Audit Logs Coming Soon
                </h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
                  Track all user management activities including logins, role changes,
                  account modifications, and system access. Full audit trail will be available here.
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>User Actions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>System Events</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Security Alerts</span>
                  </div>
                </div>
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
