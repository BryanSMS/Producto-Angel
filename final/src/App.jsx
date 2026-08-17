import { useState, useCallback, useMemo } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { HeroMessage } from './components/HeroMessage';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { ResultCounter } from './components/ResultCounter';
import { FeaturedRow } from './components/FeaturedRow';
import { ProductGrid } from './components/ProductGrid';
import { ProductModal } from './components/ProductModal';
import { EmptyState } from './components/EmptyState';
import { Footer } from './components/Footer';
import { productos, categorias } from './data/productos';
import { filterProducts, getGruposByCategoria } from './utils/search';
import './App.css';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeGrupo, setActiveGrupo] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const grupos = useMemo(
    () => getGruposByCategoria(productos, activeCategory),
    [activeCategory]
  );

  const filteredProducts = filterProducts(productos, searchQuery, activeCategory, activeGrupo);

  const showFeatured = !searchQuery && activeCategory === 'Todos';
  const featuredProducts = productos.filter((p) => p.destacado && p.disponible);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setActiveCategory(category);
    setActiveGrupo('Todos');
  }, []);

  const handleGrupoChange = useCallback((grupo) => {
    setActiveGrupo(grupo);
  }, []);

  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setActiveCategory('Todos');
    setActiveGrupo('Todos');
  }, []);

  return (
    <div className="app">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <Header />
      <HeroMessage />
      <SearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={handleSearchClear}
      />
      <CategoryFilter
        categories={categorias}
        activeCategory={activeCategory}
        onChange={handleCategoryChange}
        grupos={grupos}
        activeGrupo={activeGrupo}
        onChangeGrupo={handleGrupoChange}
      />
      {showFeatured && (
        <FeaturedRow products={featuredProducts} onProductClick={handleProductClick} />
      )}

      <ResultCounter count={filteredProducts.length} />

      {filteredProducts.length > 0 ? (
        <ProductGrid
          products={filteredProducts}
          onProductClick={handleProductClick}
        />
      ) : (
        <EmptyState onReset={handleResetFilters} />
      )}

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />

      <Footer />
    </div>
  );
}
