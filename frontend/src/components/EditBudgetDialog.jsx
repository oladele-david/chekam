import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Apple, Bus, DollarSign, GraduationCap, Home, Pill, TrendingUp, User } from 'lucide-react';
import ApiClient from '@/api/ApiClient';
import BudgetEndpoint from '@/api/BudgetEndpoint';
import CategoryEndpoint from '@/api/CategoryEndpoint';
import { useSelector } from "react-redux";

const icons = [
  { name: 'Apple', component: Apple },
  { name: 'Home', component: Home },
  { name: 'User', component: User },
  { name: 'Pill', component: Pill },
  { name: 'Bus', component: Bus },
  { name: 'TrendingUp', component: TrendingUp },
  { name: 'GraduationCap', component: GraduationCap },
  { name: 'DollarSign', component: DollarSign },
];

export default function EditBudgetDialog({ budget, onClose, onSave }) {
  const access_token = useSelector((state) => state.auth.access_token);
  const user = useSelector((state) => state.auth.user);

  const [title, setTitle] = useState(budget.title || '');
  const [amount, setAmount] = useState(budget.amount || '');
  const [currentAmount, setCurrentAmount] = useState(budget.current_amount || '');
  const [startDate, setStartDate] = useState(budget.start_date || '');
  const [endDate, setEndDate] = useState(budget.end_date || '');
  const [categoryId, setCategoryId] = useState(budget.category?.id || '');
  const [selectedIcon, setSelectedIcon] = useState(budget.icon || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);

  const apiClient = new ApiClient(import.meta.env.VITE_DEVELOPMENT_URL, access_token);
  const budgetEndpoint = new BudgetEndpoint(apiClient);
  const categoryEndpoint = new CategoryEndpoint(apiClient);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await categoryEndpoint.getCategoriesByUser(user.id);
        setCategories(response);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }

    fetchCategories();
  }, [user.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      title,
      amount: parseFloat(amount),
      current_amount: parseFloat(currentAmount),
      start_date: startDate,
      end_date: endDate,
      category_id: categoryId,
      icon: selectedIcon,
    };

    try {
      const updatedBudget = await budgetEndpoint.updateBudget(budget.id, data);
      setMessage('Budget updated successfully!');
      onSave(updatedBudget);
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 2000);
    } catch (error) {
      setMessage('Failed to update budget.');
      console.error('Error updating budget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
          <DialogDescription>Edit your budget details and update spending limits.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={categoryId.toString()} onValueChange={setCategoryId}>
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
              Budget Title
            </Label>
            <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                required
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
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currentAmount" className="text-right">
              Current Amount
            </Label>
            <Input
              id="currentAmount"
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate.substring(0, 10)}
              onChange={(e) => setStartDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate.substring(0, 10)}
              onChange={(e) => setEndDate(e.target.value)}
              className="col-span-3"
              required
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
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
          {message && <p className={`mt-2 ${message.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}