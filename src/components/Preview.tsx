import { Loader2, AlertCircle } from 'lucide-react';

interface PreviewProps {
  svg: string;
  error: string | null;
  isLoading: boolean;
}

export const Preview = ({ svg, error, isLoading }: PreviewProps) => {
  return (
    <div className="h-full w-full flex flex-col bg-white relative overflow-hidden">
      {isLoading && (
        <div className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        </div>
      )}

      {error ? (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Compilation Error</h3>
          <pre className="text-sm text-red-600 bg-red-50 p-4 rounded-lg overflow-auto max-w-full whitespace-pre-wrap">
            {error}
          </pre>
        </div>
      ) : svg ? (
        <div 
          className="flex-1 overflow-auto p-8 flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400 italic">
          Enter some D2 script to generate a diagram
        </div>
      )}
    </div>
  );
};
