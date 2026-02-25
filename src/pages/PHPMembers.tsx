import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, ChevronDown } from "lucide-react";
import { getPHPMembers } from "../services/userService";
import type { User } from "../types";

interface PHPWithBadge extends User {
  badge?: "Senior" | "Junior" | "Wheeler";
}

const mockPHPsWithBadges: PHPWithBadge[] = [
  {
    id: "1",
    email: "alice@school.edu",
    firstName: "Alice",
    lastName: "Johnson",
    role: "php",
    points: 1250,
    rank: 1,
    createdAt: new Date().toISOString(),
    badge: "Senior",
  },
  {
    id: "2",
    email: "bob@school.edu",
    firstName: "Bob",
    lastName: "Smith",
    role: "php",
    points: 980,
    rank: 2,
    createdAt: new Date().toISOString(),
    badge: "Junior",
  },
  {
    id: "3",
    email: "charlie@school.edu",
    firstName: "Charlie",
    lastName: "Brown",
    role: "php",
    points: 850,
    rank: 3,
    createdAt: new Date().toISOString(),
    badge: "Wheeler",
  },
  {
    id: "4",
    email: "diana@school.edu",
    firstName: "Diana",
    lastName: "Prince",
    role: "php",
    points: 720,
    rank: 4,
    createdAt: new Date().toISOString(),
    badge: "Senior",
  },
  {
    id: "5",
    email: "john@school.edu",
    firstName: "John",
    lastName: "Doe",
    role: "php",
    points: 650,
    rank: 5,
    createdAt: new Date().toISOString(),
    badge: "Junior",
  },
  {
    id: "6",
    email: "emma@school.edu",
    firstName: "Emma",
    lastName: "Watson",
    role: "php",
    points: 580,
    rank: 6,
    createdAt: new Date().toISOString(),
    badge: "Wheeler",
  },
  {
    id: "7",
    email: "michael@school.edu",
    firstName: "Michael",
    lastName: "Chen",
    role: "php",
    points: 520,
    rank: 7,
    createdAt: new Date().toISOString(),
    badge: "Senior",
  },
  {
    id: "8",
    email: "sarah@school.edu",
    firstName: "Sarah",
    lastName: "Williams",
    role: "php",
    points: 480,
    rank: 8,
    createdAt: new Date().toISOString(),
    badge: "Junior",
  },
  {
    id: "9",
    email: "david@school.edu",
    firstName: "David",
    lastName: "Lee",
    role: "php",
    points: 450,
    rank: 9,
    createdAt: new Date().toISOString(),
    badge: "Wheeler",
  },
  {
    id: "10",
    email: "lisa@school.edu",
    firstName: "Lisa",
    lastName: "Anderson",
    role: "php",
    points: 420,
    rank: 10,
    createdAt: new Date().toISOString(),
    badge: "Senior",
  },
  {
    id: "11",
    email: "james@school.edu",
    firstName: "James",
    lastName: "Taylor",
    role: "php",
    points: 390,
    rank: 11,
    createdAt: new Date().toISOString(),
    badge: "Junior",
  },
  {
    id: "12",
    email: "olivia@school.edu",
    firstName: "Olivia",
    lastName: "Martinez",
    role: "php",
    points: 360,
    rank: 12,
    createdAt: new Date().toISOString(),
    badge: "Wheeler",
  },
];

export const PHPMembers = () => {
  const navigate = useNavigate();
  const [phps, setPHPs] = useState<PHPWithBadge[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBadge, setFilterBadge] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPHPs();
  }, []);

  const loadPHPs = async () => {
    try {
      setIsLoading(true);
      const phpsData = await getPHPMembers();

      const phpsWithBadges = mockPHPsWithBadges.map((mockPHP) => {
        const apiPHP = phpsData.find((s) => s.id === mockPHP.id);
        return apiPHP ? { ...apiPHP, badge: mockPHP.badge } : mockPHP;
      });

      setPHPs(phpsWithBadges.length > 0 ? phpsWithBadges : mockPHPsWithBadges);
    } catch (error) {
      console.error("Error loading PHPs:", error);
      setPHPs(mockPHPsWithBadges);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPHPs = phps.filter((php) => {
    const matchesSearch =
      searchQuery === "" ||
      `${php.firstName} ${php.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      php.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterBadge === "all" || php.badge === filterBadge;

    return matchesSearch && matchesFilter;
  });

  const getBadgeStyles = (badge?: string) => {
    switch (badge) {
      case "Senior":
        return "bg-yellow-700 text-white";
      case "Junior":
        return "bg-green-700 text-white";
      case "Wheeler":
        return "bg-indigo-700 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handlePHPClick = (phpId: string) => {
    navigate(`/profile/${phpId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#1E3A8A] dark:text-white mb-1 font-sans tracking-tight">
          PHP Members
        </h1>
        <div className="h-1 w-20 bg-[#1E3A8A] rounded-full mt-2" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-end">
        <div className="flex-1 w-full sm:max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search PHPs by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent bg-white dark:bg-gray-800 text-[#1F2937] dark:text-white font-sans transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="relative">
            <select
              value={filterBadge}
              onChange={(e) => setFilterBadge(e.target.value)}
              className={`px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent bg-white dark:bg-gray-800 text-[#1F2937] dark:text-white font-sans transition-all cursor-pointer appearance-none pr-10 shadow-sm ${
                filterBadge !== "all"
                  ? "border-[#1E3A8A] shadow-md"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              aria-label="Filter by badge"
            >
              <option value="all">All Badges</option>
              <option value="Senior">Senior</option>
              <option value="Junior">Junior</option>
              <option value="Wheeler">Wheeler</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="font-sans">Loading PHPs...</p>
        </div>
      ) : filteredPHPs.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="font-sans">No PHPs found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPHPs.map((php, index) => (
            <motion.div
              key={php.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white dark:bg-gray-800 border-2 border-[#1E3A8A]/20 rounded-xl shadow-md p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-[#1E3A8A]/40"
              onClick={() => handlePHPClick(php.id)}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white text-2xl font-semibold font-sans">
                  {php.firstName[0]}
                  {php.lastName[0]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white font-sans">
                    {php.firstName} {php.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-sans">
                    {php.email}
                  </p>
                </div>
                {php.badge && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold font-sans ${getBadgeStyles(
                      php.badge,
                    )}`}
                  >
                    {php.badge}
                  </span>
                )}
                <div className="flex gap-4 pt-2 border-t border-gray-200 dark:border-gray-700 w-full justify-center">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">
                      Points
                    </p>
                    <p className="text-sm font-semibold text-[#1F2937] dark:text-white font-sans">
                      {php.points}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">
                      Rank
                    </p>
                    <p className="text-sm font-semibold text-[#1F2937] dark:text-white font-sans">
                      #{php.rank}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

