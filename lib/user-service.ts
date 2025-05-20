import type { User } from "./types"

// Mock user data - in a real app, this would come from an API
const users: User[] = [
  {
    id: "1",
    name: "Panduranga gawas",
    company: "rangaone finwala",
    avatar: "/abstract-geometric-shapes.png",
  },
  {
    id: "2",
    name: "Rahul Sharma",
    company: "rangaone finwala",
    avatar: "/abstract-geometric-blue.png",
  },
  {
    id: "3",
    name: "Priya Patel",
    company: "rangaone finwala",
    avatar: "/abstract-geometric-green.png",
  },
]

export async function getUserById(id: string): Promise<User | null> {
  // Simulate API call with a small delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = users.find((user) => user.id === id)
      resolve(user || null)
    }, 300)
  })
}

export async function getCurrentUser(): Promise<User> {
  // In a real app, this would get the current authenticated user
  // For now, we'll just return the first user
  return getUserById("1").then((user) => user || users[0])
}
