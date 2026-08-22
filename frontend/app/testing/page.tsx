"use client"

import { useAuth } from "@/components/providers/auth-provider"

export default function ApiTest() {
  const { register } = useAuth()

  async function testRegister() {
    await register({
      first_name: "Test",
      last_name: "User",
      email: `test-${Date.now()}@example.com`,
      password: "StrongPassword123!",
    })
  }

  return (
    <button onClick={() => void testRegister()}>
      Test Register
    </button>
  )
}