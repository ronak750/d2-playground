import { useState, useEffect } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { useD2 } from './hooks/useD2';
import { Share2, Download, Play, Github, Sparkles, Send, Loader2 } from 'lucide-react';
import { generateD2Script } from './services/gemini';

const INITIAL_CODE = `# Welcome to D2 Playground!
# Try editing this script to see the changes.

direction: right

User: {
  shape: person
}

Cloud: {
  API Server: {
    shape: circle
  }
  Database: {
    shape: cylinder
  }
}

User -> Cloud.API Server: Request
Cloud.API Server -> Cloud.Database: Query
Cloud.Database -> Cloud.API Server: Data
Cloud.API Server -> User: Response
`;

const EXAMPLES = {
  basic: INITIAL_CODE,
  sequence: `shape: sequence_diagram
alice -> bob: What does it mean\\nto be well-adjusted?
bob -> alice: The ability to play bridge or\\ngolf as if they were games.`,
  sql: `costumes: {
  shape: sql_table
  id: int {constraint: primary_key}
  silliness: int
  monster: int
  last_updated: timestamp
}
monsters: {
  shape: sql_table
  id: int {constraint: primary_key}
  movie: string
  weight: int
  last_updated: timestamp
}
costumes.monster -> monsters.id`,
  classes: `D2 Parser: {
  shape: class
  +reader: io.RuneReader
  readerPos: d2ast.Position
  -lookahead: "[]rune"
  "#peekn(n int)": (s string, eof bool)
  +peek(): (r rune, eof bool)
  rewind()
  commit()
}`
};

function App() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [prompt, setPrompt] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const { render, svg, error, isCompiling } = useD2();

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isAILoading) return;

    setIsAILoading(true);
    setAiError(null);
    try {
      const result = await generateD2Script(prompt, code === INITIAL_CODE ? undefined : code);
      setCode(result);
      render(result);
      setPrompt(''); // Clear prompt after successful generation
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate diagram');
      console.error(err);
    } finally {
      setIsAILoading(false);
    }
  };

  const loadExample = (key: keyof typeof EXAMPLES) => {
    const exampleCode = EXAMPLES[key];
    setCode(exampleCode);
    render(exampleCode);
  };

  // Initial render
  useEffect(() => {
    render(code);
  }, [render]);

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      render(value);
    }
  };

  const downloadSvg = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              D2 <span className="text-blue-600">Playground</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            {(Object.keys(EXAMPLES) as Array<keyof typeof EXAMPLES>).map((key) => (
              <button
                key={key}
                onClick={() => loadExample(key)}
                className="px-3 py-1 text-xs font-medium rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-600 capitalize"
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => render(code)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            Run
          </button>
          
          <button
            onClick={downloadSvg}
            disabled={!svg}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export SVG
          </button>

          <div className="w-px h-6 bg-gray-200 mx-2" />

          <a
            href="https://github.com/terrastruct/d2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Github className="w-6 h-6" />
          </a>
        </div>
      </header>

      {/* AI Prompt Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <form onSubmit={handleAIGenerate} className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="relative flex-1">
            <div className="absolute top-3 left-3 pointer-events-none">
              <Sparkles className="h-4 w-4 text-blue-500" />
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleAIGenerate(e);
                }
              }}
              placeholder="Describe your diagram in detail... (e.g., 'Add a cache between API and Database'. Press Cmd+Enter to generate)"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm min-h-[80px] resize-y"
              disabled={isAILoading}
            />
          </div>
          <button
            type="submit"
            disabled={isAILoading || !prompt.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center mb-1"
          >
            {isAILoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </form>
        {aiError && (
          <div className="max-w-4xl mx-auto mt-2 text-xs text-red-500 flex items-center gap-1">
            <span>Error: {aiError}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        <div className="w-1/2 flex flex-col">
          <div className="flex items-center px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Script Editor
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor value={code} onChange={handleCodeChange} />
          </div>
        </div>

        {/* Preview Pane */}
        <div className="w-1/2 flex flex-col border-l border-gray-200">
          <div className="flex items-center px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Diagram Preview
          </div>
          <div className="flex-1 overflow-hidden bg-[#fafafa]">
            <Preview svg={svg} error={error} isLoading={isCompiling} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-2 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>Created by Katta</span>
          <span>•</span>
          <span>Powered by @terrastruct/d2</span>
          <span>•</span>
          <a href="https://d2lang.com/tour/intro/" target="_blank" className="hover:text-blue-600 transition-colors">D2 Documentation</a>
        </div>
        <div>
          {isCompiling ? 'Rendering...' : 'Ready'}
        </div>
      </footer>
    </div>
  );
}

export default App;
