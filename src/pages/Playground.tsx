import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Loader2, Terminal, FileCode2, ArrowLeft, RotateCcw, Copy, Check } from "lucide-react";
import Editor from "@monaco-editor/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Language = "python" | "cpp" | "c" | "java" | "javascript" | "typescript" | "go" | "rust" | "ruby" | "php" | "csharp" | "kotlin" | "swift" | "r" | "perl" | "bash";

interface LanguageConfig {
    label: string;
    version: string;
    slug: string;
    monacoLang: string;
    extension: string;
    template: string;
}

const LANGUAGE_CONFIG: Record<Language, LanguageConfig> = {
    python: {
        label: "Python 3",
        version: "3.10.0",
        slug: "python",
        monacoLang: "python",
        extension: "py",
        template: `# Write your Python code here
print("Hello, World!")`,
    },
    javascript: {
        label: "JavaScript",
        version: "18.15.0",
        slug: "javascript",
        monacoLang: "javascript",
        extension: "js",
        template: `// Write your JavaScript code here
console.log("Hello, World!");`,
    },
    typescript: {
        label: "TypeScript",
        version: "5.0.3",
        slug: "typescript",
        monacoLang: "typescript",
        extension: "ts",
        template: `// Write your TypeScript code here
const message: string = "Hello, World!";
console.log(message);`,
    },
    cpp: {
        label: "C++",
        version: "10.2.0",
        slug: "cpp",
        monacoLang: "cpp",
        extension: "cpp",
        template: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    },
    c: {
        label: "C",
        version: "10.2.0",
        slug: "c",
        monacoLang: "c",
        extension: "c",
        template: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
    },
    java: {
        label: "Java",
        version: "15.0.2",
        slug: "java",
        monacoLang: "java",
        extension: "java",
        template: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    },
    csharp: {
        label: "C#",
        version: "6.12.0",
        slug: "csharp",
        monacoLang: "csharp",
        extension: "cs",
        template: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}`,
    },
    go: {
        label: "Go",
        version: "1.16.2",
        slug: "go",
        monacoLang: "go",
        extension: "go",
        template: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
    },
    rust: {
        label: "Rust",
        version: "1.68.2",
        slug: "rust",
        monacoLang: "rust",
        extension: "rs",
        template: `fn main() {
    println!("Hello, World!");
}`,
    },
    kotlin: {
        label: "Kotlin",
        version: "1.8.20",
        slug: "kotlin",
        monacoLang: "kotlin",
        extension: "kt",
        template: `fun main() {
    println("Hello, World!")
}`,
    },
    swift: {
        label: "Swift",
        version: "5.3.3",
        slug: "swift",
        monacoLang: "swift",
        extension: "swift",
        template: `print("Hello, World!")`,
    },
    ruby: {
        label: "Ruby",
        version: "3.0.1",
        slug: "ruby",
        monacoLang: "ruby",
        extension: "rb",
        template: `# Write your Ruby code here
puts "Hello, World!"`,
    },
    php: {
        label: "PHP",
        version: "8.2.3",
        slug: "php",
        monacoLang: "php",
        extension: "php",
        template: `<?php
echo "Hello, World!\\n";
?>`,
    },
    r: {
        label: "R",
        version: "4.1.1",
        slug: "r",
        monacoLang: "r",
        extension: "r",
        template: `# Write your R code here
print("Hello, World!")`,
    },
    perl: {
        label: "Perl",
        version: "5.36.0",
        slug: "perl",
        monacoLang: "perl",
        extension: "pl",
        template: `#!/usr/bin/perl
print "Hello, World!\\n";`,
    },
    bash: {
        label: "Bash",
        version: "5.2.0",
        slug: "bash",
        monacoLang: "shell",
        extension: "sh",
        template: `#!/bin/bash
echo "Hello, World!"`,
    },
};

const Playground: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [language, setLanguage] = React.useState<Language>("python");
    const [code, setCode] = React.useState(LANGUAGE_CONFIG.python.template);
    const [stdin, setStdin] = React.useState("");
    const [output, setOutput] = React.useState<string[]>([]);
    const [isRunning, setIsRunning] = React.useState(false);
    const [runtime, setRuntime] = React.useState<number | null>(null);
    const [copied, setCopied] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<"input" | "output">("output");

    const handleLanguageChange = (newLang: Language) => {
        setLanguage(newLang);
        setCode(LANGUAGE_CONFIG[newLang].template);
        setOutput([]);
        setRuntime(null);
    };

    const handleReset = () => {
        setCode(LANGUAGE_CONFIG[language].template);
        setOutput([]);
        setRuntime(null);
        setStdin("");
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({ title: "Copied!", description: "Code copied to clipboard" });
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput(["Running..."]);
        setRuntime(null);
        setActiveTab("output");

        const config = LANGUAGE_CONFIG[language];
        const startTime = Date.now();

        try {
            const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language: config.slug,
                    version: config.version,
                    files: [{ content: code }],
                    stdin: stdin,
                }),
            });

            const result = await response.json();
            const elapsed = Date.now() - startTime;
            setRuntime(elapsed);

            if (result.run) {
                const outputText = result.run.output || result.run.stderr || "";
                if (result.run.code === 0) {
                    setOutput(outputText ? outputText.split("\n") : ["Program finished with no output."]);
                } else {
                    setOutput([
                        "[ERROR] Runtime Error",
                        "",
                        ...outputText.split("\n"),
                    ]);
                }
            } else if (result.message) {
                setOutput(["[ERROR] " + result.message]);
            }
        } catch (error) {
            setOutput([`[ERROR] Network Error: ${error instanceof Error ? error.message : "Failed to execute"}`]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <AppLayout>
            <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
                {/* Header - LeetCode style */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => navigate("/arena")} className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4 mr-1.5" />
                            Code Lab
                        </Button>
                        <div className="h-4 w-px bg-border/50" />
                        <div className="flex items-center gap-2">
                            <FileCode2 className="h-4 w-4 text-primary" />
                            <span className="font-semibold">Playground</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={language} onValueChange={(v) => handleLanguageChange(v as Language)}>
                            <SelectTrigger className="w-36 h-8 text-sm bg-muted/50 border-border/50">
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset}>
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleRunCode}
                            disabled={isRunning}
                            className="gap-2 min-w-20 bg-primary hover:bg-primary/90"
                        >
                            {isRunning ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span className="text-sm">Run</span>
                                </>
                            ) : (
                                <>
                                    <Play className="h-3.5 w-3.5" />
                                    <span className="text-sm">Run</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex min-h-0">
                    {/* Code Editor Panel */}
                    <div className="flex-1 flex flex-col">
                        {/* File Tab - LeetCode style */}
                        <div className="px-3 py-1.5 text-xs font-medium bg-[#1e1e1e] border-b border-[#2d2d2d] flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#cccccc]">
                                <FileCode2 className="h-3 w-3" />
                                <span>main.{LANGUAGE_CONFIG[language].extension}</span>
                            </div>
                            <span className="text-[#858585] text-[10px]">{LANGUAGE_CONFIG[language].label}</span>
                        </div>
                        {/* Editor */}
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
                                    renderLineHighlight: "line",
                                    lineHeight: 22,
                                }}
                            />
                        </div>
                    </div>

                    {/* Right Panel - Console (LeetCode style) */}
                    <div className="w-[380px] flex flex-col border-l border-[#2d2d2d] bg-[#1e1e1e]">
                        {/* Console Tabs - LeetCode style */}
                        <div className="flex bg-[#252526] border-b border-[#2d2d2d]">
                            <button
                                onClick={() => setActiveTab("input")}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium transition-colors relative",
                                    activeTab === "input"
                                        ? "text-white bg-[#1e1e1e]"
                                        : "text-[#858585] hover:text-[#cccccc]"
                                )}
                            >
                                Input
                                {activeTab === "input" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab("output")}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium transition-colors relative flex items-center gap-2",
                                    activeTab === "output"
                                        ? "text-white bg-[#1e1e1e]"
                                        : "text-[#858585] hover:text-[#cccccc]"
                                )}
                            >
                                Output
                                {runtime !== null && (
                                    <span className="text-[10px] text-[#4ec9b0]">{runtime}ms</span>
                                )}
                                {activeTab === "output" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-hidden">
                            {activeTab === "input" ? (
                                <div className="h-full flex flex-col">
                                    <div className="px-3 py-1.5 text-[11px] text-[#858585] bg-[#252526] border-b border-[#2d2d2d]">
                                        Custom Input (stdin)
                                    </div>
                                    <Textarea
                                        value={stdin}
                                        onChange={(e) => setStdin(e.target.value)}
                                        placeholder="Enter your input here..."
                                        className="flex-1 resize-none rounded-none border-0 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#5a5a5a]"
                                    />
                                </div>
                            ) : (
                                <div className="h-full flex flex-col">
                                    <div className="px-3 py-1.5 text-[11px] bg-[#252526] border-b border-[#2d2d2d] flex items-center justify-between">
                                        <span className="text-[#858585]">Console</span>
                                        {output.length > 0 && !isRunning && (
                                            <span className={cn(
                                                "text-[10px] font-medium px-1.5 py-0.5 rounded",
                                                output[0]?.startsWith("[ERROR]")
                                                    ? "bg-red-500/20 text-red-400"
                                                    : "bg-green-500/20 text-green-400"
                                            )}>
                                                {output[0]?.startsWith("[ERROR]") ? "Error" : "Accepted"}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-auto p-3 bg-[#1e1e1e]">
                                        {isRunning ? (
                                            <div className="flex items-center gap-2 text-[#858585]">
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                <span className="font-mono text-sm">Running...</span>
                                            </div>
                                        ) : output.length > 0 ? (
                                            <div className="font-mono text-sm leading-6">
                                                {output.map((line, i) => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            line.startsWith("[ERROR]") && "text-red-400 font-semibold",
                                                            line.startsWith("[PASSED]") && "text-green-400 font-semibold",
                                                            line.startsWith("[FAILED]") && "text-red-400 font-semibold",
                                                            !line.startsWith("[") && "text-[#d4d4d4]"
                                                        )}
                                                    >
                                                        {line || "\u00A0"}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="font-mono text-sm text-[#5a5a5a]">
                                                Click "Run" to execute your code...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Playground;

