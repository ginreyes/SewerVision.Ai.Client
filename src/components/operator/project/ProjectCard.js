"use client";

/**
 * Operator ProjectCard shim.
 * Re-exports the shared ProjectCard with role="operator" baked in so that
 * existing call-sites (which never pass a `role` prop) keep working.
 */

import { memo } from "react";
import SharedProjectCard from "@/components/shared/ProjectCard";

const ProjectCard = memo((props) => (
  <SharedProjectCard role="operator" {...props} />
));

ProjectCard.displayName = "ProjectCard";

export default ProjectCard;
