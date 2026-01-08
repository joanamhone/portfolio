import React, { useState } from 'react';
import { Plus, Edit, Trash2, Tag, Palette } from 'lucide-react';
import { supabase, Category } from '../lib/supabase';
import { useToast } from './Toast';
import { useForm } from 'react-hook-form';

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  color: string;
}

interface CategoriesManagerProps {
  categories: Category[];
  onRefresh: () => void;
}

const CategoriesManager: React.FC<CategoriesManagerProps> = ({ categories, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { showToast } = useToast();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CategoryForm>();

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const onSubmit = async (data: CategoryForm) => {
    if (!supabase) return;

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(data)
          .eq('id', editingCategory.id);
        if (error) throw error;
        showToast('success', 'Category updated');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(data);
        if (error) throw error;
        showToast('success', 'Category created');
      }

      reset();
      setShowForm(false);
      setEditingCategory(null);
      onRefresh();
    } catch (error) {
      console.error('Error saving category:', error);
      showToast('error', 'Failed to save category');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!supabase || !confirm('Are you sure? This will remove the category from all posts.')) return;

    try {
      await supabase.from('categories').delete().eq('id', id);
      showToast('success', 'Category deleted');
      onRefresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('error', 'Failed to delete category');
    }
  };

  const editCategory = (category: Category) => {
    setEditingCategory(category);
    setValue('name', category.name);
    setValue('slug', category.slug);
    setValue('description', category.description || '');
    setValue('color', category.color);
    setShowForm(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize your blog posts ({categories.length} categories)
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            reset();
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingCategory(null);
                reset();
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => {
                    setValue('slug', generateSlug(e.target.value));
                  }}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug
                </label>
                <input
                  {...register('slug', { required: 'Slug is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <label key={color} className="cursor-pointer">
                    <input
                      {...register('color', { required: 'Color is required' })}
                      type="radio"
                      value={color}
                      className="sr-only"
                    />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  </label>
                ))}
              </div>
              {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>}
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {editingCategory ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                  reset();
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Tag size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => editCategory(category)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  /{category.slug}
                </p>
                {category.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {category.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesManager;