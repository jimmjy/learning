import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProject, updateProject, deleteProject } from "../services/project";
import {
  createInspiration,
  updateInspiration,
  deleteInspiration,
} from "../services/inspiration";
import { getMetadata, getScreenshot } from "../utils/api";
import Button from "../components/Button";

const ProjectDetail = () => {
  const [project, setProject] = useState(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Edit states
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editedNote, setEditedNote] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProject(id);
        setProject(data);
        setEditedName(data.name);
        setEditedDescription(data.description);
      } catch (err) {
        setError("Failed to load project");
      }
    };
    fetchProject();
  }, [id]);

  const handleAddInspiration = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [metadata, screenshot] = await Promise.all([
        getMetadata(url.trim()),
        getScreenshot(url.trim()),
      ]);

      const newInspiration = await createInspiration({
        projectId: id,
        websiteMetadata: metadata,
        screenshot_uri: screenshot,
        notes: "",
      });

      const updatedInspirations = [
        ...(project.inspirations || []),
        newInspiration,
      ];
      await updateProject(id, { inspirations: updatedInspirations });

      setProject((prev) => ({ ...prev, inspirations: updatedInspirations }));
      setUrl("");
    } catch (err) {
      setError("Failed to add inspiration");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!editedName.trim()) {
      setError("Project name required");
      return;
    }

    try {
      const updated = await updateProject(id, {
        name: editedName.trim(),
        description: editedDescription.trim(),
      });
      setProject((prev) => ({ ...prev, ...updated }));
      setIsEditingProject(false);
      setError(null);
    } catch (err) {
      setError("Failed to update project");
    }
  };

  const handleSaveNote = async (inspiration) => {
    try {
      const updated = await updateInspiration(inspiration.id, {
        notes: editedNote.trim(),
      });

      const updatedInspirations = project.inspirations.map((i) =>
        i.id === inspiration.id ? updated : i,
      );

      await updateProject(id, { inspirations: updatedInspirations });
      setProject((prev) => ({ ...prev, inspirations: updatedInspirations }));
      setEditingNoteId(null);
      setEditedNote("");
    } catch (err) {
      setError("Failed to update note");
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(`Delete "${project.name}"?`)) return;

    setLoading(true);
    try {
      if (project.inspirations?.length > 0) {
        await Promise.allSettled(
          project.inspirations.map((i) => deleteInspiration(i.id)),
        );
      }
      await deleteProject(id);
      navigate("/projects");
    } catch (err) {
      setError("Failed to delete project");
      setLoading(false);
    }
  };

  const handleDeleteInspiration = async (inspiration) => {
    if (!window.confirm("Delete this inspiration?")) return;

    try {
      await deleteInspiration(inspiration.id);
      const updatedInspirations = project.inspirations.filter(
        (i) => i.id !== inspiration.id,
      );
      await updateProject(id, { inspirations: updatedInspirations });
      setProject((prev) => ({ ...prev, inspirations: updatedInspirations }));
    } catch (err) {
      setError("Failed to delete inspiration");
    }
  };

  if (!project) return <div className="p-4">Loading...</div>;
  if (error && !project) {
    return (
      <div className="p-4">
        <div className="p-4 bg-red-50 text-red-800 rounded">{error}</div>
        <Button onClick={() => navigate("/projects")}>Back</Button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Project Header */}
      {isEditingProject ? (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            placeholder="Project Name"
            className="w-full px-3 py-2 mb-3 border rounded"
          />
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full px-3 py-2 mb-3 border rounded"
          />
          <div className="flex gap-2">
            <Button onClick={handleSaveProject}>Save</Button>
            <Button
              onClick={() => setIsEditingProject(false)}
              style={{ background: "#666" }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Button
              onClick={() => setIsEditingProject(true)}
              className="text-sm"
            >
              Edit
            </Button>
          </div>
          <p className="text-gray-600">{project.description}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded text-sm">
          {error}
        </div>
      )}

      {/* Add Inspiration */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Add Inspiration</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL (e.g., github.com)"
            disabled={loading}
            className="flex-1 px-3 py-2 border rounded"
            onKeyDown={(e) =>
              e.key === "Enter" && !loading && handleAddInspiration()
            }
          />
          <Button
            onClick={handleAddInspiration}
            disabled={loading || !url.trim()}
          >
            {loading ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>

      {/* Inspirations */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Inspirations ({project.inspirations?.length || 0})
        </h2>

        {!project.inspirations?.length ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-5xl mb-2">🖼️</div>
            <p className="text-gray-600">No inspirations yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {project.inspirations.map((insp) => (
              <div key={insp.id} className="border rounded-lg p-4 bg-white">
                {insp.screenshot_uri && (
                  <img
                    src={insp.screenshot_uri}
                    alt={insp.websiteMetadata?.title || "Screenshot"}
                    className="w-full max-w-2xl mb-3 rounded"
                  />
                )}

                <h3 className="font-semibold text-lg mb-1">
                  {insp.websiteMetadata?.title ||
                    insp.websiteMetadata?.url ||
                    "Untitled"}
                </h3>

                {insp.websiteMetadata?.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {insp.websiteMetadata.description}
                  </p>
                )}

                {insp.websiteMetadata?.url && (
                  <a
                    href={insp.websiteMetadata.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm
                    text-blue-600 hover:underline block mb-3"
                  >
                    {insp.websiteMetadata.url}
                  </a>
                )}

                {/* Notes Section */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    Notes
                  </label>
                  {editingNoteId === insp.id ? (
                    <div>
                      <textarea
                        value={editedNote}
                        onChange={(e) => setEditedNote(e.target.value)}
                        placeholder="Add notes..."
                        rows={3}
                        className="w-full px-3 py-2 border rounded mb-2"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveNote(insp)}
                          className="text-sm"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingNoteId(null);
                            setEditedNote("");
                          }}
                          className="text-sm"
                          style={{ background: "#666" }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {insp.notes ? (
                        <p className="text-sm italic p-2 bg-gray-50 rounded mb-2">
                          {insp.notes}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic mb-2">
                          No notes
                        </p>
                      )}
                      <Button
                        onClick={() => {
                          setEditingNoteId(insp.id);
                          setEditedNote(insp.notes || "");
                        }}
                        className="text-sm"
                      >
                        {insp.notes ? "Edit Notes" : "Add Notes"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-xs text-gray-500">
                    Added {new Date(insp.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    onClick={() => handleDeleteInspiration(insp)}
                    className="text-sm"
                    style={{ background: "#dc3545" }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-6 border-t">
        <Button
          onClick={handleDeleteProject}
          disabled={loading}
          style={{ background: "#dc3545" }}
        >
          Delete Project
        </Button>
        <Button
          onClick={() => navigate("/projects")}
          style={{ background: "#666" }}
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default ProjectDetail;
