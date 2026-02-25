import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { createTask } from "../services/taskService";
import { Plus, ArrowLeft } from "lucide-react";

export const AddTask = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    points: "",
    dueDate: "",
  });

  const categories = [
    "Tutoring",
    "Mentoring",
    "Organization",
    "Workshop",
    "Service",
    "Other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.category ||
      !formData.points
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await createTask({
        title: formData.title,
        description: formData.description,
        categoryId: categories.indexOf(formData.category) + 1,
        points: parseInt(formData.points),
        dueDate: formData.dueDate || undefined,
      });
      alert("Task created successfully!");
      navigate("/tasks");
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="text-center py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-[#3972a1]/20 rounded-full border border-[#3972a1]/30">
              <Plus className="w-8 h-8 text-[#3972a1]" />
            </div>
            <h1 className="text-4xl font-bold text-white">Create New Task</h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Add a new task to help PHP members grow and contribute to the
            community
          </p>
        </motion.div>
      </div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-white mb-3"
              >
                Task Title <span className="text-[#b42940]">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-[#3972a1] focus:border-[#3972a1] transition-all"
                placeholder="Enter an engaging task title..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-white mb-3"
              >
                Description <span className="text-[#b42940]">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-[#3972a1] focus:border-[#3972a1] transition-all resize-none"
                placeholder="Describe the task requirements, objectives, and what members will learn..."
                required
              />
            </div>

            {/* Category and Points Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-white mb-3"
                >
                  Category <span className="text-[#b42940]">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-[#3972a1] focus:border-[#3972a1] transition-all"
                  required
                >
                  <option value="" className="bg-[#19316d] text-white">
                    Select a category
                  </option>
                  {categories.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                      className="bg-[#19316d] text-white"
                    >
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="points"
                  className="block text-sm font-medium text-white mb-3"
                >
                  Points <span className="text-[#b42940]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="points"
                    name="points"
                    value={formData.points}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-[#3972a1] focus:border-[#3972a1] transition-all"
                    placeholder="100"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#f8d32d] font-bold">
                    ⭐
                  </div>
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-white mb-3"
              >
                Due Date <span className="text-white/60">(Optional)</span>
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-[#3972a1] focus:border-[#3972a1] transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-white/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/tasks")}
                className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#3972a1] hover:bg-[#3972a1]/80 text-white border-0"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};
