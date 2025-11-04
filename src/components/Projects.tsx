import React, { useState, useEffect } from 'react';
import { Project, ModalData } from '../types';
import ProjectModal from './ProjectModal';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<Record<string, string[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [selectedCategory, selectedSubcategory, projects]);

  const loadProjects = async () => {
    try {
      const response = await fetch('/projects.json');
      const data: Project[] = await response.json();

      // Add IDs to projects
      const projectsWithIds = data.map((project, index) => ({
        ...project,
        id: index + 1,
      }));

      setProjects(projectsWithIds);
      deriveFilters(projectsWithIds);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const deriveFilters = (projectsData: Project[]) => {
    const categorySet = new Set<string>();
    const subcategoryMap: Record<string, Set<string>> = {};

    projectsData.forEach((project) => {
      const category = project.category.toLowerCase();
      categorySet.add(category);

      if (project.subcategory) {
        if (!subcategoryMap[category]) {
          subcategoryMap[category] = new Set();
        }
        subcategoryMap[category].add(project.subcategory);
      }
    });

    const categoriesList = Array.from(categorySet).sort();
    const subcategoriesMap: Record<string, string[]> = {};

    Object.keys(subcategoryMap).forEach((category) => {
      subcategoriesMap[category] = Array.from(subcategoryMap[category]).sort();
    });

    setCategories(categoriesList);
    setSubcategories(subcategoriesMap);
  };

  const applyFilter = () => {
    let filtered = projects;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (project) => project.category.toLowerCase() === selectedCategory
      );
    }

    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(
        (project) => project.subcategory === selectedSubcategory
      );
    }

    setFilteredProjects(filtered);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory('all');
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
  };

  const openProjectModal = (project: Project) => {
    const data: ModalData = {
      title: project.title,
      category: project.category,
      subcategory: project.subcategory,
      description: project.description,
      fullDescription: project.fullDescription,
      image: project.image,
      pdfLink: project.pdfLink,
    };
    setModalData(data);
    setModalOpen(true);
  };

  const availableSubcategories =
    selectedCategory !== 'all' ? subcategories[selectedCategory] || [] : [];

  return (
    <section id="projects" className="section">
      <div className="container">
        <div className="projects-unified-panel">
          <h2 className="section-title">Featured Projects</h2>
          <p className="section-subtitle">
            A showcase of coursework and personal cartographic explorations
          </p>

          {/* Project Filters */}
          <div className="project-filters">
            <div className="filter-group">
              <label htmlFor="categoryFilter">Category:</label>
              <select
                id="categoryFilter"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {availableSubcategories.length > 0 && (
              <div className="filter-group">
                <label htmlFor="subcategoryFilter">Subcategory:</label>
                <select
                  id="subcategoryFilter"
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                >
                  <option value="all">All Subcategories</option>
                  {availableSubcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(selectedCategory !== 'all' || selectedSubcategory !== 'all') && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>

          {/* Projects Grid */}
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => openProjectModal(project)}
              >
                <div className="project-image-wrapper">
                  <img src={project.image} alt={project.title} loading="lazy" />
                </div>
                <div className="project-info">
                  <div className="project-category">
                    {project.category}
                    {project.subcategory && ` • ${project.subcategory}`}
                  </div>
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="no-projects">
              <p>No projects match the selected filters.</p>
            </div>
          )}
        </div>
      </div>

      <ProjectModal
        isOpen={modalOpen}
        data={modalData}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
};

export default Projects;
