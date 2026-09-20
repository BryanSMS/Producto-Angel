import { useState, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { ResultCounter } from './components/ResultCounter';
import { ProductGrid } from './components/ProductGrid';
import { ProductModal } from './components/ProductModal';
import { gsap, motionQuery } from './utils/animations';
import { productos, categorias } from './data/productos';
import { filterProducts, getGruposByCategoria } from './utils/search';
import './App.css';

export default function App() {
  const workspaceRef = useRef(null);
  const gridAnimationRef = useRef(null);
  const [showSplash, setShowSplash] = useState(() => window.matchMedia(motionQuery).matches);
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
  const filterKey = JSON.stringify([searchQuery, activeCategory, activeGrupo]);
  const finishSplash = useCallback(() => setShowSplash(false), []);

  useLayoutEffect(() => {
    if (showSplash) return;
    const media = gsap.matchMedia();
    media.add(motionQuery, () => {
      gsap.fromTo(workspaceRef.current.querySelectorAll('.workspace-heading, .search-container, .category-filter'),
        { y: 8, opacity: 0.7 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.04, ease: 'power2.out', clearProps: 'transform,opacity' });
    });
    return () => media.revert();
  }, [showSplash]);

  const handleSearchChange = useCallback((query) => {
    gridAnimationRef.current?.capture();
    setSearchQuery(query);
  }, []);

  const handleSearchClear = useCallback(() => {
    gridAnimationRef.current?.capture();
    setSearchQuery('');
  }, []);

  const handleCategoryChange = useCallback((category) => {
    gridAnimationRef.current?.capture();
    setActiveCategory(category);
    setActiveGrupo('Todos');
  }, []);

  const handleGrupoChange = useCallback((grupo) => {
    gridAnimationRef.current?.capture();
    setActiveGrupo(grupo);
  }, []);

  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

  const handleResetFilters = useCallback(() => {
    gridAnimationRef.current?.capture();
    setSearchQuery('');
    setActiveCategory('Todos');
    setActiveGrupo('Todos');
  }, []);

  return (
    <div className="app">
      {showSplash && <SplashScreen onFinish={finishSplash} />}
      <a className="skip-link" href="#workspace">Ir a productos</a>
      <Header />
      <main ref={workspaceRef} className="workspace" id="workspace" tabIndex={-1}>
        <div className="workspace-heading">
          <p className="workspace-eyebrow">Consulta de tienda</p>
          <h1>Productos<span aria-hidden="true">.</span></h1>
        </div>
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
        <div className="workspace-results">
          <h2>{activeCategory === 'Todos' ? 'Todos los productos' : activeCategory}</h2>
          <ResultCounter count={filteredProducts.length} />
        </div>
        <ProductGrid
          catalog={productos}
          products={filteredProducts}
          filterKey={filterKey}
          searchActive={Boolean(searchQuery.trim())}
          ready={!showSplash}
          focusOpen={isModalOpen}
          animationRef={gridAnimationRef}
          onProductClick={handleProductClick}
          onReset={handleResetFilters}
        />
      </main>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}
