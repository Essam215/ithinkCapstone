import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "../components/Table";
import { Modal } from "../components/Modal";
import { Filter, Search, Upload, File } from "lucide-react";
import { getTasks, getTaskById, submitTask } from "../services/taskService";
import { useAuth } from "../context/AuthContext";
import type { Task } from "../types";

export const MyTasks = () => {
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
      // Filter to show only tasks assigned to current user or created by current user
      const myTasks = tasksData.filter(
        (task) => task.assignedTo === user?.id || task.createdBy === user?.id,
      );
      setTasks(myTasks);
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
      setSelectedTask(task);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          {user?.role === "admin" ? "Admin Tasks" : "My Tasks"}
        </h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto">
          {user?.role === "admin"
            ? "Manage tasks you've created and oversee submissions"
            : "Track your progress and manage your task submissions"}
        </p>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#f8d32d] mb-2">
              {filteredTasks.filter((t) => t.status === "completed").length}
            </div>
            <div className="text-white/80 text-sm">Completed Tasks</div>
          </div>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#3972a1] mb-2">
              {filteredTasks.filter((t) => t.status === "in-progress").length}
            </div>
            <div className="text-white/80 text-sm">In Progress</div>
          </div>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#198a40] mb-2">
              {filteredTasks.reduce((sum, task) => {
                if (task.status === "completed" || task.status === "approved") {
                  return sum + (task.points || 0);
                }
                return sum;
              }, 0)}
            </div>
            <div className="text-white/80 text-sm">Points Earned</div>
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
              placeholder="Search your tasks..."
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
        </div>
      </Card>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">
              {user?.role === "admin" ? "👑" : "📝"}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {user?.role === "admin"
                ? "No admin tasks yet"
                : "No tasks assigned"}
            </h3>
            <p className="text-white/60">
              {user?.role === "admin"
                ? "Tasks you create will appear here"
                : "Check the All Tasks page to find available tasks"}
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
                className={`bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group h-full ${
                  task.status === "completed"
                    ? "ring-2 ring-[#198a40]/50"
                    : task.status === "in-progress"
                      ? "ring-2 ring-[#3972a1]/50"
                      : ""
                }`}
                onClick={() => handleTaskClick(task)}
              >
                <div className="flex flex-col h-full">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.status === "completed"
                          ? "bg-[#198a40]/20 text-[#198a40] border border-[#198a40]/30"
                          : task.status === "in-progress"
                            ? "bg-[#3972a1]/20 text-[#3972a1] border border-[#3972a1]/30"
                            : task.status === "approved"
                              ? "bg-[#f8d32d]/20 text-[#19316d] border border-[#f8d32d]/30"
                              : "bg-white/20 text-white/80 border border-white/30"
                      }`}
                    >
                      {task.status === "in-progress"
                        ? "In Progress"
                        : task.status === "completed"
                          ? "Completed"
                          : task.status === "approved"
                            ? "Approved"
                            : "Pending"}
                    </span>
                    <div className="text-right">
                      <div className="text-[#f8d32d] font-bold text-xl">
                        {task.points}
                      </div>
                      <div className="text-white/60 text-xs">points</div>
                    </div>
                  </div>

                  {/* Task Title */}
                  <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
                    {task.title}
                  </h3>

                  {/* Task Description */}
                  <p className="text-white/80 text-sm mb-4 line-clamp-3 flex-1">
                    {task.description}
                  </p>

                  {/* Task Meta */}
                  <div className="flex items-center justify-between text-sm text-white/60 mt-auto">
                    <div className="flex items-center gap-4">
                      <span className="px-2 py-1 bg-[#3972a1]/20 text-[#3972a1] rounded text-xs border border-[#3972a1]/30">
                        {task.category_name || task.category}
                      </span>
                    </div>
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <span>⏰</span>
                        <span>
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    className="mt-4 bg-[#3972a1] hover:bg-[#3972a1]/80 text-white border-0 w-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task);
                    }}
                  >
                    {task.status === "completed"
                      ? "View Submission"
                      : task.status === "in-progress"
                        ? "Continue Task"
                        : "Start Task"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Tasks Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableHeaderCell>Title</TableHeaderCell>
            <TableHeaderCell>Category</TableHeaderCell>
            <TableHeaderCell>Points</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Due Date</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No tasks found
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task, index) => (
                <motion.tr
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <TableRow onClick={() => handleTaskClick(task)}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {task.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {task.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-sm">
                        {task.category_name || task.category}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900 dark:text-white">
                      {task.points}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          task.status === "completed"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : task.status === "in-progress"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              : task.status === "approved"
                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {task.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {task.due_date || task.dueDate
                        ? new Date(
                            task.due_date || task.dueDate || "",
                          ).toLocaleDateString()
                        : "No due date"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskClick(task);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

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
            </div>
            {(selectedTask.due_date || selectedTask.dueDate) && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Due Date
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {new Date(
                    selectedTask.due_date || selectedTask.dueDate || "",
                  ).toLocaleDateString()}
                </p>
              </div>
            )}
            {selectedTask.status !== "completed" &&
              selectedTask.status !== "approved" && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Submission Text
                    </label>
                    <textarea
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-sans"
                      rows={4}
                      placeholder="Enter your submission..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Attachments
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium cursor-pointer">
                          <Upload className="w-4 h-4" />
                          Upload Files
                        </span>
                      </label>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <File className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {file.name}
                              </span>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleSubmitTask}
                    disabled={loading || !submissionText.trim()}
                    fullWidth
                  >
                    {loading ? "Submitting..." : "Submit Task"}
                  </Button>
                </div>
              )}
          </div>
        )}
      </Modal>
    </div>
  );
};
