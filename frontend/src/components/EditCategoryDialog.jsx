import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Apple, Bus, DollarSign, GraduationCap, Home, Pill, TrendingUp, User } from 'lucide-react';
import ApiClient from '@/api/ApiClient';
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

export default function EditCategoryDialog({ category, onClose, onSave }) {
  const access_token = useSelector((state) => state.auth.access_token);

  const [categoryName, setCategoryName] = useState(category.name);
  const [categoryType, setCategoryType] = useState(category.type);
  const [categoryDescription, setCategoryDescription] = useState(category.description);
  const [selectedIcon, setSelectedIcon] = useState(category.icon); // Ensure this matches an icon name in your `icons`
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const apiClient = new ApiClient(import.meta.env.VITE_DEVELOPMENT_URL, access_token);
  const categoryEndpoint = new CategoryEndpoint(apiClient);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      name: categoryName,
      type: categoryType,
      icon: selectedIcon,
      description: categoryDescription,
      predefined_category_id: null,
    };

    try {
      const updatedCategory = await categoryEndpoint.updateCategory(category.id, data);
      setMessage('Category updated successfully!');
      onSave(updatedCategory);
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 2000);
    } catch (error) {
      setMessage('Failed to update category.');
      console.error('Error updating category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>Update the category information and settings.</DialogDescription>
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
              required
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
                <SelectItem value="Income">Income</SelectItem>
                <SelectItem value="Expense">Expense</SelectItem>
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
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white mt-4" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
          {message && <p className={`mt-2 ${message.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}