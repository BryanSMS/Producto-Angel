import { useEffect, useRef } from 'react';
import './AmbientScene.css';

export function AmbientScene({ focused }) {
  const hostRef = useRef(null);
  const sceneRef = useRef(null);
  const focusRef = useRef(focused);

  useEffect(() => {
    focusRef.current = focused;
    sceneRef.current?.setFocus(focused);
  }, [focused]);

  useEffect(() => {
    const host = hostRef.current;
    const desktop = window.matchMedia('(min-width: 1100px)');
    const eligible = window.matchMedia('(min-width: 768px)');
    let generation = 0;
    let disposed = false;

    const mount = async () => {
      const version = ++generation;
      sceneRef.current?.dispose();
      sceneRef.current = null;
      host.dataset.ready = 'false';
      if (!eligible.matches) return;
      try {
        // Mobile never initializes the renderer. The HTML interface stays usable
        // while this optional background loads or if WebGL is unavailable.
        const { createAmbientScene } = await import('../utils/ambientScene');
        if (disposed || version !== generation) return;
        sceneRef.current = createAmbientScene(host, {
          compact: !desktop.matches, focused: focusRef.current,
        });
      } catch {
        host.dataset.ready = 'false';
      }
    };
    mount();
    eligible.addEventListener('change', mount);
    desktop.addEventListener('change', mount);
    return () => {
      disposed = true;
      generation++;
      eligible.removeEventListener('change', mount);
      desktop.removeEventListener('change', mount);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  return <div ref={hostRef} className="ambient-scene" aria-hidden="true" />;
}
