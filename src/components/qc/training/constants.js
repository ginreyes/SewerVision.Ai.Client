/**
 * QC Training module constants.
 * Shared across DefectExercisePlayer, BoundingBoxCanvas, and training pages.
 */

/** Standard PACP defect codes for training exercises */
export const PACP_TYPES = [
  { code: "FSL", label: "Fracture - Longitudinal", type: "fracture" },
  { code: "CL", label: "Crack - Longitudinal", type: "crack" },
  { code: "CC", label: "Crack - Circumferential", type: "crack" },
  { code: "RO", label: "Root - Fine", type: "root" },
  { code: "ROB", label: "Root - Ball", type: "root" },
  { code: "DE", label: "Deposit - Settled", type: "blockage" },
  { code: "OB", label: "Obstruction", type: "blockage" },
  { code: "CR", label: "Corrosion", type: "corrosion" },
  { code: "BL", label: "Broken Pipe", type: "broken_pipe" },
  { code: "IS", label: "Infiltration - Seeper", type: "infiltration" },
  { code: "ACB", label: "Access Point - Catch Basin", type: "access_point_manhole" },
];

/** Defect type color map for bounding box overlays */
export const DEFECT_TYPE_COLORS = {
  fracture: "#ef4444",
  crack: "#f97316",
  root: "#22c55e",
  blockage: "#a855f7",
  corrosion: "#eab308",
  broken_pipe: "#dc2626",
  infiltration: "#3b82f6",
  access_point_manhole: "#14b8a6",
};
