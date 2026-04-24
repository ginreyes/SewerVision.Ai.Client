// Back-compat: the admin overtime approval page component was superseded by
// the shared OvertimeApprovalList. Re-export the shared one under the old
// name so any lingering imports keep working.
export { OvertimeApprovalList as OvertimeApprovalPage } from "@/components/shared/overtime";
