'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Cross-page launcher state for the project-chat bubble. The bubble is
 * mounted globally (per-role layout) and watches this context for the
 * "open with this project" intent. Using context keeps the wiring simple
 * — anywhere on the page (project card, header button, deep-link guard)
 * can call `openChatForProject(id)` without prop-drilling.
 *
 * URL search-param sync (?chat=<projectId>) is wired by the bubble itself
 * so deep-linking works without coupling listing pages to the router here.
 */
const ProjectChatLauncherContext = createContext({
  openChatForProject: () => {},
  closeChat: () => {},
  setActiveDetection: () => {},
  selectedProjectId: null,
  activeDetection: null,
  isOpen: false,
});

export function ProjectChatLauncherProvider({ children }) {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  // Detection-aware template auto-suggest: QC pages can publish the
  // currently-selected detection here so the bubble's composer knows about
  // it without listing pages prop-drilling through the launcher.
  const [activeDetection, setActiveDetection] = useState(null);

  const openChatForProject = useCallback((projectId) => {
    setSelectedProjectId(projectId || null);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      openChatForProject,
      closeChat,
      selectedProjectId,
      isOpen,
      activeDetection,
      setActiveDetection,
      setIsOpen,
      setSelectedProjectId,
    }),
    [openChatForProject, closeChat, selectedProjectId, isOpen, activeDetection]
  );

  return (
    <ProjectChatLauncherContext.Provider value={value}>
      {children}
    </ProjectChatLauncherContext.Provider>
  );
}

export function useProjectChatLauncher() {
  return useContext(ProjectChatLauncherContext);
}
