import type { User } from "../types";

export type MockUserRecord = Record<
  string,
  {
    user: User;
    password: string;
  }
>;

// Shared mock users for MVP mode so multiple services can update points/roles.
export const MOCK_USERS: MockUserRecord = {
  "admin@school.edu": {
    user: {
      id: "1",
      email: "admin@school.edu",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      points: 0,
      rank: 0,
      createdAt: new Date().toISOString(),
    },
    password: "admin123",
  },
  "student@school.edu": {
    user: {
      id: "2",
      email: "student@school.edu",
      firstName: "John",
      lastName: "Student",
      role: "student",
      points: 150,
      rank: 5,
      createdAt: new Date().toISOString(),
    },
    password: "student123",
  },
  "php@school.edu": {
    user: {
      id: "3",
      email: "php@school.edu",
      firstName: "Jane",
      lastName: "PHP",
      role: "php",
      points: 500,
      rank: 2,
      createdAt: new Date().toISOString(),
    },
    password: "php123",
  },
};

export function getMockUserByEmail(email: string) {
  return MOCK_USERS[email.toLowerCase()];
}

export function getMockUserById(id: string): User | null {
  const entry = Object.values(MOCK_USERS).find((u) => u.user.id === id);
  return entry?.user ?? null;
}

export function getMockAdminIds(): string[] {
  return Object.values(MOCK_USERS)
    .filter((u) => u.user.role === "admin")
    .map((u) => u.user.id);
}

export function updateMockUser(userId: string, patch: Partial<User>): User | null {
  const entry = Object.values(MOCK_USERS).find((u) => u.user.id === userId);
  if (!entry) return null;

  entry.user = { ...entry.user, ...patch };

  // Keep current-session user in sync for MVP mode.
  const stored = localStorage.getItem("user");
  if (stored) {
    try {
      const current: User = JSON.parse(stored);
      if (current.id === userId) {
        const merged = { ...current, ...patch };
        localStorage.setItem("user", JSON.stringify(merged));
      }
    } catch {
      // ignore
    }
  }

  return entry.user;
}

export function addMockUser(email: string, user: User, password: string) {
  MOCK_USERS[email.toLowerCase()] = { user, password };
}

