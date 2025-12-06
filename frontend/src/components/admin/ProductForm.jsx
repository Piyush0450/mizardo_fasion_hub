import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Save, X, Image as ImageIcon, Loader } from 'lucide-react';
import axios from 'axios';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


// Helper to group flat variants by color_code
const groupVariants = (flatVariants) => {
    if (!flatVariants || flatVariants.length === 0) return [{ color: 'Black', color_code: '#000000', sizes: [{ size: 'M', stock: 10 }] }];

    const groups = {};
    flatVariants.forEach(v => {
        const key = v.color_code;
        if (!groups[key]) {
            groups[key] = {
                color: v.color,
                color_code: v.color_code,
                sizes: []
            };
        }
        groups[key].sizes.push({ size: v.size, stock: v.stock });
    });
    return Object.values(groups);
};

export default function ProductForm({ product, onSuccess, onCancel }) {
    const [uploading, setUploading] = useState(false);

    // Initialize form with grouped variants
    const defaultValues = product ? {
        ...product,
        variants: groupVariants(product.variants)
    } : {
        name: '',
        description: '',
        price: '',
        mrp: '',
        category: 'hoodies',
        images: [''],
        tags: '',
        variants: [{ color: 'Black', color_code: '#000000', sizes: [{ size: 'M', stock: 10 }] }]
    };

    const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues
    });

    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
        control,
        name: "variants"
    });

    const images = watch('images');
    const variants = watch('variants');

    const onSubmit = async (data) => {
        try {
            // Flatten variants back to original structure
            const flatVariants = [];
            data.variants.forEach(group => {
                group.sizes.forEach(s => {
                    flatVariants.push({
                        color: group.color,
                        color_code: group.color_code,
                        size: s.size,
                        stock: parseInt(s.stock)
                    });
                });
            });

            const payload = {
                ...data,
                price: parseFloat(data.price),
                mrp: data.mrp ? parseFloat(data.mrp) : 0,
                tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()) : data.tags,
                variants: flatVariants
            };

            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

            if (product?._id || product?.id) {
                await axios.put(`${API_URL}/products/${product._id || product.id}`, payload, config);
            } else {
                await axios.post(`${API_URL}/products`, payload, config);
            }
            onSuccess();
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product");
        }
    };

    // Fast image resizer using Canvas
    const resizeImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        const newFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    }, 'image/jpeg', 0.7);
                };
            };
        });
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const newImageUrls = await Promise.all(files.map(async (file) => {
                // Resize image locally before upload
                const processedFile = await resizeImage(file);

                const storageRef = ref(storage, `product_images/${Date.now()}_${processedFile.name}`);
                await uploadBytes(storageRef, processedFile);
                return await getDownloadURL(storageRef);
            }));

            const currentImages = images.filter(img => img !== '');
            setValue('images', [...currentImages, ...newImageUrls]);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload images");
        } finally {
            setUploading(false);
        }
    };

    const removeUploadedImage = (index) => {
        const currentImages = images.filter((_, i) => i !== index);
        setValue('images', currentImages);
    };

    return (
        <div className="bg-brand-dark p-8 rounded-3xl border border-gray-800 shadow-2xl max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold font-display">{product ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={onCancel} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Product Name</label>
                        <input
                            {...register("name", { required: "Name is required" })}
                            className="input-field w-full"
                            placeholder="e.g. Oversized Acid Wash Hoodie"
                        />
                        {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Category</label>
                        <input
                            {...register("category", { required: "Category is required" })}
                            className="input-field w-full"
                            placeholder="e.g. Hoodies"
                            list="category-suggestions"
                        />
                        <datalist id="category-suggestions">
                            <option value="Hoodies" />
                            <option value="T-Shirts" />
                            <option value="Pants" />
                            <option value="Accessories" />
                            <option value="Jackets" />
                        </datalist>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Price (₹)</label>
                        <input
                            type="number"
                            {...register("price", { required: "Price is required", min: 0 })}
                            className="input-field w-full"
                            placeholder="1999"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">MRP (₹)</label>
                        <input
                            type="number"
                            {...register("mrp")}
                            className="input-field w-full"
                            placeholder="2999"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Description</label>
                    <textarea
                        {...register("description")}
                        className="input-field w-full h-32 resize-none"
                        placeholder="Product details..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tags (comma separated)</label>
                    <input
                        {...register("tags")}
                        className="input-field w-full"
                        placeholder="NEW, TRENDING, WINTER"
                    />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon size={16} /> Product Images
                    </label>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((url, index) => (
                            url && (
                                <div key={index} className="relative aspect-square group rounded-xl overflow-hidden border border-gray-700">
                                    <img src={url} alt={`Product ${index}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeUploadedImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )
                        ))}

                        <label className="aspect-square border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-green hover:text-brand-green transition-colors text-gray-500">
                            {uploading ? (
                                <Loader className="animate-spin" />
                            ) : (
                                <>
                                    <Plus size={32} className="mb-2" />
                                    <span className="text-xs font-bold">Add Images</span>
                                </>
                            )}
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                        </label>
                    </div>
                </div>

                {/* Variants Manager (Grouped by Color) */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Variants (Color Groups)</label>
                        <button
                            type="button"
                            onClick={() => appendVariant({ color: 'Black', color_code: '#000000', sizes: [{ size: 'M', stock: 10 }] })}
                            className="text-xs bg-brand-green text-black px-3 py-1 rounded-full font-bold hover:bg-brand-neon transition"
                        >
                            + Add Color Group
                        </button>
                    </div>

                    <div className="space-y-4">
                        {variantFields.map((field, index) => (
                            <VariantGroup
                                key={field.id}
                                index={index}
                                control={control}
                                register={register}
                                remove={removeVariant}
                                setValue={setValue}
                                watch={watch}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
                    <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 rounded-xl font-bold bg-brand-green text-black hover:bg-brand-neon hover:shadow-glow transition flex items-center gap-2"
                    >
                        {isSubmitting ? 'Saving...' : <><Save size={20} /> Save Product</>}
                    </button>
                </div>
            </form>
        </div>
    );
}

// Sub-component for managing a single color group and its sizes
function VariantGroup({ index, control, register, remove, setValue, watch }) {
    const { fields, append, remove: removeSize } = useFieldArray({
        control,
        name: `variants.${index}.sizes`
    });

    const colorCode = watch(`variants.${index}.color_code`);

    return (
        <div className="bg-black/30 p-4 rounded-xl border border-gray-800 space-y-4">
            <div className="flex justify-between items-start">
                <div className="flex gap-4 items-end">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Color Name</label>
                        <input
                            {...register(`variants.${index}.color`)}
                            className="input-field w-32 text-sm py-1"
                            placeholder="Black"
                            onChange={(e) => {
                                register(`variants.${index}.color`).onChange(e);
                                const colorName = e.target.value.toLowerCase();
                                const ctx = document.createElement('canvas').getContext('2d');
                                ctx.fillStyle = colorName;
                                const hex = ctx.fillStyle;
                                if (hex !== '#000000' || colorName === 'black') {
                                    setValue(`variants.${index}.color_code`, hex);
                                }
                            }}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Hex Code</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                {...register(`variants.${index}.color_code`)}
                                value={colorCode || '#000000'}
                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                            />
                            <input
                                {...register(`variants.${index}.color_code`)}
                                value={colorCode || ''}
                                className="input-field w-24 text-sm py-1"
                                placeholder="#000000"
                            />
                        </div>
                    </div>
                </div>
                <button type="button" onClick={() => remove(index)} className="text-gray-500 hover:text-red-500">
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Sizes List */}
            <div className="pl-4 border-l-2 border-gray-800 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Sizes & Stock</label>
                {fields.map((sizeField, sizeIndex) => (
                    <div key={sizeField.id} className="flex gap-3 items-center">
                        <select {...register(`variants.${index}.sizes.${sizeIndex}.size`)} className="input-field w-24 text-sm py-1">
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                        </select>
                        <input
                            type="number"
                            {...register(`variants.${index}.sizes.${sizeIndex}.stock`)}
                            className="input-field w-24 text-sm py-1"
                            placeholder="Stock"
                        />
                        <button type="button" onClick={() => removeSize(sizeIndex)} className="text-gray-500 hover:text-red-500">
                            <X size={14} />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => append({ size: 'M', stock: 10 })}
                    className="text-xs text-brand-green hover:text-brand-neon font-bold flex items-center gap-1 mt-2"
                >
                    <Plus size={14} /> Add Size
                </button>
            </div>
        </div>
    );
}
