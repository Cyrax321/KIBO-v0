import * as React from "react";
import { motion } from "framer-motion";
import { Play, Loader2, Terminal, FileCode2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

type Language = "python" | "cpp" | "java" | "javascript";

interface LanguageConfig {
  label: string;
  version: string;
  slug: string;
  monacoLang: string;
  template: string;
}

const LANGUAGE_CONFIG: Record<Language, LanguageConfig> = {
  python: {
    label: "Python",
    version: "3.10.0",
    slug: "python",
    monacoLang: "python",
    template: `print("Hello Kibo!")`,
  },
  cpp: {
    label: "C++",
    version: "10.2.0",
    slug: "cpp",
    monacoLang: "cpp",
    template: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello Kibo!";
    return 0;
}`,
  },
  java: {
    label: "Java",
    version: "15.0.2",
    slug: "java",
    monacoLang: "java",
    template: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello Kibo!");
    }
}`,
  },
  javascript: {
    label: "JavaScript",
    version: "18.15.0",
    slug: "javascript",
    monacoLang: "javascript",
    template: `console.log("Hello Kibo!");`,
  },
};

const CodePlayground: React.FC = () => {
  const [language, setLanguage] = React.useState<Language>("python");
  const [code, setCode] = React.useState(LANGUAGE_CONFIG.python.template);
  const [stdin, setStdin] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [isRunning, setIsRunning] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setCode(LANGUAGE_CONFIG[newLang].template);
    setOutput("");
    setIsError(false);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("");
    setIsError(false);

    const config = LANGUAGE_CONFIG[language];

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: config.slug,
          version: config.version,
          files: [{ content: code }],
          stdin: stdin,
        }),
      });

      const result = await response.json();

      if (result.run) {
        const outputText = result.run.output || result.run.stderr || "No output";
        setOutput(outputText);
        setIsError(result.run.code !== 0);
      } else if (result.message) {
        setOutput(`Error: ${result.message}`);
        setIsError(true);
      }
    } catch (error) {
      setOutput(`Network Error: ${error instanceof Error ? error.message : "Failed to execute code"}`);
      setIsError(true);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-full flex flex-col bg-background"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary">
            <FileCode2 className="h-5 w-5" />
            <span className="font-semibold">Code Playground</span>
          </div>
          <Select value={language} onValueChange={(v) => handleLanguageChange(v as Language)}>
            <SelectTrigger className="w-36 h-9 bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleRunCode}
          disabled={isRunning}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {isRunning ? "Running..." : "Run Code"}
        </Button>
      </div>

      {/* Main Panes */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Pane - Code Editor */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full flex flex-col">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/30 border-b border-border flex items-center gap-2">
                <FileCode2 className="h-3.5 w-3.5" />
                main.{language === "cpp" ? "cpp" : language === "java" ? "java" : language === "javascript" ? "js" : "py"}
              </div>
              <div className="flex-1 min-h-0">
                <Editor
                  height="100%"
                  language={LANGUAGE_CONFIG[language].monacoLang}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 12 },
                    fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
                    fontLigatures: true,
                    cursorBlinking: "smooth",
                    smoothScrolling: true,
                    cursorSmoothCaretAnimation: "on",
                  }}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border/50 hover:bg-primary/20 transition-colors" />

          {/* Right Pane - Input/Output */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <ResizablePanelGroup direction="vertical" className="h-full">
              {/* Custom Input */}
              <ResizablePanel defaultSize={40} minSize={20}>
                <div className="h-full flex flex-col bg-muted/20">
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/30 border-b border-border flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5" />
                    Custom Input (stdin)
                  </div>
                  <Textarea
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    placeholder="Enter your input here..."
                    className="flex-1 resize-none rounded-none border-0 bg-transparent font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-border/50 hover:bg-primary/20 transition-colors" />

              {/* Output */}
              <ResizablePanel defaultSize={60} minSize={30}>
                <div className="h-full flex flex-col">
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/30 border-b border-border flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5" />
                    Output
                  </div>
                  <div className="flex-1 overflow-auto bg-muted/50 p-4">
                    {isRunning ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="font-mono text-sm">Executing...</span>
                      </div>
                    ) : output ? (
                      <pre
                        className={cn(
                          "font-mono text-sm whitespace-pre-wrap break-words",
                          isError ? "text-destructive" : "text-success"
                        )}
                      >
                        {output}
                      </pre>
                    ) : (
                      <span className="font-mono text-sm text-muted-foreground/60">
                        Click "Run Code" to see output...
                      </span>
                    )}
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </motion.div>
  );
};

export default CodePlayground;
