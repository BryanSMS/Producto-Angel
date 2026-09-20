import { useState, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { ResultCounter } from './components/ResultCounter';
import { ProductGrid } from './components/ProductGrid';
import { ProductModal } from './components/ProductModal';
import { AmbientScene } from './components/AmbientScene';
import { gsap, motionQuery } from './utils/animations';
import { productos, categorias } from './data/productos';
import { filterProducts, getGruposByCategoria } from './utils/search';
import './App.css';

export default function App() {
  const controlsRef = useRef(null);
  const gridAnimationRef = useRef(null);
  const focusOrigin = useRef(null);
  const [showSplash, setShowSplash] = useState(() => window.matchMedia(motionQuery).matches);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeGrupo, setActiveGrupo] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ambientFocused, setAmbientFocused] = useState(false);
  const grupos = useMemo(() => getGruposByCategoria(productos, activeCategory), [activeCategory]);
  const filteredProducts = filterProducts(productos, searchQuery, activeCategory, activeGrupo);
  const filterKey = JSON.stringify([searchQuery, activeCategory, activeGrupo]);
  const finishSplash = useCallback(() => setShowSplash(false), []);

  useLayoutEffect(() => {
    if (showSplash) return;
    const media = gsap.matchMedia();
    media.add(motionQuery, () => {
      gsap.fromTo(controlsRef.current.children, { y: -8, opacity: 0.7 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.04, ease: 'power2.out', clearProps: 'transform,opacity' });
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
  const handleProductClick = useCallback((product, button) => {
    const element = button.querySelector('.product-image-frame');
    focusOrigin.current = {
      element,
      rect: element.getBoundingClientRect().toJSON(),
      placeholder: Boolean(element.querySelector('.product-image-placeholder')),
    };
    setSelectedProduct(product);
    setAmbientFocused(true);
    setIsModalOpen(true);
  }, []);
  const handleModalClose = useCallback(() => {
    setAmbientFocused(false);
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);
  const handleFocusClosing = useCallback(() => setAmbientFocused(false), []);
  const handleResetFilters = useCallback(() => {
    gridAnimationRef.current?.capture();
    setSearchQuery('');
    setActiveCategory('Todos');
    setActiveGrupo('Todos');
  }, []);

  return (
    <div className={`app ${showSplash ? 'is-arriving' : ''}`}>
      <AmbientScene focused={ambientFocused} />
      <div className="environment" aria-hidden="true">
        <div className="environment-glow" />
        <div className="environment-floor" />
        <div className="environment-grain" />
      </div>
      {showSplash && <SplashScreen onFinish={finishSplash} />}
      <a className="skip-link" href="#workspace">Ir a productos</a>
      <Header><ResultCounter count={filteredProducts.length} /></Header>
      <div ref={controlsRef} className="control-deck">
        <SearchBar value={searchQuery} onChange={handleSearchChange} onClear={handleSearchClear} />
        <CategoryFilter
          categories={categorias} activeCategory={activeCategory} onChange={handleCategoryChange}
          grupos={grupos} activeGrupo={activeGrupo} onChangeGrupo={handleGrupoChange}
        />
      </div>
      <main className="workspace" id="workspace" tabIndex={-1}>
        <h1 className="sr-only">Espacio de consulta de productos</h1>
        <ProductGrid
          catalog={productos} products={filteredProducts} filterKey={filterKey}
          searchActive={Boolean(searchQuery.trim())} ready={!showSplash} focusOpen={isModalOpen}
          animationRef={gridAnimationRef} onProductClick={handleProductClick} onReset={handleResetFilters}
        />
      </main>
      <div className="space-caption" aria-hidden="true"><span>CONSULTA DE TIENDA</span><span>Todo, a mano.</span></div>
      <div className="space-guide" aria-hidden="true"><span /> Explora el espacio</div>
      <ProductModal product={selectedProduct} isOpen={isModalOpen} origin={focusOrigin.current} onCloseStart={handleFocusClosing} onClose={handleModalClose} />
    </div>
  );
}
