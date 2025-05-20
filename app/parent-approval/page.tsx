"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { verifyParentApproval } from "@/app/actions/auth-actions"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ParentApprovalPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [childName, setChildName] = useState("")

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setStatus("error")
        setMessage("No approval token provided. Please check the link in your email.")
        return
      }

      try {
        const result = await verifyParentApproval(token)

        if (result.success) {
          setStatus("success")
          setMessage(result.message || "Approval successful!")
          setChildName(result.childName || "your child")
        } else {
          setStatus("error")
          setMessage(result.error || "Failed to verify approval token.")
        }
      } catch (error) {
        console.error("Error verifying token:", error)
        setStatus("error")
        setMessage("An unexpected error occurred. Please try again later.")
      }
    }

    verifyToken()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Parent Approval</CardTitle>
          <CardDescription className="text-center">Verify and approve your child's PathPiper account</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center py-6">
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              <p className="text-gray-600">Verifying approval token...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center space-y-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h3 className="text-xl font-medium text-green-700">Approval Successful!</h3>
              <p className="text-gray-600">
                Thank you for approving {childName}'s PathPiper account. They can now fully access the platform.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center space-y-4 text-center">
              <XCircle className="h-16 w-16 text-red-500" />
              <h3 className="text-xl font-medium text-red-700">Approval Failed</h3>
              <p className="text-gray-600">{message}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link href="/" passHref>
            <Button className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600">
              Return to Homepage
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
