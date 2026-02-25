import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/Card";
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "../components/Table";
import { Trophy, Medal, Award } from "lucide-react";
import { mockLeaderboard } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import type { LeaderboardEntry } from "../types";

export const Leaderboard = () => {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<"rank" | "points" | "badges">("rank");
  const [leaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard);

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (sortBy === "rank") return a.rank - b.rank;
    if (sortBy === "points") return b.points - a.points;
    return b.badgesCount - a.badgesCount;
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          See how you rank among your peers
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedLeaderboard.slice(0, 3).map((_, index) => {
          const positions = [1, 0, 2]; // Reorder for visual: 2nd, 1st, 3rd
          const entryIndex = positions[index];
          const entryData = sortedLeaderboard[entryIndex];
          if (!entryData) return null;

          return (
            <motion.div
              key={entryData.userId}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`${
                  entryIndex === 0
                    ? "md:order-2 md:scale-110 border-2 border-yellow-400"
                    : entryIndex === 1
                    ? "md:order-1"
                    : "md:order-3"
                }`}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {getRankIcon(entryData.rank)}
                  </div>
                  <div className="w-16 h-16 rounded-full bg-primary-600 mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold">
                    {entryData.user.firstName[0]}
                    {entryData.user.lastName[0]}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {entryData.user.firstName} {entryData.user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {entryData.user.email}
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Points:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {entryData.points}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Badges:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {entryData.badgesCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Full Rankings
          </h2>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "rank" | "points" | "badges")
            }
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            aria-label="Sort leaderboard"
          >
            <option value="rank">Sort by Rank</option>
            <option value="points">Sort by Points</option>
            <option value="badges">Sort by Badges</option>
          </select>
        </div>

        <Table>
          <TableHeader>
            <TableHeaderCell>Rank</TableHeaderCell>
            <TableHeaderCell>Student</TableHeaderCell>
            <TableHeaderCell sortable onClick={() => setSortBy("points")}>
              Points
            </TableHeaderCell>
            <TableHeaderCell sortable onClick={() => setSortBy("badges")}>
              Badges
            </TableHeaderCell>
          </TableHeader>
          <TableBody>
            {sortedLeaderboard.map((entry, index) => {
              const isCurrentUser = user?.id === entry.userId;
              return (
                <motion.tr
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <TableRow
                    className={
                      isCurrentUser
                        ? "bg-primary-50 dark:bg-primary-900/20"
                        : ""
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                          {entry.user.firstName[0]}
                          {entry.user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {entry.user.firstName} {entry.user.lastName}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {entry.user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900 dark:text-white">
                      {entry.points}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900 dark:text-white">
                      {entry.badgesCount}
                    </TableCell>
                  </TableRow>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
