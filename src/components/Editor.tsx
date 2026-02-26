import MonacoEditor from '@monaco-editor/react';

interface EditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export const Editor = ({ value, onChange }: EditorProps) => {
  return (
    <div className="h-full w-full border-r border-gray-200">
      <MonacoEditor
        height="100%"
        defaultLanguage="python" // D2 doesn't have built-in support, python is okay for basic coloring
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};
