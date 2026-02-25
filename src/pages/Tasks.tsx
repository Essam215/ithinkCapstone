import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { Plus, Filter, Search, Upload, File } from "lucide-react";
import { getTasks, getTaskById, submitTask } from "../services/taskService";
import { useAuth } from "../context/AuthContext";
import type { Task } from "../types";

export const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const loadTasks = async () => {
    try {
      const status = filter === "all" ? undefined : filter;
      const tasksData = await getTasks(status);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const handleSubmitTask = async () => {
    if (!selectedTask || !submissionText.trim()) {
      alert("Please enter submission text");
      return;
    }

    setLoading(true);
    try {
      await submitTask(Number(selectedTask.id), submissionText, selectedFiles);
      alert("Task submitted successfully!");
      setIsModalOpen(false);
      setSelectedTask(null);
      setSubmissionText("");
      setSelectedFiles([]);
      loadTasks();
    } catch (error) {
      console.error("Error submitting task:", error);
      alert("Failed to submit task");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // Validate file size (10MB max)
      const validFiles = files.filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          return false;
        }
        return true;
      });
      setSelectedFiles([...selectedFiles, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === "all" || task.status === filter;
    const matchesSearch =
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleTaskClick = async (task: Task) => {
    try {
      const taskData = await getTaskById(task.id);
      setSelectedTask(taskData);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error loading task:", error);
      // Fallback to basic task data
      setSelectedTask(task);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white mb-4">All Tasks</h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto">
          Discover and complete tasks to earn points and contribute to the PHP
          community
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#f8d32d] mb-2">
              {filteredTasks.length}
            </div>
            <div className="text-white/80 text-sm">Available Tasks</div>
          </div>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#198a40] mb-2">
              {filteredTasks.reduce((sum, task) => sum + (task.points || 0), 0)}
            </div>
            <div className="text-white/80 text-sm">Total Points</div>
          </div>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#3972a1] mb-2">
              {filteredTasks.filter((t) => t.status === "pending").length}
            </div>
            <div className="text-white/80 text-sm">Pending Tasks</div>
          </div>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#b42940] mb-2">
              {filteredTasks.filter((t) => t.status === "completed").length}
            </div>
            <div className="text-white/80 text-sm">Completed</div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-[#3972a1] focus:border-[#3972a1]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#3972a1]" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-[#3972a1] focus:border-[#3972a1]"
              aria-label="Filter tasks by status"
            >
              <option value="all" className="bg-[#19316d] text-white">
                All Status
              </option>
              <option value="pending" className="bg-[#19316d] text-white">
                Pending
              </option>
              <option value="in-progress" className="bg-[#19316d] text-white">
                In Progress
              </option>
              <option value="completed" className="bg-[#19316d] text-white">
                Completed
              </option>
              <option value="approved" className="bg-[#19316d] text-white">
                Approved
              </option>
            </select>
          </div>
          {user?.role === "admin" && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-[#f8d32d] to-[#198a40] hover:from-[#f8d32d]/90 hover:to-[#198a40]/90 text-[#19316d] border-0 px-6 py-3"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          )}
        </div>
      </Card>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No tasks found
            </h3>
            <p className="text-white/60">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group h-full"
                onClick={() => handleTaskClick(task)}
              >
                <div className="flex flex-col h-full">
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-[#3972a1]/20 text-[#3972a1] rounded-full text-xs font-medium border border-[#3972a1]/30">
                          {task.category_name || task.category}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === "completed"
                              ? "bg-[#198a40]/20 text-[#198a40] border border-[#198a40]/30"
                              : task.status === "in-progress"
                                ? "bg-[#3972a1]/20 text-[#3972a1] border border-[#3972a1]/30"
                                : task.status === "approved"
                                  ? "bg-[#f8d32d]/20 text-[#19316d] border border-[#f8d32d]/30"
                                  : "bg-white/20 text-white/80 border border-white/30"
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Task Description */}
                  <p className="text-white/80 text-sm mb-4 line-clamp-3 flex-1">
                    {task.description}
                  </p>

                  {/* Task Footer */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-[#f8d32d] font-bold text-lg">
                          {task.points}
                        </span>
                        <span className="text-white/60 text-sm">pts</span>
                      </div>
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-white/60 text-sm">
                          <span>📅</span>
                          <span>
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#3972a1] hover:bg-[#3972a1]/80 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(task);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Task Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
          setSubmissionText("");
          setSelectedFiles([]);
        }}
        title={selectedTask ? selectedTask.title : "Task Details"}
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Description
              </h3>
              <p className="text-gray-900 dark:text-white">
                {selectedTask.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Category
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {selectedTask.category_name || selectedTask.category}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Points
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {selectedTask.points}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Status
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {selectedTask.status}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Due Date
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {selectedTask.due_date
                    ? new Date(selectedTask.due_date).toLocaleDateString()
                    : "No due date"}
                </p>
              </div>
            </div>

            {/* Show submission if exists */}
            {selectedTask.submission && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Submission
                </h3>
                <p className="text-gray-900 dark:text-white mb-2">
                  {selectedTask.submission.submission_text}
                </p>
                <div className="text-sm">
                  <span
                    className={`px-2 py-1 rounded ${
                      selectedTask.submission.status === "approved"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : selectedTask.submission.status === "rejected"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                    }`}
                  >
                    Status: {selectedTask.submission.status}
                  </span>
                </div>
                {selectedTask.submission.feedback && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Feedback:
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedTask.submission.feedback}
                    </p>
                  </div>
                )}
                {selectedTask.submission?.points_awarded > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Points Awarded: {selectedTask.submission.points_awarded}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Submission Form (only if not submitted or if pending/rejected) */}
            {(user?.role === "student" || user?.role === "php") &&
              (!selectedTask.submission ||
                selectedTask.submission.status === "rejected") && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Submission Text
                    </label>
                    <textarea
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={4}
                      placeholder="Enter your submission..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Attachments (PDF, Images - Max 10MB each)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,image/*"
                      aria-label="Upload attachments"
                      onChange={handleFileSelect}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {selectedFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <File className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {file.name} (
                                {(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="primary"
                      onClick={handleSubmitTask}
                      fullWidth
                      disabled={loading || !submissionText.trim()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {loading ? "Submitting..." : "Submit Task"}
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => {
                        setIsModalOpen(false);
                        setSelectedTask(null);
                        setSubmissionText("");
                        setSelectedFiles([]);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}

            {/* Close button if no submission form */}
            {((user?.role !== "student" && user?.role !== "php") ||
              (selectedTask.submission &&
                selectedTask.submission.status !== "rejected")) && (
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedTask(null);
                    setSubmissionText("");
                    setSelectedFiles([]);
                  }}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
