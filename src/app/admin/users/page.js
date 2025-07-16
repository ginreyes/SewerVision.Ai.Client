"use client";
import React, { useState, useEffect } from "react";
import AddUserModal from "./AddUserModal";
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { ok, data } = await api("/api/users/get-all-user", "GET");
      
      if (ok && Array.isArray(data.users)) {
        setUsers(data.users);
      } 
      else {
        console.error("Failed to fetch users or users is not an array");
        setUsers([]); // fail-safe
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



  const filteredUsers = users.filter((u) => {
    // Search filter - check multiple fields for better search experience
    const matchesSearch = search ? (
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
    ) : true;
  
    // Role filter - "all" means show all roles
    const matchesRole = filters.role && filters.role !== "all" ? u.role === filters.role : true;
  
    // Plan filter - "all" means show all plans
    const matchesPlan = filters.plan && filters.plan !== "all" ? u.plan === filters.plan : true;
  
    // Status filter - "all" means show all statuses
    const matchesStatus = filters.status && filters.status !== "all" ? (
      filters.status === "Active" ? u.active === true :
      filters.status === "Inactive" ? u.active === false :
      filters.status === "Pending" ? u.active === null || u.active === undefined :
      true
    ) : true;
  
    return matchesSearch && matchesRole && matchesPlan && matchesStatus;
  });
  

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

  const filterOptions = [
    {
      key: "role",
      label: "Role",
      options: [
        { label: "Show All", value: "all" },
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
        { label: "Viewer", value: "viewer" },
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
        ButtonPlacement={<AddUserModal fetchUser = {fetchUsers} />}
        onDelete={handleDelete}
        onView={(item) => {
          router.push(`/admin/users/${item.user.user_id}`);
        }}
      />
    </div>
  );
};

export default UserPage;
