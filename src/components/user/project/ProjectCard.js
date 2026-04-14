"use client";

/**
 * User (Team Lead) ProjectCard shim.
 * Re-exports the shared ProjectCard with role="user" baked in so that
 * existing call-sites (which never pass a `role` prop) keep working.
 */

import { memo } from "react";
import SharedProjectCard from "@/components/shared/ProjectCard";

const ProjectCard = memo((props) => (
  <SharedProjectCard role="user" {...props} />
));

ProjectCard.displayName = "ProjectCard";

export default ProjectCard;
