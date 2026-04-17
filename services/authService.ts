type LoginPayload = {
  email: string
  password: string
}

type LoginResponse = {
  success: boolean
  token: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1100))

  // BACKEND INTEGRATION POINT:
  // Replace this entire mock function with:
  // return apiRequest<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) })
  return {
    success: true,
    token: "mock-jwt-token",
    user: {
      id: "demo-user-1",
      name: "Hackathon Demo User",
      email: payload.email,
      role: "analyst",
    },
  }
}
