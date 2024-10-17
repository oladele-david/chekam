import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Apple, Bus, DollarSign, GraduationCap, Home, MoreVertical, Pill, TrendingUp, User} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from "@/components/DashboardHeader";
import AddCategoryDialog from '@/components/AddCategoryDialog';
import EditCategoryDialog from '@/components/EditCategoryDialog';
import ApiClient from '@/api/ApiClient';
import CategoryEndpoint from '@/api/CategoryEndpoint';

export default function CategoriesPage() {
    const user = useSelector((state) => state.auth.user);
    const access_token = useSelector((state) => state.auth.access_token);
    const [categories, setCategories] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const dropdownRef = useRef(null);
    const [editCategory, setEditCategory] = useState(null);

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-UK', {
        day: 'numeric',
        month: 'long',
        weekday: 'long',
    });

    const apiClient = new ApiClient(import.meta.env.VITE_DEVELOPMENT_URL, access_token);
    const categoryEndpoint = new CategoryEndpoint(apiClient);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await categoryEndpoint.getCategoriesByUser(user.id);
                const categoryData = response.map((category) => ({
                    ...category,
                    icon: getIconComponent(category.icon)
                }));
                setCategories(categoryData);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        }

        fetchCategories();
    }, [user.id]);

    const getIconComponent = (iconName) => {
        const icons = {
            Apple: <Apple/>,
            Bus: <Bus/>,
            DollarSign: <DollarSign/>,
            GraduationCap: <GraduationCap/>,
            Home: <Home/>,
            Pill: <Pill/>,
            TrendingUp: <TrendingUp/>,
            User: <User/>
        };
        return icons[iconName] || <MoreVertical/>;
    };

    const handleCategoryAdded = (newCategory) => {
        const categoryWithIcon = {
            ...newCategory,
            icon: getIconComponent(newCategory.icon)
        };
        setCategories((prevCategories) => [...prevCategories, categoryWithIcon]);
    };

    const handleSaveCategory = (updatedCategory) => {
        const categoryWithIcon = {
            ...updatedCategory,
            icon: getIconComponent(updatedCategory.icon)
        };
        setCategories((prevCategories) =>
            prevCategories.map((cat) => (cat.id === updatedCategory.id ? categoryWithIcon : cat))
        );
        // Optionally send updatedCategory to the backend here
    };

    const handleDropdownToggle = (index) => {
        setDropdownOpen(dropdownOpen === index ? null : index);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(null);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 hidden lg:block">
                <Sidebar/>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader/>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
                            <p className="text-sm text-gray-500">{formattedDate}</p>
                        </div>
                        <AddCategoryDialog onCategoryAdded={handleCategoryAdded}/>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categories.map((category, index) => (
                            <Card key={category.id} className="bg-white relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 bg-transparent hover:bg-gray-100 rounded-sm p-1 outline-0"
                                    onClick={() => handleDropdownToggle(index)}
                                >
                                    <MoreVertical className="h-5 w-5 text-gray-400"/>
                                </Button>

                                {dropdownOpen === index && (
                                    <div ref={dropdownRef}
                                         className="absolute top-10 right-2 w-24 bg-white border border-gray-200 shadow-lg rounded-md z-10">
                                        <ul>
                                            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => setEditCategory(category)}>Edit
                                            </li>
                                            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Delete</li>
                                        </ul>
                                    </div>
                                )}

                                <CardContent className="pt-8 pb-4 px-4 flex flex-col items-center">
                                    <div
                                        className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <span className="text-4xl">
                      {category.icon}
                    </span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 text-lg mb-2">{category.name}</h3>
                                    <div
                                        className={`flex items-center ${category.type === 'Expense' ? 'text-red-500' : 'text-green-500'}`}>
                                        <div
                                            className={`w-3 h-3 rounded-full ${category.type === 'Expense' ? 'bg-red-500' : 'bg-green-500'} mr-2`}></div>
                                        <span className="text-sm">{category.type}</span>
                                    </div>
                                </CardContent>
                                {editCategory && editCategory.id === category.id && (
                                    <EditCategoryDialog
                                        category={editCategory}
                                        onClose={() => setEditCategory(null)}
                                        onSave={handleSaveCategory}
                                    />
                                )}
                            </Card>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}