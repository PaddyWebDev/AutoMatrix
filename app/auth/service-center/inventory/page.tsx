/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Edit, Search, AlertTriangle } from "lucide-react";
import CreateInventoryItem from "@/components/service-center/create-inventory-item";
import { useSessionContext } from "@/context/session";
import { useInventory } from "@/hooks/service-center";
import Loader from "@/components/Loader";
import TanstackError from "@/components/TanstackError";
import { Inventory } from "@prisma/client";
import DeleteInventoryItem from "@/components/service-center/delete-inventory-item";
import AddQuantityInventoryItem from "@/components/service-center/edit-inventory-item";

export default function InventoryPage() {
    const { session } = useSessionContext();
    const { data: inventory, isLoading, isFetching, isError } = useInventory(session?.user.id!)
    const [searchTerm, setSearchTerm] = useState("");

    if (isLoading || isFetching) {
        return (
            <Loader />
        )
    }

    if (isError || inventory === undefined || inventory.length === undefined) {
        return (
            <TanstackError />
        )
    }




    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStockStatus = (item: Inventory) => {
        if (item.quantity === 0) return { status: "Out of Stock", variant: "destructive" };
        if (item.quantity <= 10) return { status: "Low Stock", variant: "secondary" };
        return { status: "In Stock", variant: "default" };
    };



    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Inventory Management</h1>
                {/* add the dialog for inventory creation */}
                <CreateInventoryItem serviceCenterId={session?.user.id!} />
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                    <Input
                        placeholder="Search by name, SKU, brand, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Inventory Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="dark:bg-neutral-800 bg-neutral-100">
                    <CardContent className="p-4 flex items-center gap-2 justify-center flex-col">
                        <div className="text-2xl font-bold">{inventory.length}</div>
                        <p className="text-xl text-neutral-400">Total Items</p>
                    </CardContent>
                </Card>
                <Card className="dark:bg-neutral-800 bg-neutral-100">
                    <CardContent className="p-4 flex items-center gap-2 justify-center flex-col">
                        <div className="text-2xl font-bold">
                            {inventory.filter(item => item.quantity === 0).length}
                        </div>
                        <p className="text-xl text-neutral-400">Out of Stock</p>
                    </CardContent>
                </Card>
                <Card className="dark:bg-neutral-800 bg-neutral-100">
                    <CardContent className="p-4 flex items-center gap-2 justify-center flex-col">
                        <div className="text-2xl font-bold">
                            {inventory.filter(item => item.quantity <= 10 && item.quantity > 0).length}
                        </div>
                        <p className="text-xl text-neutral-400">Low Stock</p>
                    </CardContent>
                </Card>
                <Card className="dark:bg-neutral-800 bg-neutral-100">
                    <CardContent className="p-4 flex items-center gap-2 justify-center flex-col">
                        <div className="text-2xl font-bold">
                            ₹{inventory.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toFixed(2)}
                        </div>
                        <p className="text-xl text-neutral-400">Total Value</p>
                    </CardContent>
                </Card>
            </div>

            {/* Inventory Table */}
            {filteredInventory.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-neutral-400 mb-4">
                            {searchTerm ? "No items match your search." : "No inventory items yet."}
                        </p>
                        {!searchTerm && (
                            <Button
                            // onClick={() => setDialogOpen(true)}
                            >
                                Add Your First Item
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredInventory.map((item) => {
                        const stockStatus = getStockStatus(item);
                        return (
                            <Card key={item.id} className="hover:shadow-lg transition-shadow bg-neutral-100 dark:bg-neutral-800">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold">{item.name}</h3>
                                                <Badge variant={item.quantity > 10 ? "default" : "destructive"}>
                                                    {stockStatus.status}
                                                </Badge>
                                                {item.quantity <= 10 && item.quantity > 0 && (
                                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-neutral-400">
                                                <div>
                                                    <span className="font-medium">SKU:</span> {item.sku}
                                                </div>
                                                {item.brand && (
                                                    <div>
                                                        <span className="font-medium">Brand:</span> {item.brand}
                                                    </div>
                                                )}
                                                {item.category && (
                                                    <div>
                                                        <span className="font-medium">Category:</span> {item.category}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold"> ₹ {item.unitPrice.toFixed(2)}</div>
                                            <div className="text-sm text-neutral-400">per unit</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-4">
                                            <div>
                                                <span className="font-medium">Quantity:</span> {item.quantity}
                                            </div>
                                            <div>
                                                <span className="font-medium">Min Level:</span> {10}
                                            </div>
                                            <div>
                                                <span className="font-medium">Total Value:</span> ₹{(item.unitPrice * item.quantity).toFixed(2)}
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">

                                            <AddQuantityInventoryItem inventoryId={item.id} serviceCenterId={item.serviceCenterId} name={item.name} sku={item.sku} brand={item.brand!} />
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled
                                            // onClick={() => {
                                            //     setEditingItem(item);
                                            //     setDialogOpen(true);
                                            // }}
                                            >
                                                <Edit className="mr-1 h-3 w-3" />
                                                Edit
                                            </Button>
                                            {/* <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => deleteItem(item.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="mr-1 h-3 w-3" />
                                                Delete
                                            </Button> */}
                                            <DeleteInventoryItem serviceCenterId={session?.user.id!} inventoryItemId={item.id} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
