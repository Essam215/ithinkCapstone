import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import {
  Shield,
  Users,
  BarChart3,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  TrendingUp,
  Award,
  Activity,
  Zap,
  Megaphone,
  Pin,
} from "lucide-react";
import {
  getStatistics,
  getPHPMembers,
  getStudents,
} from "../services/userService";
import { getTaskSubmissions, reviewTask } from "../services/taskService";
import {
  getEventApplications,
  reviewEventApplications,
} from "../services/eventService";
import { getPendingPosts, reviewPost, createPost } from "../services/postService";
import { getBadges } from "../services/badgeService";
import { getLeaderboard } from "../services/leaderboardService";
import type { User, Task, Stats, Post, Badge, LeaderboardEntry } from "../types";

export const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalTasks: 0,
    totalEvents: 0,
    totalUsers: 0,
    totalPHP: 0,
    pendingTasks: 0,
    pendingEvents: 0,
    totalPointsAwarded: 0,
    pendingPHPApplications: 0,
  });
  const [phpMembers, setPHPMembers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postFeedback, setPostFeedback] = useState("");
  const [postPoints, setPostPoints] = useState(0);
  const [postPin, setPostPin] = useState(false);
  const [postPublishPublic, setPostPublishPublic] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [topStudents, setTopStudents] = useState<User[]>([]);
  const [taskStats, setTaskStats] = useState({
    completed: 0,
    pending: 0,
    inProgress: 0,
    rejected: 0,
  });
  const [engagementData, setEngagementData] = useState({
    activeUsers: 0,
    averagePointsPerUser: 0,
    totalTasksCompleted: 0,
    totalEventsHeld: 0,
  });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === "dashboard") {
        const statistics = await getStatistics();
        setStats(statistics);

        // Get students for top performers analysis
        const studentsData = await getStudents();
        setStudents(studentsData);

        // Calculate top students
        const sorted = [...studentsData].sort(
          (a: any, b: any) => b.points - a.points,
        );
        setTopStudents(sorted.slice(0, 5));

        // Calculate engagement metrics
        const activeUsersCount = studentsData.filter(
          (s: any) => s.points > 0,
        ).length;
        const avgPoints =
          studentsData.length > 0
            ? Math.round(
                studentsData.reduce(
                  (sum: number, s: any) => sum + (s.points || 0),
                  0,
                ) / studentsData.length,
              )
            : 0;

        setEngagementData({
          activeUsers: activeUsersCount,
          averagePointsPerUser: avgPoints,
          totalTasksCompleted: statistics.totalTasks || 0,
          totalEventsHeld: statistics.totalEvents || 0,
        });

        // Get task submissions for task stats
        const allTasks = await getTaskSubmissions("pending");
        const taskCounts = {
          completed: Math.round(
            (statistics.totalTasks * (statistics.taskCompletionRate || 0)) /
              100,
          ),
          pending: allTasks?.length || 0,
          inProgress: 0,
          rejected: 0,
        };
        setTaskStats(taskCounts);

        // Get badges for badge distribution
        const badgesData = await getBadges();
        setBadges(badgesData);

        // Get leaderboard for recent activity
        const leaderboardData = await getLeaderboard(10);
        setLeaderboard(leaderboardData);
      } else if (activeTab === "php-members") {
        const members = await getPHPMembers();
        setPHPMembers(members);
      } else if (activeTab === "students") {
        const studentsData = await getStudents();
        setStudents(studentsData);
      } else if (activeTab === "tasks") {
        const tasks = await getTaskSubmissions("pending");
        setPendingTasks(tasks);
      } else if (activeTab === "events") {
        const events = await getEventApplications(undefined, "pending");
        setPendingEvents(events);
      } else if (activeTab === "posts") {
        const posts = await getPendingPosts();
        setPendingPosts(posts);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleTaskReview = async (action: "approve" | "reject") => {
    if (!selectedTask) return;

    try {
      await reviewTask(
        selectedTask.id,
        action,
        feedback,
        action === "approve" ? pointsAwarded : undefined,
      );
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      setFeedback("");
      setPointsAwarded(0);
      loadData();
    } catch (error) {
      console.error("Error reviewing task:", error);
      alert("Failed to review task");
    }
  };

  const handleEventReview = async (
    applicationIds: number[],
    action: "approve" | "reject",
  ) => {
    try {
      await reviewEventApplications(applicationIds, action);
      loadData();
    } catch (error) {
      console.error("Error reviewing events:", error);
      alert("Failed to review event applications");
    }
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "tasks", label: "Task Review", icon: FileText },
    { id: "events", label: "Event Applications", icon: Calendar },
    { id: "posts", label: "Announcements", icon: Megaphone },
    { id: "php-members", label: "PHP Members", icon: Users },
    { id: "students", label: "Students", icon: Users },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-[#19316d] dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage the PHP Directory Program
        </p>
      </div>

      {/* Tabs */}
      <Card className="mb-4">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-[#f8d32d] text-[#19316d] dark:text-[#f8d32d] bg-[#f8d32d]/10"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-[#19316d] dark:hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#3972a1]/20 rounded-lg">
                  <Users className="w-6 h-6 text-[#3972a1]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold text-[#19316d] dark:text-white">
                    {stats.totalUsers || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#198a40]/20 rounded-lg">
                  <Shield className="w-6 h-6 text-[#198a40]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    PHP Members
                  </p>
                  <p className="text-2xl font-bold text-[#19316d] dark:text-white">
                    {stats.totalPHP || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#f8d32d]/20 rounded-lg">
                  <FileText className="w-6 h-6 text-[#19316d]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pending Tasks
                  </p>
                  <p className="text-2xl font-bold text-[#19316d] dark:text-white">
                    {stats.pendingTasks || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#b42940]/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-[#b42940]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pending Events
                  </p>
                  <p className="text-2xl font-bold text-[#19316d] dark:text-white">
                    {stats.pendingEvents || 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Total Points Awarded
              </h3>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {stats.totalPointsAwarded || 0}
              </p>
            </Card>

            <Card>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Pending PHP Applications
              </h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pendingPHPApplications || 0}
              </p>
            </Card>
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-orange-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active Users
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {engagementData.activeUsers}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {stats.totalUsers
                  ? Math.round(
                      (engagementData.activeUsers / stats.totalUsers) * 100,
                    )
                  : 0}
                % of total
              </p>
            </Card>

            <Card>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Points/User
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {engagementData.averagePointsPerUser}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                System average
              </p>
            </Card>

            <Card>
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tasks Completed
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {taskStats.completed}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Total completed
              </p>
            </Card>

            <Card>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-red-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Events Hosted
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {engagementData.totalEventsHeld}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Total events
              </p>
            </Card>
          </div>

          {/* Charts & Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Task Status Distribution */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Task Status Distribution
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Completed",
                    value: taskStats.completed,
                    color: "bg-green-500",
                    iconColor: "text-green-500",
                  },
                  {
                    label: "In Progress",
                    value: taskStats.inProgress,
                    color: "bg-blue-500",
                    iconColor: "text-blue-500",
                  },
                  {
                    label: "Pending",
                    value: taskStats.pending,
                    color: "bg-yellow-500",
                    iconColor: "text-yellow-500",
                  },
                  {
                    label: "Rejected",
                    value: taskStats.rejected,
                    color: "bg-red-500",
                    iconColor: "text-red-500",
                  },
                ].map((item) => {
                  const total =
                    taskStats.completed +
                      taskStats.inProgress +
                      taskStats.pending +
                      taskStats.rejected || 1;
                  const percentage = Math.round((item.value / total) * 100);
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {item.label}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.value} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className={`${item.color} h-3 rounded-full transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Performance Metrics
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "PHP Engagement",
                    value:
                      stats.totalPHP && stats.totalUsers
                        ? Math.round((stats.totalPHP / stats.totalUsers) * 100)
                        : 0,
                    color: "bg-green-500",
                  },
                  {
                    label: "Program Health",
                    value:
                      stats.totalPointsAwarded && stats.totalUsers
                        ? Math.min(
                            100,
                            Math.round(
                              (stats.totalPointsAwarded /
                                (stats.totalUsers * 100)) *
                                100,
                            ),
                          )
                        : 0,
                    color: "bg-orange-500",
                  },
                  {
                    label: "Pending Tasks",
                    value:
                      stats.totalTasks > 0
                        ? Math.round(
                            ((stats.totalTasks - stats.pendingTasks) /
                              stats.totalTasks) *
                              100,
                          )
                        : 0,
                    color: "bg-blue-500",
                  },
                  {
                    label: "Event Participation",
                    value: stats.totalEvents > 0 ? 65 : 0,
                    color: "bg-purple-500",
                  },
                ].map((metric) => {
                  const widthPercent = metric.value;
                  return (
                    <div key={metric.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {metric.label}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {metric.value}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`${metric.color} h-2 rounded-full transition-all duration-300 ${widthPercent === 0 ? "w-0" : widthPercent === 25 ? "w-1/4" : widthPercent === 50 ? "w-1/2" : widthPercent === 75 ? "w-3/4" : "w-full"}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Additional Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Badge Distribution */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Badge Distribution
              </h3>
              {badges.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No badges available
                </p>
              ) : (
                <div className="space-y-3">
                  {badges.slice(0, 5).map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                          <span className="text-lg">{badge.icon}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {badge.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {badge.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          {Math.floor(Math.random() * 20) + 1} {/* Mock count */}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          earned
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent Activity */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Leaderboard Activity
              </h3>
              {leaderboard.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No recent activity
                </p>
              ) : (
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((entry, index) => (
                    <div
                      key={entry.userId}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {entry.user.firstName} {entry.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Recent activity
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          {entry.points}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top 5 Performing Students
            </h3>
            {topStudents.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No students with points yet
              </p>
            ) : (
              <div className="space-y-3">
                {topStudents.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Rank #{student.rank}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {student.points}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        points
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Task Review Tab */}
      {activeTab === "tasks" && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Pending Task Submissions
          </h2>
          <div className="space-y-4">
            {pendingTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No pending task submissions
              </p>
            ) : (
              pendingTasks.map((task: any) => (
                <div
                  key={task.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {task.task_title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Submitted by: {task.first_name} {task.last_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Points: {task.task_points}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 mt-2">
                        {task.submission_text}
                      </p>
                      {task.attachments && task.attachments.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Attachments:
                          </p>
                          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                            {task.attachments.map((att: any, idx: number) => (
                              <li key={idx}>{att.file_name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedTask(task);
                        setPointsAwarded(task.task_points);
                        setIsTaskModalOpen(true);
                      }}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Event Applications Tab */}
      {activeTab === "events" && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Pending Event Applications
          </h2>
          <div className="space-y-4">
            {pendingEvents.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No pending event applications
              </p>
            ) : (
              pendingEvents.map((event: any) => (
                <div
                  key={event.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {event.event_title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Applied by: {event.first_name} {event.last_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Date: {new Date(event.event_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleEventReview([event.id], "approve")}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleEventReview([event.id], "reject")}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Announcements / Posts Tab */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          {/* Create Announcement */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              Create Announcement
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Announcements are public posts created by admins. They appear on
              the Home feed and can be pinned.
            </p>
            <div className="space-y-3">
              <textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Write an announcement..."
              />
              <div className="flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={postPin}
                    onChange={(e) => setPostPin(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Pin on Home feed
                </label>
                <Button
                  size="sm"
                  onClick={async () => {
                    if (!announcementText.trim()) return;
                    try {
                      const created = await createPost({
                        authorId: user?.id || "1",
                        content: announcementText.trim(),
                        visibility: "public",
                        type: "post",
                      });
                      await reviewPost({
                        postId: created.id,
                        action: "approve",
                        feedback: "",
                        pointsAwarded: 0,
                        pin: postPin,
                        publishAsPublic: true,
                      });
                      setAnnouncementText("");
                      setPostPin(false);
                      loadData();
                      alert("Announcement published");
                    } catch (error) {
                      console.error("Failed to publish announcement:", error);
                      alert("Failed to publish announcement");
                    }
                  }}
                  disabled={!announcementText.trim()}
                >
                  Publish
                </Button>
              </div>
            </div>
          </Card>

          {/* Pending Posts from Students */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Pending Posts from Students
            </h2>
            <div className="space-y-4">
              {pendingPosts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No pending posts
                </p>
              ) : (
                pendingPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                            {post.authorName || "Student"}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">
                            Pending
                          </span>
                          {post.visibility === "admin" && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                              Admin only
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Submitted at{" "}
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {post.content}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPost(post);
                          setPostFeedback("");
                          setPostPoints(0);
                          setPostPin(false);
                          setPostPublishPublic(post.visibility === "admin");
                          setIsPostModalOpen(true);
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* PHP Members Tab */}
      {activeTab === "php-members" && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            PHP Members
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-4 text-gray-700 dark:text-gray-300">
                    Name
                  </th>
                  <th className="text-left py-2 px-4 text-gray-700 dark:text-gray-300">
                    Email
                  </th>
                  <th className="text-left py-2 px-4 text-gray-700 dark:text-gray-300">
                    Points
                  </th>
                  <th className="text-left py-2 px-4 text-gray-700 dark:text-gray-300">
                    Rank
                  </th>
                </tr>
              </thead>
              <tbody>
                {phpMembers.map((member: any) => (
                  <tr
                    key={member.id}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="py-2 px-4 text-gray-900 dark:text-white">
                      {member.first_name} {member.last_name}
                    </td>
                    <td className="py-2 px-4 text-gray-600 dark:text-gray-400">
                      {member.email}
                    </td>
                    <td className="py-2 px-4 text-gray-900 dark:text-white">
                      {member.points}
                    </td>
                    <td className="py-2 px-4 text-gray-900 dark:text-white">
                      #{member.rank}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Students Tab */}
      {activeTab === "students" && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            All Students
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-4 text-gray-700 dark:text-gray-300">
                    Name
                  </th>
                  <th className="text-left py-2 px-4 text-gray-700 dark:text-gray-300">
                    Email
                  </th>
                  <th className="text-left py-2 px-4 text-gray-700 dark:text-gray-300">
                    Points
                  </th>
                  <th className="text-left py-2 px-4 text-gray-700 dark:text-gray-300">
                    Rank
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student: any) => (
                  <tr
                    key={student.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => navigate(`/profile/${student.id}`)}
                  >
                    <td className="py-2 px-4 text-gray-900 dark:text-white">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="py-2 px-4 text-gray-600 dark:text-gray-400">
                      {student.email}
                    </td>
                    <td className="py-2 px-4 text-gray-900 dark:text-white">
                      {student.points}
                    </td>
                    <td className="py-2 px-4 text-gray-900 dark:text-white">
                      #{student.rank}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Task Review Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
          setFeedback("");
          setPointsAwarded(0);
        }}
        title="Review Task Submission"
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={4}
                placeholder="Enter feedback..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Points Awarded
              </label>
              <input
                type="number"
                value={pointsAwarded}
                aria-label="Points Awarded"
                onChange={(e) =>
                  setPointsAwarded(parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="primary"
                onClick={() => handleTaskReview("approve")}
                fullWidth
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => handleTaskReview("reject")}
                fullWidth
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Post Review Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
          setSelectedPost(null);
          setPostFeedback("");
          setPostPoints(0);
          setPostPin(false);
          setPostPublishPublic(false);
        }}
        title="Review Post / Announcement"
        size="lg"
      >
        {selectedPost && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From
              </p>
              <p className="text-gray-900 dark:text-white">
                {selectedPost.authorName || "Student"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </p>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {selectedPost.content}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Feedback (optional)
                </label>
                <textarea
                  value={postFeedback}
                  onChange={(e) => setPostFeedback(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Feedback for the student..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Points to award
                </label>
                <input
                  type="number"
                  min={0}
                  value={postPoints}
                  onChange={(e) =>
                    setPostPoints(parseInt(e.target.value || "0", 10) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="mt-3 space-y-2">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={postPin}
                      onChange={(e) => setPostPin(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="inline-flex items-center gap-1">
                      <Pin className="w-3.5 h-3.5" />
                      Pin on Home feed
                    </span>
                  </label>
                  {selectedPost.visibility === "admin" && (
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={postPublishPublic}
                        onChange={(e) =>
                          setPostPublishPublic(e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                      Make visible to all students
                    </label>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="primary"
                fullWidth
                onClick={async () => {
                  if (!selectedPost) return;
                  try {
                    await reviewPost({
                      postId: selectedPost.id,
                      action: "approve",
                      feedback: postFeedback,
                      pointsAwarded: postPoints,
                      pin: postPin,
                      publishAsPublic: postPublishPublic,
                    });
                    setIsPostModalOpen(false);
                    setSelectedPost(null);
                    setPostFeedback("");
                    setPostPoints(0);
                    setPostPin(false);
                    setPostPublishPublic(false);
                    loadData();
                  } catch (error) {
                    console.error("Error approving post:", error);
                    alert("Failed to approve post");
                  }
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve & Award Points
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={async () => {
                  if (!selectedPost) return;
                  try {
                    await reviewPost({
                      postId: selectedPost.id,
                      action: "reject",
                      feedback: postFeedback,
                    });
                    setIsPostModalOpen(false);
                    setSelectedPost(null);
                    setPostFeedback("");
                    setPostPoints(0);
                    setPostPin(false);
                    setPostPublishPublic(false);
                    loadData();
                  } catch (error) {
                    console.error("Error rejecting post:", error);
                    alert("Failed to reject post");
                  }
                }}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
