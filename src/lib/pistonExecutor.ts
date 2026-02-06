// Piston API code execution utility

export interface PistonResult {
  output: string;
  stderr: string;
  code: number;
  signal: string | null;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  runtime?: number;
}

export interface TestCaseResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
}

const PISTON_API = "https://emkc.org/api/v2/piston/execute";

const LANGUAGE_CONFIG: Record<string, { version: string; slug: string }> = {
  javascript: { version: "18.15.0", slug: "javascript" },
  python: { version: "3.10.0", slug: "python" },
  cpp: { version: "10.2.0", slug: "cpp" },
  java: { version: "15.0.2", slug: "java" },
};

// Generate wrapper code that handles test case execution
function generateTestWrapper(
  userCode: string,
  language: string,
  testInput: string,
  functionName: string
): string {
  // Parse the input to extract arguments
  // For problems like "Two Sum": input is "[2,7,11,15], 9"
  
  if (language === "javascript") {
    return `
${userCode}

// Test execution
const input = ${testInput.startsWith("[") ? `[${testInput}]` : testInput};
try {
  const result = ${functionName}(...(Array.isArray(input[0]) ? input : [input]));
  console.log(JSON.stringify(result));
} catch (e) {
  console.error(e.message);
}
`;
  }
  
  if (language === "python") {
    return `
${userCode}

# Test execution
import json
try:
    input_data = ${testInput.startsWith("[") ? `[${testInput}]` : testInput}
    if isinstance(input_data, list) and len(input_data) > 0:
        if isinstance(input_data[0], list):
            result = ${functionName}(*input_data)
        else:
            result = ${functionName}(input_data) if len(input_data) == 1 else ${functionName}(*input_data)
    else:
        result = ${functionName}(input_data)
    print(json.dumps(result) if result is not None else "null")
except Exception as e:
    print(f"Error: {e}", file=__import__('sys').stderr)
`;
  }

  // For other languages, just run the code directly
  return userCode;
}

// Execute code using Piston API
export async function executeCode(
  code: string,
  language: string,
  stdin: string = ""
): Promise<ExecutionResult> {
  const config = LANGUAGE_CONFIG[language];
  if (!config) {
    return { success: false, output: "", error: `Unsupported language: ${language}` };
  }

  const startTime = Date.now();

  try {
    const response = await fetch(PISTON_API, {
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
    const runtime = Date.now() - startTime;

    if (result.run) {
      const output = result.run.output?.trim() || "";
      const stderr = result.run.stderr?.trim() || "";
      const isError = result.run.code !== 0;

      return {
        success: !isError,
        output: output || stderr,
        error: isError ? stderr || output : undefined,
        runtime,
      };
    }

    return { success: false, output: "", error: result.message || "Execution failed" };
  } catch (error) {
    return {
      success: false,
      output: "",
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// Run code against multiple test cases
export async function runTestCases(
  code: string,
  language: string,
  testCases: { input: string; output: string }[],
  functionName?: string
): Promise<{ results: TestCaseResult[]; allPassed: boolean; runtime: number }> {
  const results: TestCaseResult[] = [];
  let allPassed = true;
  const startTime = Date.now();

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    // For simple problems, we'll use stdin approach
    // The user's code should read from stdin and print to stdout
    const result = await executeCode(code, language, testCase.input);
    
    const actualOutput = result.output.trim();
    const expectedOutput = testCase.output.trim();
    
    // Normalize outputs for comparison (handle JSON formatting differences)
    const normalizedActual = normalizeOutput(actualOutput);
    const normalizedExpected = normalizeOutput(expectedOutput);
    
    const passed = normalizedActual === normalizedExpected;
    
    if (!passed) allPassed = false;

    results.push({
      passed,
      input: testCase.input,
      expected: expectedOutput,
      actual: actualOutput,
      error: result.error,
    });
  }

  return {
    results,
    allPassed,
    runtime: Date.now() - startTime,
  };
}

// Normalize output for comparison
function normalizeOutput(output: string): string {
  // Remove extra whitespace and normalize JSON
  let normalized = output.trim().toLowerCase();
  
  // Try to parse as JSON and re-stringify for consistent formatting
  try {
    const parsed = JSON.parse(normalized);
    normalized = JSON.stringify(parsed);
  } catch {
    // Not JSON, keep as-is
  }
  
  // Remove spaces around brackets and commas
  normalized = normalized.replace(/\s*,\s*/g, ",");
  normalized = normalized.replace(/\[\s+/g, "[");
  normalized = normalized.replace(/\s+\]/g, "]");
  
  return normalized;
}
