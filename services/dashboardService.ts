export type DashboardMetric = {
  label: string
  value: string | number
  note: string
  tone: "sky" | "green" | "amber" | "red"
}

export type DashboardPayload = {
  updatedAt: string
  metrics: DashboardMetric[]
}

export async function fetchDashboardData(): Promise<DashboardPayload> {
  await new Promise((resolve) => setTimeout(resolve, 900))

  // BACKEND INTEGRATION POINT:
  // Replace this mock function with:
  // return apiRequest<DashboardPayload>("/dashboard/overview")
  return {
    updatedAt: new Date().toISOString(),
    metrics: [
      { label: "High Risk Zones", value: 6, note: "Live environmental triggers", tone: "red" },
      { label: "Air Quality Index", value: 2, note: "National average", tone: "amber" },
      { label: "Safe Water States", value: 25, note: "Monitored in real time", tone: "green" },
      { label: "Response Readiness", value: "87%", note: "Emergency network coverage", tone: "sky" },
    ],
  }
}
