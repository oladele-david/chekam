import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Apple, Home, User, Pill, Bus, TrendingUp, GraduationCap, DollarSign } from 'lucide-react'

const icons = [
  { name: 'Apple', component: Apple },
  { name: 'Home', component: Home },
  { name: 'User', component: User },
  { name: 'Pill', component: Pill },
  { name: 'Bus', component: Bus },
  { name: 'TrendingUp', component: TrendingUp },
  { name: 'GraduationCap', component: GraduationCap },
  { name: 'DollarSign', component: DollarSign },
]

export default function AddCategoryDialog() {
  const [open, setOpen] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryType, setCategoryType] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Here you would typically send the data to your backend API
    // For example:
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryName, type: categoryType, description: categoryDescription, icon: selectedIcon }),
    })
    console.log('Submitting:', { categoryName, categoryType, categoryDescription, selectedIcon })
    setOpen(false)
    // Reset form
    setCategoryName('')
    setCategoryType('')
    setCategoryDescription('')
    setSelectedIcon('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          Create
          <span className="ml-2">+</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select value={categoryType} onValueChange={setCategoryType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              className="col-span-3"
              placeholder="Enter a brief description"
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
          <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white mt-4">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}