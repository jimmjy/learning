import { useState, useEffect, useCallback } from "react";
import {
  getAllProjects,
  createProject,
  deleteProject,
} from "../services/project";
import { deleteInspiration } from "../services/inspiration";

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allProjects = await getAllProjects();
      setProjects(allProjects);
    } catch (err) {
      setError(err?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = useCallback(async (projectData) => {
    try {
      const newProject = await createProject({
        name: projectData.name.trim(),
        description: projectData.description?.trim() || "",
        inspirations: [],
      });
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    } catch (err) {
      console.error("Error creating project:", err);
      throw err;
    }
  }, []);

  const removeProject = useCallback(
    async (projectId) => {
      try {
        const project = projects.find((p) => p?.id === projectId);

        // Delete all inspirations first
        if (project?.inspirations?.length > 0) {
          await Promise.allSettled(
            project.inspirations.map((insp) => deleteInspiration(insp.id)),
          );
        }

        // Delete the project
        await deleteProject(projectId);
        setProjects((prev) => prev.filter((p) => p?.id !== projectId));
      } catch (err) {
        console.error("Error deleting project:", err);
        throw err;
      }
    },
    [projects],
  );

  return {
    projects,
    loading,
    error,
    addProject,
    removeProject,
    refetch: fetchProjects,
  };
};
