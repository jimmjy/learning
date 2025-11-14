import React, { useMemo } from "react";
import { Link } from "react-router-dom";
// this is a hook break it apart instead
import { useProjects } from "../hooks/useProjects";

import Button from "../components/Button";

const Dashboard = () => {
  const { projects, loading, error, refetch } = useProjects();

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalInspirations = projects.reduce((sum, p) => {
      return sum + (p.inspirations?.length || 0);
    }, 0);

    const avgInspirations =
      totalProjects > 0 ? (totalInspirations / totalProjects).toFixed(1) : "0";

    return {
      totalProjects,
      totalInspirations,
      avgInspirations,
    };
  }, [projects]);

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);
  }, [projects]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
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
            Failed to Load Dashboard
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's an overview of your projects.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Projects"
          value={stats.totalProjects}
          icon="📁"
          color="blue"
        />
        <StatCard
          title="Inspirations"
          value={stats.totalInspirations}
          icon="🖼️"
          color="green"
        />
        <StatCard
          title="Avg per Project"
          value={stats.avgInspirations}
          icon="📊"
          color="purple"
        />
      </div>

      {/* Recent Projects Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          {stats.totalProjects > 0 && (
            <Link
              to="/projects"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </Link>
          )}
        </div>

        {stats.totalProjects === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">Get Started</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first project to start collecting and organizing
              design inspirations
            </p>
            <Link to="/projects">
              <Button>Create Your First Project</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentProjects.map((project) => {
              const inspirationCount = project.inspirations?.length || 0;

              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-400"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {project.name || "Untitled Project"}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {project.description || "No description"}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>🖼️ {inspirationCount} inspirations</span>
                        {project.updatedAt && (
                          <span>
                            Updated{" "}
                            {new Date(project.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-400 text-xl">→</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <div className="text-sm font-medium opacity-80">{title}</div>
    </div>
  );
};

export default Dashboard;
