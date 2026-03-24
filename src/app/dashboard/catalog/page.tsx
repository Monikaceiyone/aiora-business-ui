'use client';

import { useEffect, useState } from 'react';
import {
    Package,
    Plus,
    Trash2,
    Save,
    Upload,
    Download,
    RefreshCw,
    Loader2,
    Check,
    X,
    ExternalLink,
    CloudUpload,
    ScanLine,
    ImagePlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';
import { dashboardFetch } from '@/lib/dashboard-fetch';
import { InvoiceScanner } from '@/components/catalog/invoice-scanner';
import { useToast } from '@/components/ui/toast';

interface CatalogItem {
    id?: string;
    sku: string;
    title: string;
    description: string;
    availability: string;
    condition: string;
    price: number;
    currency: string;
    link: string;
    image_link: string;
    quantity: number;
    category_id?: string;
    meta_product_id?: string;
    last_synced_at?: string;
    isNew?: boolean;
    isEdited?: boolean;
}

const EMPTY_ITEM: CatalogItem = {
    sku: '',
    title: '',
    description: '',
    availability: 'in stock',
    condition: 'new',
    price: 0,
    currency: 'INR',
    link: '',
    image_link: '',
    quantity: 0,
    isNew: true
};

export default function CatalogPage() {
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [sellerId, setSellerId] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [showInvoiceScanner, setShowInvoiceScanner] = useState(false);
    const [uploadingImage, setUploadingImage] = useState<number | null>(null);
    const toast = useToast();

    useEffect(() => {
        const storedSellerId = localStorage.getItem('seller_id');
        if (storedSellerId) {
            setSellerId(storedSellerId);
            loadCatalog(storedSellerId);
        }
    }, []);

    const loadCatalog = async (sellerId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('catalog')
                .select('*')
                .eq('seller_id', sellerId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error loading catalog:', error);
        } finally {
            setLoading(false);
        }
    };

    const addRow = () => {
        setItems([...items, { ...EMPTY_ITEM, sku: `SKU${String(items.length + 1).padStart(3, '0')}` }]);
        setHasChanges(true);
    };

    const deleteRow = (index: number) => {
        const item = items[index];
        if (item.id) {
            // Mark for deletion from DB
            supabase.from('catalog').delete().eq('id', item.id).then(() => {
                setItems(items.filter((_, i) => i !== index));
            });
        } else {
            setItems(items.filter((_, i) => i !== index));
        }
        setHasChanges(true);
    };

    const updateItem = (index: number, field: keyof CatalogItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
            isEdited: true
        };
        setItems(newItems);
        setHasChanges(true);
    };

    const saveAll = async () => {
        if (!sellerId) return;
        setSaving(true);

        try {
            for (const item of items) {
                if (item.isNew || item.isEdited) {
                    const catalogData = {
                        seller_id: sellerId,
                        sku: item.sku,
                        title: item.title,
                        description: item.description,
                        availability: item.availability,
                        condition: item.condition,
                        price: Number(item.price),
                        currency: item.currency,
                        link: item.link,
                        image_link: item.image_link,
                        quantity: Number(item.quantity),
                        category_id: item.category_id
                    };

                    if (item.id) {
                        await supabase.from('catalog').update(catalogData).eq('id', item.id);
                    } else {
                        await supabase.from('catalog').insert(catalogData);
                    }
                }
            }

            await loadCatalog(sellerId);
            setHasChanges(false);
            toast.success('Catalog Saved', 'All changes have been saved successfully.');
        } catch (error) {
            console.error('Error saving:', error);
            toast.error('Save Failed', 'Failed to save catalog changes.');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (index: number, file: File) => {
        if (!sellerId) return;
        const item = items[index];

        setUploadingImage(index);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('seller_id', sellerId);
            formData.append('sku', item.sku || 'product');

            const response = await dashboardFetch('/api/catalog/upload-image', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                updateItem(index, 'image_link', result.url);
                toast.success('Image Uploaded', 'Image uploaded successfully!');
            } else {
                toast.error('Upload Failed', result.error || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error('Upload Failed', 'Failed to upload image');
        } finally {
            setUploadingImage(null);
        }
    };

    const syncToWhatsApp = async () => {
        if (!sellerId) return;
        setSyncing(true);

        try {
            // Save any unsaved edits first so spreadsheet and Meta get latest prices/details
            if (hasChanges) {
                for (const item of items) {
                    if (item.isNew || item.isEdited) {
                        const catalogData = {
                            seller_id: sellerId,
                            sku: item.sku,
                            title: item.title,
                            description: item.description,
                            availability: item.availability,
                            condition: item.condition,
                            price: Number(item.price),
                            currency: item.currency,
                            link: item.link,
                            image_link: item.image_link,
                            quantity: Number(item.quantity),
                            category_id: item.category_id
                        };
                        if (item.id) {
                            await supabase.from('catalog').update(catalogData).eq('id', item.id);
                        } else {
                            await supabase.from('catalog').insert(catalogData);
                        }
                    }
                }
                setHasChanges(false);
            }

            const response = await dashboardFetch('/api/catalog/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seller_id: sellerId })
            });

            const result = await response.json();
            if (result.success) {
                const created = result.created || 0;
                const updated = result.updated || 0;
                const total = created + updated;

                if (result.errors && result.errors.length > 0) {
                    const errLines = result.errors.map((e: { sku?: string; error?: string }) => `${e.sku || '?'}: ${e.error || ''}`).join('\n');
                    alert(`Synced ${total} products (${created} new, ${updated} updated).\n\nFailed Items:\n${errLines}`);
                } else {
                    alert(`Synced ${total} products to WhatsApp Catalog!\n(${created} new, ${updated} updated)`);
                }
                await loadCatalog(sellerId);
            } else {
                alert('Error syncing: ' + result.error);
            }
        } catch (error) {
            console.error('Error syncing:', error);
            alert('Error syncing to WhatsApp');
        } finally {
            setSyncing(false);
        }
    };

    const exportCSV = () => {
        const headers = ['sku', 'category_id', 'title', 'description', 'availability', 'condition', 'price', 'currency', 'link', 'image_link', 'quantity'];
        const csvContent = [
            headers.join(','),
            ...items.map(item =>
                headers.map(h => `"${(item as any)[h] || ''}"`).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'catalog.csv';
        a.click();
    };

    const importCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !sellerId) return;

        // Confirm replacement
        const confirmed = window.confirm(
            '⚠️ This will REPLACE your entire catalog!\n\n' +
            'All existing products will be deleted from:\n' +
            '• Database\n' +
            '• WhatsApp Catalog\n\n' +
            'Continue?'
        );

        if (!confirmed) {
            event.target.value = '';
            return;
        }

        setLoading(true);

        try {
            // Step 1: Delete all existing products
            const deleteResponse = await dashboardFetch('/api/catalog/delete-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seller_id: sellerId })
            });

            const deleteResult = await deleteResponse.json();
            if (!deleteResult.success) {
                alert('Failed to clear catalog: ' + deleteResult.error);
                setLoading(false);
                event.target.value = '';
                return;
            }

            console.log(`Deleted ${deleteResult.whatsappDeleted} from WhatsApp`);

        } catch (err) {
            console.error('Delete error:', err);
        }

        // Step 2: Parse CSV and add new items
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            if (!text) {
                setLoading(false);
                return;
            }

            const lines = text.split('\n').filter(l => l.trim());
            const headers = lines[0].split(',').map(h =>
                h.trim().toLowerCase().replace(/"/g, '').replace(/ /g, '_')
            );

            console.log('Detected Headers:', headers);

            const newItems: CatalogItem[] = [];

            for (let i = 0; i < lines.length; i++) {
                const currentLine = lines[i].trim();
                if (!currentLine) continue;

                const rawValues = currentLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                const values = rawValues.map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

                // Skip header row
                if (i === 0 && (values[0].toLowerCase().includes('sku') || values[1]?.toLowerCase().includes('title'))) {
                    continue;
                }

                const item: any = { isNew: true, availability: 'in stock', condition: 'new', quantity: 0, price: 0 };

                // Check for "Price INR" format
                const priceCurrencyMatch = values[3]?.match(/(\d+)\s*([a-zA-Z]{3})/);

                if (priceCurrencyMatch || (values.length === 6 && !isNaN(parseFloat(values[3])))) {
                    // Custom format: [0]ID, [1]Title, [2]Desc, [3]Price, [4]Link, [5]Images
                    item.sku = values[0] || `SKU-${String(i).padStart(3, '0')}`;
                    item.title = values[1];
                    item.description = values[2];

                    if (priceCurrencyMatch) {
                        item.price = Number(priceCurrencyMatch[1]);
                        item.currency = priceCurrencyMatch[2];
                    } else {
                        item.price = Number(values[3].replace(/[^0-9.]/g, ''));
                        item.currency = 'INR';
                    }

                    item.link = values[4];
                    item.image_link = values[5];
                    item.quantity = 10;
                } else {
                    // Standard header-based mapping
                    const hasHeaders = headers.includes('sku') || headers.includes('title');

                    if (hasHeaders && i > 0) {
                        headers.forEach((h, idx) => {
                            const value = values[idx] || '';
                            if (h === 'sku') item.sku = value;
                            else if (h === 'title' || h === 'name' || h === 'product_name') item.title = value;
                            else if (h === 'description' || h === 'body_html') item.description = value;
                            else if (h === 'price' || h === 'variant_price') item.price = Number(value) || 0;
                            else if (h === 'quantity' || h === 'qty' || h === 'variant_inventory_qty') item.quantity = Number(value) || 0;
                            else if (h === 'image_link' || h === 'image_src' || h === 'images') item.image_link = value;
                            else if (h === 'link' || h === 'handle') item.link = value;
                            else if (h === 'currency') item.currency = value;
                            else if (h === 'category' || h === 'category_id') item.category_id = value;
                        });
                    } else if (values.length >= 7) {
                        // Fallback format
                        item.sku = values[1];
                        item.title = values[2];
                        item.description = values[3];
                        item.price = Number(values[4]);
                        item.currency = values[5];
                        item.link = values[6];
                        item.image_link = values[7];
                    }
                }

                // Ensure SKU exists
                if (item.title && !item.sku) {
                    item.sku = `SKU-${String(i).padStart(3, '0')}`;
                }

                if (item.title) {
                    newItems.push(item as CatalogItem);
                }
            }

            // REPLACE items instead of appending
            setItems(newItems);
            setHasChanges(true);
            setLoading(false);

            alert(`Imported ${newItems.length} products. Click "Save All" then "Sync to WhatsApp" to complete!`);

            event.target.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Catalog / Inventory</h1>
                    <p className="text-gray-500">Manage your products and sync to WhatsApp Catalog</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" onClick={exportCSV} className="gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </Button>
                    <label className="cursor-pointer">
                        <div className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                            <Upload className="w-4 h-4" /> Import CSV
                        </div>
                        <input type="file" accept=".csv" onChange={importCSV} className="hidden" />
                    </label>
                    <Button
                        variant="outline"
                        onClick={() => setShowInvoiceScanner(true)}
                        className="gap-2 border-purple-200 text-purple-600 hover:bg-purple-50"
                    >
                        <ScanLine className="w-4 h-4" /> Scan Invoice
                    </Button>
                    <Button
                        onClick={syncToWhatsApp}
                        disabled={syncing || hasChanges}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                        {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                        Sync to WhatsApp
                    </Button>
                </div>
            </div>

            {/* Info Banner */}
            {hasChanges && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
                    <p className="text-yellow-800 text-sm">
                        You have unsaved changes. Save before syncing to WhatsApp.
                    </p>
                    <Button onClick={saveAll} disabled={saving} className="gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save All
                    </Button>
                </div>
            )}

            {/* Catalog Table */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Products ({items.length})
                        </CardTitle>
                        <Button size="sm" onClick={addRow} className="gap-1">
                            <Plus className="w-4 h-4" /> Add Row
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium">No products yet</p>
                            <p className="text-sm mt-1">Add products or import a CSV file</p>
                            <Button onClick={addRow} className="mt-4 gap-2">
                                <Plus className="w-4 h-4" /> Add First Product
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="text-left py-2 px-2 font-medium text-gray-600 w-24">SKU</th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600 w-32">Category</th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">Title</th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">Image</th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">Description</th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600 w-24">Price</th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600 w-20">Qty</th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600 w-24">Status</th>
                                            <th className="text-center py-2 px-2 font-medium text-gray-600 w-16">Sync</th>
                                            <th className="text-center py-2 px-2 font-medium text-gray-600 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => (
                                            <tr key={item.id || index} className={`border-b border-gray-100 ${item.isNew ? 'bg-green-50' : item.isEdited ? 'bg-yellow-50' : ''}`}>
                                                <td className="py-2 px-2">
                                                    <Input
                                                        value={item.sku}
                                                        onChange={(e) => updateItem(index, 'sku', e.target.value)}
                                                        className="h-8 text-xs font-mono"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <Input
                                                        value={item.category_id || ''}
                                                        onChange={(e) => updateItem(index, 'category_id', e.target.value)}
                                                        placeholder="Category"
                                                        className="h-8 text-xs"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <Input
                                                        value={item.title}
                                                        onChange={(e) => updateItem(index, 'title', e.target.value)}
                                                        className="h-8 text-xs"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <div className="flex items-center gap-1">
                                                        {item.image_link && (
                                                            <img
                                                                src={item.image_link}
                                                                alt=""
                                                                className="w-8 h-8 rounded object-cover flex-shrink-0"
                                                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                                            />
                                                        )}
                                                        <Input
                                                            value={item.image_link}
                                                            onChange={(e) => updateItem(index, 'image_link', e.target.value)}
                                                            placeholder="URL"
                                                            className="h-8 text-xs flex-1 w-20"
                                                        />
                                                        <label className="cursor-pointer flex-shrink-0">
                                                            <div className="h-8 w-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50">
                                                                {uploadingImage === index ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                                                ) : (
                                                                    <ImagePlus className="w-4 h-4 text-gray-500" />
                                                                )}
                                                            </div>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) handleImageUpload(index, file);
                                                                    e.target.value = '';
                                                                }}
                                                                className="hidden"
                                                                disabled={uploadingImage !== null}
                                                            />
                                                        </label>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-2">
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        className="h-8 text-xs"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <Input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                                                        className="h-8 text-xs"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                        className="h-8 text-xs"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <select
                                                        value={item.availability}
                                                        onChange={(e) => updateItem(index, 'availability', e.target.value)}
                                                        className="h-8 text-xs border rounded px-2 w-full"
                                                    >
                                                        <option value="in stock">In Stock</option>
                                                        <option value="out of stock">Out</option>
                                                    </select>
                                                </td>
                                                <td className="py-2 px-2 text-center">
                                                    {item.meta_product_id ? (
                                                        <Check className="w-4 h-4 inline text-green-600" />
                                                    ) : (
                                                        <X className="w-4 h-4 inline text-gray-400" />
                                                    )}
                                                </td>
                                                <td className="py-2 px-2 text-center">
                                                    <button onClick={() => deleteRow(index)} className="text-red-500 hover:text-red-700">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4">
                                {items.map((item, index) => (
                                    <div
                                        key={item.id || index}
                                        className={`border rounded-lg p-4 space-y-3 ${item.isNew ? 'bg-green-50 border-green-200' : item.isEdited ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}
                                    >
                                        {/* Header Row */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {item.image_link ? (
                                                    <img
                                                        src={item.image_link}
                                                        alt=""
                                                        className="w-12 h-12 rounded object-cover"
                                                        onError={(e) => (e.currentTarget.src = '/images/defaults/product-placeholder.png')}
                                                    />
                                                ) : (
                                                    <img
                                                        src="/images/defaults/product-placeholder.png"
                                                        alt="Placeholder"
                                                        className="w-12 h-12 rounded object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium text-sm">{item.title || 'New Product'}</p>
                                                    <p className="text-xs text-gray-500">{item.sku}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {item.meta_product_id ? (
                                                    <span className="text-green-600"><Check className="w-4 h-4" /></span>
                                                ) : (
                                                    <span className="text-gray-400"><X className="w-4 h-4" /></span>
                                                )}
                                                <button onClick={() => deleteRow(index)} className="text-red-500 p-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Form Fields */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs text-gray-500">SKU</label>
                                                <Input
                                                    value={item.sku}
                                                    onChange={(e) => updateItem(index, 'sku', e.target.value)}
                                                    className="h-9 text-sm font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Category</label>
                                                <Input
                                                    value={item.category_id || ''}
                                                    onChange={(e) => updateItem(index, 'category_id', e.target.value)}
                                                    className="h-9 text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500">Title</label>
                                            <Input
                                                value={item.title}
                                                onChange={(e) => updateItem(index, 'title', e.target.value)}
                                                className="h-9 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500">Description</label>
                                            <Input
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                className="h-9 text-sm"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500">Image URL</label>
                                                <div className="flex gap-1">
                                                    <Input
                                                        value={item.image_link}
                                                        onChange={(e) => updateItem(index, 'image_link', e.target.value)}
                                                        placeholder="https://..."
                                                        className="h-9 text-sm flex-1"
                                                    />
                                                    <label className="cursor-pointer">
                                                        <div className="h-9 w-9 flex items-center justify-center rounded border border-gray-200 bg-white">
                                                            {uploadingImage === index ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <ImagePlus className="w-4 h-4 text-gray-500" />
                                                            )}
                                                        </div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleImageUpload(index, file);
                                                                e.target.value = '';
                                                            }}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-xs text-gray-500">Price (₹)</label>
                                                <Input
                                                    type="number"
                                                    value={item.price}
                                                    onChange={(e) => updateItem(index, 'price', e.target.value)}
                                                    className="h-9 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Quantity</label>
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                    className="h-9 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Status</label>
                                                <select
                                                    value={item.availability}
                                                    onChange={(e) => updateItem(index, 'availability', e.target.value)}
                                                    className="h-9 text-sm border rounded px-2 w-full"
                                                >
                                                    <option value="in stock">In Stock</option>
                                                    <option value="out of stock">Out</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Save Button (sticky bottom) */}
            {hasChanges && (
                <div className="fixed bottom-6 right-6">
                    <Button
                        size="lg"
                        onClick={saveAll}
                        disabled={saving}
                        className="gap-2 shadow-lg"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </Button>
                </div>
            )}

            {/* Invoice Scanner Modal */}
            <InvoiceScanner
                isOpen={showInvoiceScanner}
                onClose={() => setShowInvoiceScanner(false)}
                onImport={(products) => {
                    const newItems = products.map((p, idx) => ({
                        sku: p.sku || `INV-${String(items.length + idx + 1).padStart(3, '0')}`,
                        title: p.title,
                        description: p.description,
                        availability: 'in stock',
                        condition: 'new',
                        price: p.price,
                        currency: 'INR',
                        link: '',
                        image_link: '',
                        quantity: p.quantity,
                        category_id: p.category_id,
                        isNew: true
                    }));
                    setItems([...items, ...newItems]);
                    setHasChanges(true);
                }}
            />
        </div>
    );
}
