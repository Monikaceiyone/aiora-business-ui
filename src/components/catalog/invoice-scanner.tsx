'use client';

import { useState, useRef } from 'react';
import {
    X,
    Upload,
    Loader2,
    FileImage,
    Check,
    AlertCircle,
    Trash2,
    Download,
    Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardFetch } from '@/lib/dashboard-fetch';

interface ExtractedProduct {
    sku: string;
    title: string;
    description: string;
    price: number;
    quantity: number;
    category_id?: string;
}

interface InvoiceScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (products: ExtractedProduct[]) => void;
}

export function InvoiceScanner({ isOpen, onClose, onImport }: InvoiceScannerProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [products, setProducts] = useState<ExtractedProduct[]>([]);
    const [step, setStep] = useState<'upload' | 'preview' | 'edit'>('upload');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setError(null);
            setStep('preview');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile && (droppedFile.type.startsWith('image/') || droppedFile.type === 'application/pdf')) {
            setFile(droppedFile);
            setPreview(URL.createObjectURL(droppedFile));
            setError(null);
            setStep('preview');
        }
    };

    const scanInvoice = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('invoice', file);

            const response = await dashboardFetch('/api/catalog/parse-invoice', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success && result.products?.length > 0) {
                setProducts(result.products);
                setStep('edit');
            } else if (result.success && result.products?.length === 0) {
                setError('No products found in the invoice. Please try a clearer image.');
            } else {
                setError(result.error || 'Failed to parse invoice');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateProduct = (index: number, field: keyof ExtractedProduct, value: string | number) => {
        const updated = [...products];
        updated[index] = { ...updated[index], [field]: value };
        setProducts(updated);
    };

    const deleteProduct = (index: number) => {
        setProducts(products.filter((_, i) => i !== index));
    };

    const handleImport = () => {
        if (products.length > 0) {
            onImport(products);
            resetState();
            onClose();
        }
    };

    const resetState = () => {
        setFile(null);
        setPreview(null);
        setProducts([]);
        setError(null);
        setStep('upload');
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Scan Invoice</h2>
                        <p className="text-sm text-gray-500">
                            {step === 'upload' && 'Upload an invoice image to extract products'}
                            {step === 'preview' && 'Review and scan your invoice'}
                            {step === 'edit' && `${products.length} products extracted - review and import`}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {step === 'upload' && (
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FileImage className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Drop invoice image here
                            </h3>
                            <p className="text-gray-500 mb-4">
                                or click to browse files
                            </p>
                            <p className="text-xs text-gray-400">
                                Supports: JPG, PNG, PDF
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    )}

                    {step === 'preview' && preview && (
                        <div className="space-y-4">
                            <div className="relative bg-gray-100 rounded-xl overflow-hidden max-h-96 flex items-center justify-center">
                                {file?.type === 'application/pdf' ? (
                                    <div className="p-8 text-center">
                                        <FileImage className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                                        <p className="text-gray-600">{file.name}</p>
                                    </div>
                                ) : (
                                    <img
                                        src={preview}
                                        alt="Invoice preview"
                                        className="max-h-96 object-contain"
                                    />
                                )}
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                                    <AlertCircle className="w-5 h-5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setStep('upload');
                                        setFile(null);
                                        setPreview(null);
                                    }}
                                    className="flex-1"
                                >
                                    Choose Different File
                                </Button>
                                <Button
                                    onClick={scanInvoice}
                                    disabled={loading}
                                    className="flex-1 gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Scanning...
                                        </>
                                    ) : (
                                        <>
                                            <FileImage className="w-4 h-4" />
                                            Scan Invoice
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'edit' && products.length > 0 && (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-600" />
                                <span className="text-green-800">
                                    Successfully extracted {products.length} products. Review and edit before importing.
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="text-left p-2 font-medium">SKU</th>
                                            <th className="text-left p-2 font-medium">Title</th>
                                            <th className="text-left p-2 font-medium">Description</th>
                                            <th className="text-left p-2 font-medium w-24">Price</th>
                                            <th className="text-left p-2 font-medium w-16">Qty</th>
                                            <th className="text-left p-2 font-medium">Category</th>
                                            <th className="text-center p-2 font-medium w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="p-2">
                                                    <Input
                                                        value={product.sku}
                                                        onChange={(e) => updateProduct(index, 'sku', e.target.value)}
                                                        className="h-8 text-xs font-mono"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        value={product.title}
                                                        onChange={(e) => updateProduct(index, 'title', e.target.value)}
                                                        className="h-8 text-xs"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        value={product.description}
                                                        onChange={(e) => updateProduct(index, 'description', e.target.value)}
                                                        className="h-8 text-xs"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        value={product.price}
                                                        onChange={(e) => updateProduct(index, 'price', Number(e.target.value))}
                                                        className="h-8 text-xs"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        value={product.quantity}
                                                        onChange={(e) => updateProduct(index, 'quantity', Number(e.target.value))}
                                                        className="h-8 text-xs"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        value={product.category_id || ''}
                                                        onChange={(e) => updateProduct(index, 'category_id', e.target.value)}
                                                        className="h-8 text-xs"
                                                        placeholder="Category"
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    <button
                                                        onClick={() => deleteProduct(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                                    <AlertCircle className="w-5 h-5" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 'edit' && products.length > 0 && (
                    <div className="border-t p-4 flex justify-between items-center bg-gray-50">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setStep('preview');
                                setProducts([]);
                            }}
                        >
                            Scan Again
                        </Button>
                        <Button
                            onClick={handleImport}
                            className="gap-2 bg-green-600 hover:bg-green-700"
                        >
                            <Check className="w-4 h-4" />
                            Import {products.length} Products
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
