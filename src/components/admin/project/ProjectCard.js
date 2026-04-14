"use client";

/**
 * Admin ProjectCard shim.
 * Re-exports the shared ProjectCard with role="admin" baked in so that
 * existing call-sites (which never pass a `role` prop) keep working.
 */

import { memo } from "react";
import SharedProjectCard from "@/components/shared/ProjectCard";

const ProjectCard = memo((props) => (
  <SharedProjectCard role="admin" {...props} />
));

ProjectCard.displayName = "ProjectCard";

export default ProjectCard;
