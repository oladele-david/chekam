import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Apple, Bus, DollarSign, GraduationCap, Home, MoreVertical, Pill, TrendingUp, User } from 'lucide-react'
import Layout from '@/components/Layout'
import AddBudgetDialog from '@/components/AddBudgetDialog'
import EditBudgetDialog from '@/components/EditBudgetDialog'
import ApiClient from '@/api/ApiClient'
import BudgetEndpoint from '@/api/BudgetEndpoint'

export default function BudgetDashboard() {
  const user = useSelector((state) => state.auth.user)
  const access_token = useSelector((state) => state.auth.access_token)
  const [budgets, setBudgets] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const dropdownRef = useRef(null)
  const [editBudget, setEditBudget] = useState(null)

  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('en-UK', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  })

  const apiClient = new ApiClient(import.meta.env.VITE_DEVELOPMENT_URL, access_token)
  const budgetEndpoint = new BudgetEndpoint(apiClient)

  useEffect(() => {
    async function fetchBudgets() {
      try {
        const response = await budgetEndpoint.getBudgetsByUser(user.id)
        const budgetData = response.map((budget) => ({
          ...budget,
          icon: getIconComponent(budget.icon)
        }))
        setBudgets(budgetData)
      } catch (error) {
        console.error('Error fetching budgets:', error)
      }
    }

    fetchBudgets()
  }, [user.id])

  const getIconComponent = (iconName) => {
    const icons = {
      Apple: <Apple />,
      Bus: <Bus />,
      DollarSign: <DollarSign />,
      GraduationCap: <GraduationCap />,
      Home: <Home />,
      Pill: <Pill />,
      TrendingUp: <TrendingUp />,
      User: <User />
    }
    return icons[iconName] || <MoreVertical />
  }

  const handleBudgetAdded = (newBudget) => {
    const budgetWithIcon = {
      ...newBudget,
      icon: getIconComponent(newBudget.icon)
    }
    setBudgets((prevBudgets) => [...prevBudgets, budgetWithIcon])
  }

  const handleSaveBudget = (updatedBudget) => {
    const budgetWithIcon = {
      ...updatedBudget,
      icon: getIconComponent(updatedBudget.icon)
    }
    setBudgets((prevBudgets) =>
      prevBudgets.map((bud) => (bud.id === updatedBudget.id ? budgetWithIcon : bud))
    )
    // Optionally send updatedBudget to the backend here
  }

  const handleDropdownToggle = (index) => {
    setDropdownOpen(dropdownOpen === index ? null : index)
  }

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(null)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Budgets</h1>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
          <AddBudgetDialog onBudgetAdded={handleBudgetAdded} />
        </div>

        <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Budgets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {budgets.map((budget, index) => (
            <Card key={budget.id} className="bg-white relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-transparent hover:bg-gray-100 rounded-sm p-1 outline-0"
                onClick={() => handleDropdownToggle(index)}
              >
                <MoreVertical className="h-5 w-5 text-gray-400" />
              </Button>

              {dropdownOpen === index && (
                <div ref={dropdownRef}
                  className="absolute top-10 right-2 w-24 bg-white border border-gray-200 shadow-lg rounded-md z-10">
                  <ul>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => setEditBudget(budget)}>Edit
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Delete</li>
                  </ul>
                </div>
              )}

              <CardContent className="pt-8 pb-4 px-4 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-4xl">
                    {budget.icon}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 text-lg mb-2">{budget.name}</h3>
                <div className={`flex items-center ${budget.category.type === 'Expense' ? 'text-red-500' : 'text-green-500'}`}>
                  <div className={`w-3 h-3 rounded-full ${budget.category.type === 'Expense' ? 'bg-red-500' : 'bg-green-500'} mr-2`}></div>
                  <span className="text-sm">{budget.category.type}</span>
                </div>
                <div className="w-full mt-4">
                  <Progress value={(budget.current_amount / budget.amount) * 100} className="h-2" />
                  <div className="flex justify-between text-sm mt-2">
                    <span className="font-medium">{budget.current_amount} of {budget.amount}</span>
                  </div>
                </div>
              </CardContent>
              {editBudget && editBudget.id === budget.id && (
                <EditBudgetDialog
                  budget={editBudget}
                  onClose={() => setEditBudget(null)}
                  onSave={handleSaveBudget}
                />
              )}
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  )
}