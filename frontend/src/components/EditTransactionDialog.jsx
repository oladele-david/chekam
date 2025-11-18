import React, { useState, useEffect } from 'react'
import { useSelector } from  'react-redux'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Apple, Bus, DollarSign, GraduationCap, Home, Pill, TrendingUp, User } from 'lucide-react'
import ApiClient from '@/api/ApiClient'
import TransactionEndpoint from '@/api/TransactionEndpoint'
import CategoryEndpoint from '@/api/CategoryEndpoint'

const icons = [
  { name: 'Apple', component: Apple },
  { name: 'Bus', component: Bus },
  { name: 'DollarSign', component: DollarSign },
  { name: 'GraduationCap', component: GraduationCap },
  { name: 'Home', component: Home },
  { name: 'Pill', component: Pill },
  { name: 'TrendingUp', component: TrendingUp },
  { name: 'User', component: User },
]

export default function EditTransactionDialog({ transaction, onClose, onSave }) {
  const access_token = useSelector((state) => state.auth.access_token)
  const user = useSelector((state) => state.auth.user)

  const [title, setTitle] = useState(transaction.title)
  const [amount, setAmount] = useState(transaction.amount)
  const [date, setDate] = useState(transaction.date)
  const [categoryId, setCategoryId] = useState(transaction.category_id)
  const [selectedIcon, setSelectedIcon] = useState(transaction.icon)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [categories, setCategories] = useState([])

  const apiClient = new ApiClient(import.meta.env.VITE_DEVELOPMENT_URL, access_token)
  const transactionEndpoint = new TransactionEndpoint(apiClient)
  const categoryEndpoint = new CategoryEndpoint(apiClient)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await categoryEndpoint.getCategoriesByUser(user.id)
        setCategories(response)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [user.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const data = {
      title: title,
      amount: parseFloat(amount),
      date: date,
      category_id: categoryId,
      icon: selectedIcon,
    }

    try {
      const updatedTransaction = await transactionEndpoint.updateTransaction(transaction.id, data)
      setMessage('Transaction updated successfully!')
      onSave(updatedTransaction)
      setTimeout(() => {
        setMessage('')
        onClose()
      }, 2000)
    } catch (error) {
      setMessage('Failed to update transaction.')
      console.error('Error updating transaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>Modify the transaction details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Icon</Label>
            <div className="col-span-3 flex flex-wrap gap-2">
              {icons.map((icon) => (
                <Button
                  key={icon.name}
                  type="button"
                  variant={selectedIcon === icon.name ? "default" : "outline"}
                  size="icon"
                  className="w-12 h-12"
                  onClick={() => setSelectedIcon(icon.name)}
                >
                  <icon.component className="h-6 w-6 text-gray-400" />
                </Button>
              ))}
            </div>
          </div>
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white mt-4" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          {message && <p className={`mt-2 ${message.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
        </form>
      </DialogContent>
    </Dialog>
  )
}