import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import Button from "../components/Button";

const Projects = () => {
  const { projects, loading, error, addProject, refetch } = useProjects();
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const handleCreateProject = async () => {
    setIsCreating(true);
    setCreateError(null);

    try {
      const projectNumber = projects.length + 1;

      await addProject({
        name: `Project ${projectNumber}`,
        description: "New project description",
      });
    } catch (err) {
      console.error("Failed to create project:", err);
      setCreateError("Failed to create project. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="max-w-md mx-auto mt-12 p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Failed to Load Projects
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refetch}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-gray-600 text-sm mt-1">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>
        <Button onClick={handleCreateProject} disabled={isCreating}>
          {isCreating ? "Creating..." : "+ New Project"}
        </Button>
      </div>

      {createError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{createError}</p>
        </div>
      )}

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">📁</div>
          <h2 className="text-xl font-semibold mb-2">No Projects Yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first project to start collecting design inspirations
          </p>
          <Button onClick={handleCreateProject} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create First Project"}
          </Button>
        </div>
      ) : (
        // Projects grid
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="p-5 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-400 transition-all duration-200 bg-white"
            >
              <h2 className="text-lg font-semibold mb-2 truncate">
                {project.name || "Untitled Project"}
              </h2>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {project.description || "No description"}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>🖼️ {project.inspirations?.length || 0} inspirations</span>
                {project.updatedAt && (
                  <span>
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
