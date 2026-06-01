let mockUsers = [
  { id: "1", username: "admin_user", email: "admin@damco.com", role: "Admin", status: "Active" },
  { id: "2", username: "jane_doe", email: "jane.doe@damco.com", role: "User", status: "Active" }
];

const userService = {
  getUsers: async () => {
    return { status: "success", users: mockUsers };
  },

  createUser: async (user) => {
    const newUser = { id: Math.random().toString(36).substring(7), ...user };
    mockUsers.push(newUser);
    return { status: "success", user: newUser };
  },

  updateUser: async (user) => {
    mockUsers = mockUsers.map(u => u.id === user.id ? { ...u, ...user } : u);
    return { status: "success", user };
  },

  deleteUser: async (user_ids) => {
    mockUsers = mockUsers.filter(u => !user_ids.includes(u.id));
    return { status: "success" };
  },
};

export default userService; 