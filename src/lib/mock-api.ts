/**
 * Mock API for development - Backend server o'rniga
 */

export interface MockUser {
  email: string;
  full_name: string;
  groups: null;
  id: string;
  phone: string;
  role: string;
  username: string;
  token: string;
}

export const mockUsers: MockUser[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@ielts.com",
    full_name: "Admin User",
    phone: "+998901234567",
    role: "admin", 
    groups: null,
    token: "mock-admin-token-123"
  },
  {
    id: "2", 
    username: "teacher",
    email: "teacher@ielts.com",
    full_name: "Teacher User",
    phone: "+998901234568",
    role: "teacher",
    groups: null,
    token: "mock-teacher-token-456"  
  },
  {
    id: "3",
    username: "student", 
    email: "student@ielts.com",
    full_name: "Student User",
    phone: "+998901234569",
    role: "student",
    groups: null,
    token: "mock-student-token-789"
  },
  {
    id: "4",
    username: "demo",
    email: "demo@ielts.com", 
    full_name: "Demo User",
    phone: "+998901234560",
    role: "student",
    groups: null,
    token: "mock-demo-token-000"
  }
];

// Mock login function
export const mockLogin = async (username: string, password: string): Promise<MockUser> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = mockUsers.find(u => u.username === username);
  
  if (!user) {
    throw new Error("Invalid username");
  }
  
  // Any password works for demo (in real app, check password properly)
  if (password.length < 1) {
    throw new Error("Password required");
  }
  
  return user;
};

// Mock getMe function - returns user without token
export const mockGetMe = async (token: string): Promise<Omit<MockUser, 'token'>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const user = mockUsers.find(u => u.token === token);
  
  if (!user) {
    throw new Error("Invalid token");
  }
  
  // Return user without token field (as expected by auth store)
  const { token: _, ...userWithoutToken } = user;
  return userWithoutToken;
};

console.log("🎭 Mock API loaded - Available users:", mockUsers.map(u => u.username));
