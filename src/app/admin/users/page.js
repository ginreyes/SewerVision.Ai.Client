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

  return (
    <div className="">
      <CardList />

      <SewerTable
        data={tableData}
        columns={columns}
        filters={filterOptions}
        search={search}
        onSearch={setSearch}
        onFilterChange={handleFilterChange}
        loading={loading}
        ButtonPlacement={<AddUserModal fetchUser={fetchUsers} />}
        onDelete={handleDelete}
        onDisable={handleDisable}
        onEmail={handleOpenEmailModal}
        onView={(item) => {
          router.push(`/admin/users/${item.user.user_id}`);
        }}
      />

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
