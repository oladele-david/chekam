import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Apple, Bus, DollarSign, GraduationCap, Home, MoreVertical, Pill, TrendingUp, User } from 'lucide-react'
import Layout from '@/components/Layout'
import AddTransactionDialog from '@/components/AddTransactionDialog'
import EditTransactionDialog from '@/components/EditTransactionDialog'
import ApiClient from '@/api/ApiClient'
import TransactionEndpoint from '@/api/TransactionEndpoint'

export default function TransactionDashboard() {
  const user = useSelector((state) => state.auth.user)
  const access_token = useSelector((state) => state.auth.access_token)
  const [transactions, setTransactions] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const dropdownRef = useRef(null)
  const [editTransaction, setEditTransaction] = useState(null)

  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('en-UK', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  })

  const apiClient = new ApiClient(import.meta.env.VITE_DEVELOPMENT_URL, access_token)
  const transactionEndpoint = new TransactionEndpoint(apiClient)

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await transactionEndpoint.getTransactionsByUser(user.id)
        const transactionData = response.map((transaction) => ({
          ...transaction,
          icon: getIconComponent(transaction.category.icon)
        }))
        setTransactions(transactionData)
      } catch (error) {
        console.error('Error fetching transactions:', error)
      }
    }

    fetchTransactions()
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

  const handleTransactionAdded = (newTransaction) => {
    const transactionWithIcon = {
      ...newTransaction,
      icon: getIconComponent(newTransaction.category.icon)
    }
    setTransactions((prevTransactions) => [...prevTransactions, transactionWithIcon])
  }

  const handleSaveTransaction = (updatedTransaction) => {
    const transactionWithIcon = {
      ...updatedTransaction,
      icon: getIconComponent(updatedTransaction.category.icon)
    }
    setTransactions((prevTransactions) =>
      prevTransactions.map((trans) => (trans.id === updatedTransaction.id ? transactionWithIcon : trans))
    )
    // Optionally send updatedTransaction to the backend here
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
            <h1 className="text-2xl font-bold text-customDark">Transactions</h1>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
          <AddTransactionDialog onTransactionAdded={handleTransactionAdded} />
        </div>

        <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {transactions.map((transaction, index) => (
            <Card key={transaction.id} className="bg-white relative">
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
                      onClick={() => setEditTransaction(transaction)}>Edit
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Delete</li>
                  </ul>
                </div>
              )}

              <CardContent className="pt-8 pb-4 px-4 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-4xl">
                    {transaction.icon}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 text-lg mb-2">{transaction.title}</h3>
                <div className={`flex items-center ${transaction.type === 'Expense' ? 'text-red-500' : 'text-green-500'}`}>
                  <div className={`w-3 h-3 rounded-full ${transaction.type === 'Expense' ? 'bg-red-500' : 'bg-green-500'} mr-2`}></div>
                  <span className="text-sm">{transaction.type}</span>
                </div>
                <div className="w-full mt-4 text-center">
                  <span className="font-medium text-lg">{transaction.amount}</span>
                  <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
              </CardContent>
              {editTransaction && editTransaction.id === transaction.id && (
                <EditTransactionDialog
                  transaction={editTransaction}
                  onClose={() => setEditTransaction(null)}
                  onSave={handleSaveTransaction}
                />
              )}
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  )
}