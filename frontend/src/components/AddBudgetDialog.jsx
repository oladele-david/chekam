import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Apple, Home, User, Pill, Bus, TrendingUp, GraduationCap, DollarSign } from 'lucide-react';
import ApiClient from '@/api/ApiClient';
import BudgetEndpoint from '@/api/BudgetEndpoint';
import CategoryEndpoint from '@/api/CategoryEndpoint';

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

export default function AddBudgetDialog({ onBudgetAdded }) {
  const user = useSelector((state) => state.auth.user);
  const access_token = useSelector((state) => state.auth.access_token);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
      user_id: user.id,
      category_id: categoryId,
      title: title,
      amount: parseFloat(amount),
      current_amount: parseFloat(currentAmount),
      start_date: startDate,
      end_date: endDate,
      icon: selectedIcon,
    };

    try {
      const newBudget = await budgetEndpoint.createBudget(data);
      console.log('Budget created:', newBudget);

      onBudgetAdded(newBudget); // Inform the parent component
      setSuccessMessage('Budget added successfully!');
      setTimeout(() => {
        setOpen(false);
        setSuccessMessage('');
      }, 2000);

      // Reset form
      setTitle('');
      setAmount('');
      setCurrentAmount('');
      setStartDate('');
      setEndDate('');
      setCategoryId('');
      setSelectedIcon('');
    } catch (error) {
      console.error('Error creating budget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          Create Budget
          <span className="ml-2">+</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category"/>
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
                value={startDate}
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
                value={endDate}
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
                    <icon.component className="h-6 w-6 text-gray-400"/>
                  </Button>
              ))}
            </div>
          </div>
          <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white mt-4" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Budget'}
          </Button>
          {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}