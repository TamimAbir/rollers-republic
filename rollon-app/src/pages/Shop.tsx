import { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronDown, SearchX } from 'lucide-react';


import { useProducts, useCategories } from '@/hooks/useApi';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import { filterProducts, getNextVisibleCount, getVisibleProducts, INITIAL_VISIBLE_PRODUCTS, resolveCategoryIdFromSlug, sortProducts } from '@/lib/shop';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductSkeleton } from '@/components/ui/ProductSkeleton';
import { ShopProductCard } from '@/components/shop/shop-product-card';


export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(selectedSearch);
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_PRODUCTS);

  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery(selectedSearch);
  }, [selectedSearch]);

  const updateParams = (next: { category?: string; search?: string }) => {
    const params = new URLSearchParams(searchParams);

    if (next.category !== undefined) {
      if (next.category === 'all' || !next.category) {
        params.delete('category');
      } else {
        params.set('category', next.category);
      }
    }

    if (next.search !== undefined) {
      const trimmed = next.search.trim();
      if (!trimmed) {
        params.delete('search');
      } else {
        params.set('search', trimmed);
      }
    }

    setSearchParams(params);
  };

  const addItem = useCartStore((state) => state.addItem);

  const { data: products = [], isLoading: isProductsLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const selectedCategoryId = useMemo(() => resolveCategoryIdFromSlug(categories, selectedCategory), [categories, selectedCategory]);

  const filteredProducts = useMemo(() => {
    return filterProducts(products, selectedCategoryId, searchQuery);
  }, [products, selectedCategoryId, searchQuery]);

  const sortedProducts = useMemo(() => {
    return sortProducts(filteredProducts, sortBy);
  }, [filteredProducts, sortBy]);

  const visibleProducts = useMemo(() => getVisibleProducts(sortedProducts, visibleCount), [sortedProducts, visibleCount]);

  const sortOptions = [
    { label: 'Featured', value: 'featured' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
    { label: 'Best Rating', value: 'rating' },
  ];

  return (
    <main className="min-h-screen bg-[#050505] pt-24">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[180px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-primary/5 blur-[180px] opacity-20" />
      </div>

      <div className="relative z-10">
        {/* Curated Header */}
        <section className="relative py-20 lg:py-32 overflow-hidden px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <Badge variant="outline" className="rounded-full border-primary/20 text-primary tracking-[0.3em] font-black px-6 py-2 bg-primary/5 mb-8">
                COLLECTION 2024
              </Badge>
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-black text-white tracking-tighter leading-[0.9] mb-8">
                Elevate Your <span className="text-primary italic">Sessions.</span>
              </h1>
              <p className="text-white/60 text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
                Explore our ultra-premium selection of accessories, where industrial engineering meets artisan craft.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Intelligence Bar */}
        <section className="sticky top-20 z-40 bg-[#050505]/80 backdrop-blur-2xl border-y border-white/5 px-4 sm:px-6 lg:px-12 xl:px-20 py-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative group flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="Find your aesthetic..."
                  value={searchQuery}
                  onChange={(e) => {
                    const nextQuery = e.target.value;
                    setSearchQuery(nextQuery);
                    updateParams({ search: nextQuery });
                    setVisibleCount(INITIAL_VISIBLE_PRODUCTS);
                  }}
                  className="pl-11 pr-4 py-6 bg-white/[0.03] border-white/10 rounded-2xl focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all text-white placeholder:text-white/50"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                aria-label="Toggle filters"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className={cn("h-12 w-12 rounded-2xl lg:hidden transition-all", isFilterVisible && "bg-primary text-black border-primary")}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </div>

            {/* Desktop Categories */}
            <div className="hidden lg:flex items-center gap-2 p-1.5 bg-white/[0.03] border border-white/10 rounded-[1.25rem]">
              <Button
                variant="ghost"
                onClick={() => {
                  updateParams({ category: 'all' });
                  setVisibleCount(INITIAL_VISIBLE_PRODUCTS);
                }}
                className={cn(
                  "rounded-xl px-6 h-10 text-sm font-bold tracking-tight transition-all",
                  selectedCategory === 'all'
                    ? "bg-primary text-black hover:bg-primary shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                Discover All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant="ghost"
                  onClick={() => {
                    updateParams({ category: cat.slug });
                    setVisibleCount(INITIAL_VISIBLE_PRODUCTS);
                  }}
                  className={cn(
                    "rounded-xl px-6 h-10 text-sm font-bold tracking-tight transition-all",
                    selectedCategory === cat.slug
                      ? "bg-primary text-black hover:bg-primary shadow-lg"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
              <span className="text-white/50 text-sm font-medium tracking-wide tabular-nums">
                {sortedProducts.length} <span className="text-[10px] uppercase font-black ml-1">Items Found</span>
              </span>

              <div className="flex items-center gap-2">
                <div className="relative group min-w-[200px]">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setVisibleCount(INITIAL_VISIBLE_PRODUCTS);
                    }}
                    aria-label="Sort products"
                    className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm font-bold text-white/60 hover:text-white hover:border-primary/30 appearance-none focus:outline-none transition-all cursor-pointer"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-[#111] text-white py-2">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-hover:text-primary pointer-events-none transition-colors" />
                </div>

              </div>
            </div>
          </div>

          {/* Mobile Filter Sheet (Expansion) */}
          <AnimatePresence>
            {isFilterVisible && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="py-8 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateParams({ category: 'all' });
                      setVisibleCount(INITIAL_VISIBLE_PRODUCTS);
                      setIsFilterVisible(false);
                    }}
                    className={cn(
                      "rounded-2xl h-14 font-bold border-white/10",
                      selectedCategory === 'all' && "bg-primary text-black border-primary"
                    )}
                  >
                    All Items
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant="outline"
                      onClick={() => {
                        updateParams({ category: cat.slug });
                        setVisibleCount(INITIAL_VISIBLE_PRODUCTS);
                        setIsFilterVisible(false);
                      }}
                      className={cn(
                        "rounded-2xl h-14 font-bold border-white/10",
                        selectedCategory === cat.slug && "bg-primary text-black border-primary"
                      )}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Product Matrix */}
        <section ref={sectionRef} className="px-4 sm:px-6 lg:px-12 xl:px-20 py-24">
          {isProductsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                <AnimatePresence mode="popLayout">
                  {visibleProducts.map((product, index) => (
                    <ShopProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      onAddToCart={addItem}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Empty Intelligence */}
              {sortedProducts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-40 space-y-8"
                >
                  <div className="relative mb-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center mx-auto shadow-2xl border border-white/10">
                      <SearchX className="w-14 h-14 text-primary" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-display font-black text-white tracking-tighter">No Results Found</h3>
                    <p className="text-white/60 text-lg max-w-sm mx-auto">We couldn't find any artifacts matching your criteria. Try adjusting your search or explore our collection.</p>
                  </div>
                  <Link to="/shop">
                    <Button
                      className="rounded-full bg-gradient-to-r from-[#39FF14] to-green-400 hover:from-[#39FF14]/90 hover:to-green-400/90 text-black hover:text-black px-12 h-14 font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                    >
                      Browse All Products
                    </Button>
                  </Link>
                </motion.div>
              )}

              {visibleCount < sortedProducts.length && (
                <div className="mt-16 flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setVisibleCount((prev) => getNextVisibleCount(prev))}
                    className="rounded-full border-white/10 hover:bg-white/5 hover:text-white px-12 h-14 text-sm font-black tracking-widest text-white/60 shadow-2xl"
                  >
                    LOAD MORE ITEMS
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        <Footer />
      </div>
    </main>
  );
}
