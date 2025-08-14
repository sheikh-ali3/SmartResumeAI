import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, Type, AlignLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
  minHeight = 120
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleInput();
  };

  const isCommandActive = (command: string): boolean => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };

  const toolbarButtons = [
    {
      command: "bold",
      icon: Bold,
      label: "Bold",
    },
    {
      command: "italic", 
      icon: Italic,
      label: "Italic",
    },
    {
      command: "insertUnorderedList",
      icon: List,
      label: "Bullet List",
    },
    {
      command: "insertOrderedList",
      icon: ListOrdered,
      label: "Numbered List",
    },
  ];

  return (
    <div 
      className={cn(
        "rich-text-editor",
        isFocused && "ring-2 ring-primary border-primary",
        className
      )}
      style={{ minHeight }}
    >
      {/* Toolbar */}
      <div className="editor-toolbar">
        {toolbarButtons.map(({ command, icon: Icon, label }) => (
          <Button
            key={command}
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isCommandActive(command) && "bg-primary text-primary-foreground"
            )}
            onClick={() => execCommand(command)}
            title={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        className="editor-content"
        style={{ minHeight: minHeight - 50 }}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <style jsx>{`
        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        .editor-content:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
