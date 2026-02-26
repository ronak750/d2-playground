import { useState, useCallback, useEffect } from 'react';
import { D2 } from '@terrastruct/d2';

export const useD2 = () => {
  const [d2Instance, setD2Instance] = useState<D2 | null>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const instance = new D2();
        setD2Instance(instance);
      } catch (err) {
        console.error('Failed to initialize D2:', err);
        setError('Failed to initialize D2 renderer');
      }
    };
    init();
  }, []);

  const render = useCallback(async (code: string) => {
    if (!d2Instance) return;

    setIsCompiling(true);
    setError(null);

    try {
      const result = await d2Instance.compile(code, {
        options: {
          layout: 'dagre',
        },
      });
      const renderedSvg = await d2Instance.render(result.diagram, {
        ...result.renderOptions,
        noXMLTag: true,
      });
      setSvg(renderedSvg);
    } catch (err: any) {
      console.error('D2 compilation error:', err);
      setError(err.message || 'An error occurred during diagram generation');
    } finally {
      setIsCompiling(false);
    }
  }, [d2Instance]);

  return { render, svg, error, isCompiling };
};
