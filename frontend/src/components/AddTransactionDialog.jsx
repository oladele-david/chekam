import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ApiClient from '@/api/ApiClient'
import TransactionEndpoint from '@/api/TransactionEndpoint'
import CategoryEndpoint from '@/api/CategoryEndpoint'

export default function AddTransactionDialog({ onTransactionAdded }) {
  const user = useSelector((state) => state.auth.user)
  const access_token = useSelector((state) => state.auth.access_token)

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [endDate, setEndDate] = useState('')
  const [transactionDescription, setTransactionDescription] = useState('')
  const [frequency, setFrequency] = useState('')

  const apiClient = new ApiClient(import.meta.env.VITE_DEVELOPMENT_URL, access_token)
  const transactionEndpoint = new TransactionEndpoint(apiClient)
  const categoryEndpoint = new CategoryEndpoint(apiClient)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await categoryEndpoint.getCategoriesByUser(user.id)
        setCategories(response)
        if (response.length > 0) {
          setCategoryId(response[0].id.toString())
        }
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
      user_id: user.id,
      category_id: categoryId,
      title: title,
      amount: parseFloat(amount),
      date: date,
      end_date: endDate,
      description: description,
      frequency: frequency,
      icon: title.slice(0, 2).toUpperCase(),
    }

    try {
      const newTransaction = await transactionEndpoint.createTransaction(data)
      console.log('Transaction created:', newTransaction)

      onTransactionAdded(newTransaction)
      setSuccessMessage('Transaction added successfully!')
      setTimeout(() => {
        setOpen(false)
        setSuccessMessage('')
      }, 2000)

      // Reset form
      setTitle('')
      setAmount('')
      setDate('')
      setCategoryId('')
      setEndDate('')
      setTransactionDescription('')
      setFrequency('')
    } catch (error) {
      console.error('Error creating transaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
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
            <Label htmlFor="endDate" className="text-right">
              End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={transactionDescription}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Enter a brief description"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">
              Frequency
            </Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">One-time</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white mt-4" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Transaction'}
          </Button>
          {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
        </form>
      </DialogContent>
    </Dialog>
  )
}