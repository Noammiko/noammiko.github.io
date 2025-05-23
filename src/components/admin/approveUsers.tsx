import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample user data - in a real app, this would come from an API or database
const initialUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "pending", date: "2025-05-15" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "pending", date: "2025-05-16" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "approved", date: "2025-05-10" },
  { id: 4, name: "Alice Williams", email: "alice@example.com", status: "approved", date: "2025-05-12" },
  { id: 5, name: "Charlie Brown", email: "charlie@example.com", status: "pending", date: "2025-05-18" },
  { id: 6, name: "David Miller", email: "david@example.com", status: "pending", date: "2025-05-19" },
  { id: 7, name: "Emma Wilson", email: "emma@example.com", status: "pending", date: "2025-05-20" },
  { id: 8, name: "Frank Thomas", email: "frank@example.com", status: "approved", date: "2025-05-08" },
  { id: 9, name: "Grace Lee", email: "grace@example.com", status: "approved", date: "2025-05-09" },
  { id: 10, name: "Henry Garcia", email: "henry@example.com", status: "pending", date: "2025-05-21" },
  { id: 11, name: "Isabella Martinez", email: "isabella@example.com", status: "pending", date: "2025-05-22" },
  { id: 12, name: "Jack Robinson", email: "jack@example.com", status: "approved", date: "2025-05-07" },
  { id: 13, name: "Katherine Clark", email: "katherine@example.com", status: "approved", date: "2025-05-06" },
  { id: 14, name: "Liam Rodriguez", email: "liam@example.com", status: "pending", date: "2025-05-23" },
  { id: 15, name: "Mia Lewis", email: "mia@example.com", status: "pending", date: "2025-05-24" },
]

export default function AdminPage() {
  const [users, setUsers] = useState(initialUsers)
  const [activeTab, setActiveTab] = useState("pending")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const pendingUsers = users.filter((user) => user.status === "pending")
  const approvedUsers = users.filter((user) => user.status === "approved")

  // Get current users based on pagination
  const getCurrentUsers = (userList: typeof users) => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return userList.slice(indexOfFirstItem, indexOfLastItem)
  }

  const currentPendingUsers = getCurrentUsers(pendingUsers)
  const currentApprovedUsers = getCurrentUsers(approvedUsers)

  // Calculate total pages
  const totalPendingPages = Math.ceil(pendingUsers.length / itemsPerPage)
  const totalApprovedPages = Math.ceil(approvedUsers.length / itemsPerPage)

  const handleApprove = (userId: number) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, status: "approved" } : user)))
  }

  const handleDeny = (userId: number) => {
    setUsers(users.filter((user) => user.id !== userId))
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  // Get total pages based on active tab
  const getTotalPages = () => {
    return activeTab === "pending" ? totalPendingPages : totalApprovedPages
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Approve or deny user registrations and view existing users</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="pending"
            onValueChange={(value) => {
              setActiveTab(value)
              setCurrentPage(1) // Reset to first page when changing tabs
            }}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="pending">
                Pending Approval
                <Badge variant="secondary" className="ml-2">
                  {pendingUsers.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved Users
                <Badge variant="secondary" className="ml-2">
                  {approvedUsers.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pendingUsers.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No pending users to approve</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">Email</th>
                          <th className="text-left py-3 px-4">Date</th>
                          <th className="text-right py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPendingUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">{user.name}</td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">{user.date}</td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleApprove(user.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeny(user.id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Deny
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {renderPagination(pendingUsers.length)}
                </>
              )}
            </TabsContent>

            <TabsContent value="approved">
              {approvedUsers.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No approved users yet</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">Email</th>
                          <th className="text-left py-3 px-4">Date</th>
                          <th className="text-left py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentApprovedUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">{user.name}</td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">{user.date}</td>
                            <td className="py-3 px-4">
                              <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100">
                                Approved
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {renderPagination(approvedUsers.length)}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )

  function renderPagination(totalItems: number) {
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    if (totalItems === 0) return null

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1 mx-2">
            <span className="text-sm">
              Page {currentPage} of {totalPages || 1}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} -{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
        </div>
      </div>
    )
  }
}
