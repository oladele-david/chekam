import React from 'react'
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {MoreVertical} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import DashboardHeader from "@/components/DashboardHeader"
import AddCategoryDialog from '@/components/AddCategoryDialog'

const categories = [
    {name: 'Food', icon: '🥗', type: 'Expense'},
    {name: 'Bills & Utilities', icon: '🏠', type: 'Expense'},
    {name: 'Personal', icon: '👤', type: 'Expense'},
    {name: 'Healthcare', icon: '💊', type: 'Expense'},
    {name: 'Transport', icon: '🚌', type: 'Expense'},
    {name: 'Investment', icon: '📈', type: 'Income'},
    {name: 'Education', icon: '🎓', type: 'Expense'},
    {name: 'Other', icon: '💰', type: 'Income'},
]

export default function CategoriesPage() {
    const currentDate = new Date()
    const formattedDate = currentDate.toLocaleDateString('en-UK', {
        day: 'numeric',
        month: 'long',
        weekday: 'long',
    })

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
                        <AddCategoryDialog />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categories.map((category, index) => (
                            <Card key={category.name} className="bg-white relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 bg-transparent  hover:bg-gray-100 rounded-sm p-1 outline-0"
                                >
                                    <MoreVertical className="h-5 w-5 text-gray-400"/>
                                </Button>
                                <CardContent className="pt-8 pb-4 px-4 flex flex-col items-center">
                                    <div
                                        className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                        <span className="text-3xl">{category.icon}</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 text-lg mb-2">{category.name}</h3>
                                    <div
                                        className={`flex items-center ${category.type === 'Expense' ? 'text-red-500' : 'text-green-500'}`}>
                                        <div
                                            className={`w-3 h-3 rounded-full ${category.type === 'Expense' ? 'bg-red-500' : 'bg-green-500'} mr-2`}></div>
                                        <span className="text-sm">{category.type}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    )
}