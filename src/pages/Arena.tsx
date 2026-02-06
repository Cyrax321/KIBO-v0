import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Code2, Play, Send, ChevronRight, Clock, CheckCircle2, XCircle, Tag, Building2, Gamepad2, FileCode2, History, Trophy, Target, BarChart3 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import { playSound } from "@/lib/sounds";
import CodePlayground from "@/components/arena/CodePlayground";
import { SubmissionHistory } from "@/components/arena/SubmissionHistory";
import { SubmissionHistoryFull } from "@/components/arena/SubmissionHistoryFull";
import { CodeLabStats } from "@/components/arena/CodeLabStats";
import { executeCode, runTestCases } from "@/lib/pistonExecutor";

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  company_tags: string[];
  topic_tags: string[];
  starter_code: Record<string, string>;
  sample_cases: { input: string; output: string }[];
  test_cases: { input: string; output: string }[];
  constraints: string | null;
  editorial_content: string | null;
}

// Sample problems for demo
const DEMO_PROBLEMS: Problem[] = [
  {
    id: "demo-1",
    title: "Two Sum",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

**Input Format:**
First line: space-separated integers (the array)
Second line: target integer

**Output Format:**
Two space-separated indices

**Example 1:**
\`\`\`
Input:
2 7 11 15
9
Output: 0 1
\`\`\`

**Example 2:**
\`\`\`
Input:
3 2 4
6
Output: 1 2
\`\`\``,
    difficulty: "easy",
    company_tags: ["Google", "Amazon", "Meta"],
    topic_tags: ["Array", "Hash Table"],
    starter_code: {
      javascript: `// Read input from stdin
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
  const nums = lines[0].split(' ').map(Number);
  const target = parseInt(lines[1]);
  
  // Your solution here
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        console.log(i, j);
        return;
      }
    }
  }
});`,
      python: `# Read input
nums = list(map(int, input().split()))
target = int(input())

# Your solution here
for i in range(len(nums)):
    for j in range(i + 1, len(nums)):
        if nums[i] + nums[j] == target:
            print(i, j)
            break
    else:
        continue
    break`,
    },
    sample_cases: [
      { input: "2 7 11 15\n9", output: "0 1" },
      { input: "3 2 4\n6", output: "1 2" },
    ],
    test_cases: [
      { input: "2 7 11 15\n9", output: "0 1" },
      { input: "3 2 4\n6", output: "1 2" },
      { input: "3 3\n6", output: "0 1" },
    ],
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
    editorial_content: null,
  },
  {
    id: "demo-2",
    title: "Valid Parentheses",
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Input Format:**
A single line containing the string

**Output Format:**
"true" or "false"

**Example 1:**
\`\`\`
Input: ()
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: ()[]{}
Output: true
\`\`\`

**Example 3:**
\`\`\`
Input: (]
Output: false
\`\`\``,
    difficulty: "easy",
    company_tags: ["Amazon", "Microsoft", "Apple"],
    topic_tags: ["String", "Stack"],
    starter_code: {
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (s) => {
  // Your solution here
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  
  for (const char of s) {
    if ('({['.includes(char)) {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) {
        console.log('false');
        return;
      }
    }
  }
  console.log(stack.length === 0 ? 'true' : 'false');
});`,
      python: `s = input()

# Your solution here
stack = []
mapping = {')': '(', '}': '{', ']': '['}

for char in s:
    if char in '({[':
        stack.append(char)
    else:
        if not stack or stack.pop() != mapping[char]:
            print('false')
            exit()

print('true' if not stack else 'false')`,
    },
    sample_cases: [
      { input: "()", output: "true" },
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" },
    ],
    test_cases: [
      { input: "()", output: "true" },
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" },
      { input: "([)]", output: "false" },
      { input: "{[]}", output: "true" },
    ],
    constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
    editorial_content: null,
  },
  {
    id: "demo-3",
    title: "FizzBuzz",
    description: `Given an integer \`n\`, return a list where for each number from 1 to n:
- If divisible by 3, output "Fizz"
- If divisible by 5, output "Buzz"
- If divisible by both 3 and 5, output "FizzBuzz"
- Otherwise, output the number

**Input Format:**
A single integer n

**Output Format:**
n lines, each containing the FizzBuzz result

**Example:**
\`\`\`
Input: 5
Output:
1
2
Fizz
4
Buzz
\`\`\``,
    difficulty: "easy",
    company_tags: ["Amazon", "Apple", "Bloomberg"],
    topic_tags: ["Math", "String"],
    starter_code: {
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
  const n = parseInt(line);
  
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) console.log('FizzBuzz');
    else if (i % 3 === 0) console.log('Fizz');
    else if (i % 5 === 0) console.log('Buzz');
    else console.log(i);
  }
});`,
      python: `n = int(input())

for i in range(1, n + 1):
    if i % 15 == 0:
        print('FizzBuzz')
    elif i % 3 == 0:
        print('Fizz')
    elif i % 5 == 0:
        print('Buzz')
    else:
        print(i)`,
    },
    sample_cases: [
      { input: "5", output: "1\n2\nFizz\n4\nBuzz" },
      { input: "3", output: "1\n2\nFizz" },
    ],
    test_cases: [
      { input: "5", output: "1\n2\nFizz\n4\nBuzz" },
      { input: "3", output: "1\n2\nFizz" },
      { input: "15", output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz" },
    ],
    constraints: "1 <= n <= 10^4",
    editorial_content: null,
  },
  {
    id: "demo-4",
    title: "Maximum Subarray",
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

**Input Format:**
Space-separated integers

**Output Format:**
A single integer (the maximum sum)

**Example 1:**
\`\`\`
Input: -2 1 -3 4 -1 2 1 -5 4
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.
\`\`\`

**Example 2:**
\`\`\`
Input: 1
Output: 1
\`\`\``,
    difficulty: "medium",
    company_tags: ["Google", "Microsoft", "LinkedIn"],
    topic_tags: ["Array", "Dynamic Programming", "Divide and Conquer"],
    starter_code: {
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
  const nums = line.split(' ').map(Number);
  
  let maxSum = nums[0];
  let currentSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  
  console.log(maxSum);
});`,
      python: `nums = list(map(int, input().split()))

max_sum = current_sum = nums[0]

for num in nums[1:]:
    current_sum = max(num, current_sum + num)
    max_sum = max(max_sum, current_sum)

print(max_sum)`,
    },
    sample_cases: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", output: "6" },
      { input: "1", output: "1" },
    ],
    test_cases: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", output: "6" },
      { input: "1", output: "1" },
      { input: "5 4 -1 7 8", output: "23" },
    ],
    constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
    editorial_content: null,
  },
  {
    id: "demo-5",
    title: "Reverse String",
    description: `Write a function that reverses a string. The input string is given as an array of characters.

You must do this by modifying the input array in-place with O(1) extra memory.

**Input Format:**
A single line containing the string

**Output Format:**
The reversed string

**Example 1:**
\`\`\`
Input: hello
Output: olleh
\`\`\`

**Example 2:**
\`\`\`
Input: Hannah
Output: hannaH
\`\`\``,
    difficulty: "easy",
    company_tags: ["Apple", "Microsoft", "Amazon"],
    topic_tags: ["String", "Two Pointers"],
    starter_code: {
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (s) => {
  // Your solution here
  console.log(s.split('').reverse().join(''));
});`,
      python: `s = input()

# Your solution here
print(s[::-1])`,
    },
    sample_cases: [
      { input: "hello", output: "olleh" },
      { input: "Hannah", output: "hannaH" },
    ],
    test_cases: [
      { input: "hello", output: "olleh" },
      { input: "Hannah", output: "hannaH" },
      { input: "A man a plan a canal Panama", output: "amanaP lanac a nalp a nam A" },
    ],
    constraints: "1 <= s.length <= 10^5\ns consists of printable ASCII characters.",
    editorial_content: null,
  },
  {
    id: "demo-6",
    title: "Climbing Stairs",
    description: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

**Input Format:**
A single integer n

**Output Format:**
Number of distinct ways

**Example 1:**
\`\`\`
Input: 2
Output: 2
Explanation: There are two ways: (1+1) and (2)
\`\`\`

**Example 2:**
\`\`\`
Input: 3
Output: 3
Explanation: (1+1+1), (1+2), (2+1)
\`\`\``,
    difficulty: "easy",
    company_tags: ["Google", "Amazon", "Apple"],
    topic_tags: ["Dynamic Programming", "Math", "Memoization"],
    starter_code: {
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
  const n = parseInt(line);
  
  if (n <= 2) {
    console.log(n);
    return;
  }
  
  let prev1 = 2, prev2 = 1;
  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  console.log(prev1);
});`,
      python: `n = int(input())

if n <= 2:
    print(n)
else:
    prev1, prev2 = 2, 1
    for i in range(3, n + 1):
        curr = prev1 + prev2
        prev2 = prev1
        prev1 = curr
    print(prev1)`,
    },
    sample_cases: [
      { input: "2", output: "2" },
      { input: "3", output: "3" },
    ],
    test_cases: [
      { input: "2", output: "2" },
      { input: "3", output: "3" },
      { input: "5", output: "8" },
      { input: "10", output: "89" },
    ],
    constraints: "1 <= n <= 45",
    editorial_content: null,
  },
  {
    id: "demo-7",
    title: "Binary Search",
    description: `Given a sorted array of integers and a target value, return the index if the target is found. If not, return -1.

You must write an algorithm with O(log n) runtime complexity.

**Input Format:**
First line: space-separated sorted integers
Second line: target integer

**Output Format:**
Index of target or -1

**Example 1:**
\`\`\`
Input:
-1 0 3 5 9 12
9
Output: 4
\`\`\`

**Example 2:**
\`\`\`
Input:
-1 0 3 5 9 12
2
Output: -1
\`\`\``,
    difficulty: "easy",
    company_tags: ["Google", "Microsoft", "Meta"],
    topic_tags: ["Array", "Binary Search"],
    starter_code: {
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
  const nums = lines[0].split(' ').map(Number);
  const target = parseInt(lines[1]);
  
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) {
      console.log(mid);
      return;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  console.log(-1);
});`,
      python: `nums = list(map(int, input().split()))
target = int(input())

left, right = 0, len(nums) - 1
result = -1

while left <= right:
    mid = (left + right) // 2
    if nums[mid] == target:
        result = mid
        break
    elif nums[mid] < target:
        left = mid + 1
    else:
        right = mid - 1

print(result)`,
    },
    sample_cases: [
      { input: "-1 0 3 5 9 12\n9", output: "4" },
      { input: "-1 0 3 5 9 12\n2", output: "-1" },
    ],
    test_cases: [
      { input: "-1 0 3 5 9 12\n9", output: "4" },
      { input: "-1 0 3 5 9 12\n2", output: "-1" },
      { input: "5\n5", output: "0" },
    ],
    constraints: "1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll integers in nums are unique.\nnums is sorted in ascending order.",
    editorial_content: null,
  },
  {
    id: "demo-8",
    title: "Best Time to Buy and Sell Stock",
    description: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy and a different day in the future to sell.

Return the maximum profit. If no profit is possible, return 0.

**Input Format:**
Space-separated integers (prices)

**Output Format:**
Maximum profit

**Example 1:**
\`\`\`
Input: 7 1 5 3 6 4
Output: 5
Explanation: Buy on day 2 (price=1), sell on day 5 (price=6), profit = 6-1 = 5.
\`\`\`

**Example 2:**
\`\`\`
Input: 7 6 4 3 1
Output: 0
Explanation: No profitable transaction possible.
\`\`\``,
    difficulty: "easy",
    company_tags: ["Amazon", "Meta", "Google", "Apple"],
    topic_tags: ["Array", "Dynamic Programming"],
    starter_code: {
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
  const prices = line.split(' ').map(Number);
  
  let minPrice = prices[0];
  let maxProfit = 0;
  
  for (let i = 1; i < prices.length; i++) {
    maxProfit = Math.max(maxProfit, prices[i] - minPrice);
    minPrice = Math.min(minPrice, prices[i]);
  }
  
  console.log(maxProfit);
});`,
      python: `prices = list(map(int, input().split()))

min_price = prices[0]
max_profit = 0

for price in prices[1:]:
    max_profit = max(max_profit, price - min_price)
    min_price = min(min_price, price)

print(max_profit)`,
    },
    sample_cases: [
      { input: "7 1 5 3 6 4", output: "5" },
      { input: "7 6 4 3 1", output: "0" },
    ],
    test_cases: [
      { input: "7 1 5 3 6 4", output: "5" },
      { input: "7 6 4 3 1", output: "0" },
      { input: "2 4 1", output: "2" },
    ],
    constraints: "1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4",
    editorial_content: null,
  },
  {
    id: "demo-9",
    title: "Contains Duplicate",
    description: `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.

**Input Format:**
Space-separated integers

**Output Format:**
"true" or "false"

**Example 1:**
\`\`\`
Input: 1 2 3 1
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: 1 2 3 4
Output: false
\`\`\``,
    difficulty: "easy",
    company_tags: ["Amazon", "Apple", "Google"],
    topic_tags: ["Array", "Hash Table", "Sorting"],
    starter_code: {
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
  const nums = line.split(' ').map(Number);
  const seen = new Set();
  
  for (const num of nums) {
    if (seen.has(num)) {
      console.log('true');
      return;
    }
    seen.add(num);
  }
  console.log('false');
});`,
      python: `nums = list(map(int, input().split()))

print('true' if len(nums) != len(set(nums)) else 'false')`,
    },
    sample_cases: [
      { input: "1 2 3 1", output: "true" },
      { input: "1 2 3 4", output: "false" },
    ],
    test_cases: [
      { input: "1 2 3 1", output: "true" },
      { input: "1 2 3 4", output: "false" },
      { input: "1 1 1 3 3 4 3 2 4 2", output: "true" },
    ],
    constraints: "1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
    editorial_content: null,
  },
  {
    id: "demo-10",
    title: "Move Zeroes",
    description: `Given an integer array nums, move all 0's to the end while maintaining the relative order of non-zero elements.

Note: You must do this in-place without making a copy of the array.

**Input Format:**
Space-separated integers

**Output Format:**
Space-separated integers with zeros at end

**Example 1:**
\`\`\`
Input: 0 1 0 3 12
Output: 1 3 12 0 0
\`\`\`

**Example 2:**
\`\`\`
Input: 0
Output: 0
\`\`\``,
    difficulty: "easy",
    company_tags: ["Meta", "Apple", "Amazon"],
    topic_tags: ["Array", "Two Pointers"],
    starter_code: {
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
  const nums = line.split(' ').map(Number);
  
  let insertPos = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      [nums[insertPos], nums[i]] = [nums[i], nums[insertPos]];
      insertPos++;
    }
  }
  
  console.log(nums.join(' '));
});`,
      python: `nums = list(map(int, input().split()))

insert_pos = 0
for i in range(len(nums)):
    if nums[i] != 0:
        nums[insert_pos], nums[i] = nums[i], nums[insert_pos]
        insert_pos += 1

print(' '.join(map(str, nums)))`,
    },
    sample_cases: [
      { input: "0 1 0 3 12", output: "1 3 12 0 0" },
      { input: "0", output: "0" },
    ],
    test_cases: [
      { input: "0 1 0 3 12", output: "1 3 12 0 0" },
      { input: "0", output: "0" },
      { input: "1 2 3", output: "1 2 3" },
    ],
    constraints: "1 <= nums.length <= 10^4\n-2^31 <= nums[i] <= 2^31 - 1",
    editorial_content: null,
  },
  {
    id: "demo-11",
    title: "Valid Palindrome",
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string s, return true if it is a palindrome, or false otherwise.

**Input Format:**
A single line containing the string

**Output Format:**
"true" or "false"

**Example 1:**
\`\`\`
Input: A man, a plan, a canal: Panama
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.
\`\`\`

**Example 2:**
\`\`\`
Input: race a car
Output: false
\`\`\``,
    difficulty: "easy",
    company_tags: ["Meta", "Microsoft", "Apple"],
    topic_tags: ["String", "Two Pointers"],
    starter_code: {
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (s) => {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const reversed = cleaned.split('').reverse().join('');
  console.log(cleaned === reversed ? 'true' : 'false');
});`,
      python: `import re
s = input()

cleaned = re.sub(r'[^a-zA-Z0-9]', '', s).lower()
print('true' if cleaned == cleaned[::-1] else 'false')`,
    },
    sample_cases: [
      { input: "A man, a plan, a canal: Panama", output: "true" },
      { input: "race a car", output: "false" },
    ],
    test_cases: [
      { input: "A man, a plan, a canal: Panama", output: "true" },
      { input: "race a car", output: "false" },
      { input: " ", output: "true" },
    ],
    constraints: "1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.",
    editorial_content: null,
  },
  {
    id: "demo-12",
    title: "Single Number",
    description: `Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.

You must implement a solution with O(n) time complexity and O(1) extra space.

**Input Format:**
Space-separated integers

**Output Format:**
The single number

**Example 1:**
\`\`\`
Input: 2 2 1
Output: 1
\`\`\`

**Example 2:**
\`\`\`
Input: 4 1 2 1 2
Output: 4
\`\`\``,
    difficulty: "easy",
    company_tags: ["Amazon", "Google", "Apple"],
    topic_tags: ["Array", "Bit Manipulation"],
    starter_code: {
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
  const nums = line.split(' ').map(Number);
  
  let result = 0;
  for (const num of nums) {
    result ^= num;
  }
  console.log(result);
});`,
      python: `nums = list(map(int, input().split()))

result = 0
for num in nums:
    result ^= num

print(result)`,
    },
    sample_cases: [
      { input: "2 2 1", output: "1" },
      { input: "4 1 2 1 2", output: "4" },
    ],
    test_cases: [
      { input: "2 2 1", output: "1" },
      { input: "4 1 2 1 2", output: "4" },
      { input: "1", output: "1" },
    ],
    constraints: "1 <= nums.length <= 3 * 10^4\n-3 * 10^4 <= nums[i] <= 3 * 10^4\nEach element appears twice except for one.",
    editorial_content: null,
  },
  {
    id: "demo-13",
    title: "Missing Number",
    description: `Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.

**Input Format:**
Space-separated integers

**Output Format:**
The missing number

**Example 1:**
\`\`\`
Input: 3 0 1
Output: 2
Explanation: n = 3, so numbers should be 0, 1, 2, 3. 2 is missing.
\`\`\`

**Example 2:**
\`\`\`
Input: 0 1
Output: 2
\`\`\``,
    difficulty: "easy",
    company_tags: ["Amazon", "Microsoft", "Meta"],
    topic_tags: ["Array", "Hash Table", "Math", "Bit Manipulation"],
    starter_code: {
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
  const nums = line.split(' ').map(Number);
  const n = nums.length;
  
  const expectedSum = (n * (n + 1)) / 2;
  const actualSum = nums.reduce((a, b) => a + b, 0);
  
  console.log(expectedSum - actualSum);
});`,
      python: `nums = list(map(int, input().split()))
n = len(nums)

expected_sum = n * (n + 1) // 2
actual_sum = sum(nums)

print(expected_sum - actual_sum)`,
    },
    sample_cases: [
      { input: "3 0 1", output: "2" },
      { input: "0 1", output: "2" },
    ],
    test_cases: [
      { input: "3 0 1", output: "2" },
      { input: "0 1", output: "2" },
      { input: "9 6 4 2 3 5 7 0 1", output: "8" },
    ],
    constraints: "n == nums.length\n1 <= n <= 10^4\n0 <= nums[i] <= n\nAll numbers in nums are unique.",
    editorial_content: null,
  },
  {
    id: "demo-14",
    title: "3Sum",
    description: `Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.

Notice that the solution set must not contain duplicate triplets.

**Input Format:**
Space-separated integers

**Output Format:**
Each triplet on a new line, space-separated

**Example 1:**
\`\`\`
Input: -1 0 1 2 -1 -4
Output:
-1 -1 2
-1 0 1
\`\`\`

**Example 2:**
\`\`\`
Input: 0 1 1
Output:
(no output - no triplets sum to 0)
\`\`\``,
    difficulty: "medium",
    company_tags: ["Meta", "Amazon", "Google", "Apple"],
    topic_tags: ["Array", "Two Pointers", "Sorting"],
    starter_code: {
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
  const nums = line.split(' ').map(Number);
  nums.sort((a, b) => a - b);
  
  const result = [];
  
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i-1]) continue;
    
    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left+1]) left++;
        while (left < right && nums[right] === nums[right-1]) right--;
        left++; right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  
  result.forEach(triplet => console.log(triplet.join(' ')));
});`,
      python: `nums = list(map(int, input().split()))
nums.sort()

result = []

for i in range(len(nums) - 2):
    if i > 0 and nums[i] == nums[i-1]:
        continue
    
    left, right = i + 1, len(nums) - 1
    while left < right:
        total = nums[i] + nums[left] + nums[right]
        if total == 0:
            result.append([nums[i], nums[left], nums[right]])
            while left < right and nums[left] == nums[left+1]:
                left += 1
            while left < right and nums[right] == nums[right-1]:
                right -= 1
            left += 1
            right -= 1
        elif total < 0:
            left += 1
        else:
            right -= 1

for triplet in result:
    print(' '.join(map(str, triplet)))`,
    },
    sample_cases: [
      { input: "-1 0 1 2 -1 -4", output: "-1 -1 2\n-1 0 1" },
      { input: "0 0 0", output: "0 0 0" },
    ],
    test_cases: [
      { input: "-1 0 1 2 -1 -4", output: "-1 -1 2\n-1 0 1" },
      { input: "0 0 0", output: "0 0 0" },
      { input: "0 1 1", output: "" },
    ],
    constraints: "3 <= nums.length <= 3000\n-10^5 <= nums[i] <= 10^5",
    editorial_content: null,
  },
];

interface ProblemCardProps {
  problem: Problem;
  onClick: () => void;
  attemptCount?: number;
  bestStatus?: string;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem, onClick, attemptCount = 0, bestStatus }) => {
  const difficultyColor = {
    easy: "text-success bg-success/10",
    medium: "text-warning bg-warning/10",
    hard: "text-destructive bg-destructive/10",
  }[problem.difficulty];

  const isSolved = bestStatus === "accepted";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={cn(
        "p-4 hover:shadow-md transition-shadow",
        isSolved && "border-success/50 bg-success/5"
      )}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isSolved && <CheckCircle2 className="h-4 w-4 text-success" />}
              <h3 className="font-semibold text-foreground">{problem.title}</h3>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {problem.topic_tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              {problem.company_tags.slice(0, 2).join(", ")}
            </div>
            {attemptCount > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {attemptCount} attempt{attemptCount !== 1 ? "s" : ""}
                </Badge>
                {isSolved && (
                  <Badge variant="default" className="text-xs bg-success">
                    Solved
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Badge className={cn("text-xs capitalize", difficultyColor)}>
            {problem.difficulty}
          </Badge>
        </div>
      </Card>
    </motion.div>
  );
};

const Arena: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [user, setUser] = React.useState<any>(null);
  const [problems] = React.useState<Problem[]>(DEMO_PROBLEMS);
  const [selectedProblem, setSelectedProblem] = React.useState<Problem | null>(null);
  const [code, setCode] = React.useState("");
  const [language, setLanguage] = React.useState("javascript");
  const [consoleOutput, setConsoleOutput] = React.useState<string[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("description");
  const [mainTab, setMainTab] = React.useState("problems");

  // Problem attempt tracking
  const [problemAttempts, setProblemAttempts] = React.useState<Record<string, { count: number; bestStatus: string }>>({});

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setUser(session.user);
      fetchProblemAttempts(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  // Fetch attempt counts for each problem
  const fetchProblemAttempts = async (userId: string) => {
    const { data: submissions } = await supabase
      .from("submissions")
      .select("problem_id, status")
      .eq("user_id", userId);

    if (submissions) {
      const attempts: Record<string, { count: number; bestStatus: string }> = {};
      submissions.forEach((sub) => {
        if (!attempts[sub.problem_id]) {
          attempts[sub.problem_id] = { count: 0, bestStatus: "" };
        }
        attempts[sub.problem_id].count++;
        if (sub.status === "accepted") {
          attempts[sub.problem_id].bestStatus = "accepted";
        } else if (!attempts[sub.problem_id].bestStatus) {
          attempts[sub.problem_id].bestStatus = sub.status;
        }
      });
      setProblemAttempts(attempts);
    }
  };

  // Realtime subscription for attempts
  React.useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`problem-attempts:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "submissions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchProblemAttempts(user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  React.useEffect(() => {
    const problemId = searchParams.get("problem");
    if (problemId) {
      const problem = problems.find(p => p.id === problemId);
      if (problem) {
        setSelectedProblem(problem);
        setCode(problem.starter_code[language] || "");
      }
    }
  }, [searchParams, problems, language]);

  const handleSelectProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    setSearchParams({ problem: problem.id });
    setCode(problem.starter_code[language] || "");
    setConsoleOutput([]);
    setActiveTab("description");
  };

  const handleRunCode = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setConsoleOutput(["Running sample test cases..."]);

    try {
      const { results, allPassed, runtime } = await runTestCases(
        code,
        language,
        selectedProblem.sample_cases
      );

      const output: string[] = [
        `Executed in ${runtime}ms`,
        "",
      ];

      results.forEach((result, i) => {
        if (result.passed) {
          output.push(`[PASSED] Sample Case ${i + 1}`);
          output.push(`  Input: ${result.input}`);
          output.push(`  Output: ${result.actual}`);
        } else {
          output.push(`[FAILED] Sample Case ${i + 1}`);
          output.push(`  Input: ${result.input}`);
          output.push(`  Expected: ${result.expected}`);
          output.push(`  Got: ${result.actual || result.error || "No output"}`);
        }
        output.push("");
      });

      if (allPassed) {
        output.push("All sample cases passed. Ready to submit.");
      } else {
        output.push("Some sample cases failed. Review your solution.");
      }

      setConsoleOutput(output);
    } catch (error: any) {
      setConsoleOutput([`[ERROR] ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setConsoleOutput(["Submitting solution...", "Running against all test cases..."]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Error", description: "Please log in to submit", variant: "destructive" });
        setIsRunning(false);
        return;
      }

      const { results, allPassed, runtime } = await runTestCases(
        code,
        language,
        selectedProblem.test_cases
      );

      const output: string[] = [];
      let passedCount = 0;

      results.forEach((result, i) => {
        if (result.passed) {
          passedCount++;
          output.push(`[PASSED] Test Case ${i + 1}`);
        } else {
          output.push(`[FAILED] Test Case ${i + 1}`);
          output.push(`  Input: ${result.input}`);
          output.push(`  Expected: ${result.expected}`);
          output.push(`  Got: ${result.actual || result.error || "No output"}`);
        }
      });

      output.unshift(`Results: ${passedCount}/${results.length} passed (${runtime}ms)`, "");

      // Save submission to database
      const submissionStatus = allPassed ? "accepted" : "wrong_answer";
      const { error: submissionError } = await supabase.from("submissions").insert([{
        user_id: session.user.id,
        problem_id: selectedProblem.id,
        code,
        language,
        status: submissionStatus,
        runtime_ms: runtime,
        test_results: results as any,
      }]);

      if (submissionError) {
        console.error("Failed to save submission:", submissionError);
      }

      if (allPassed) {
        playSound("quizPassed");
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#8b5cf6", "#10b981"],
        });
        output.push("");
        output.push("Status: Accepted");
        output.push("All test cases passed.");

        // Award XP via gamification
        const difficulty = selectedProblem.difficulty as 'easy' | 'medium' | 'hard';
        const { data: xpResult } = await supabase.rpc("record_problem_solved", {
          p_user_id: session.user.id,
          p_difficulty: difficulty,
        });

        toast({ title: "Accepted!", description: `+${xpResult?.[0]?.xp_gained || 100} XP earned` });
      } else {
        output.push("");
        output.push(`Status: Wrong Answer`);
        output.push(`${passedCount}/${results.length} test cases passed.`);
        toast({ title: "Wrong Answer", description: "Keep trying!", variant: "destructive" });
      }

      setConsoleOutput(output);
    } catch (error: any) {
      setConsoleOutput([`[ERROR] ${error.message}`]);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsRunning(false);
    }
  };

  // Problem list view (with tabs)
  if (!selectedProblem) {
    return (
      <AppLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-background">
          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Code2 className="h-6 w-6 text-primary" />
                  <h1 className="font-bold text-2xl">Code Lab</h1>
                </div>
                {/* Tabs - LeetCode style horizontal */}
                <nav className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
                  <button
                    onClick={() => setMainTab("problems")}
                    className={cn(
                      "px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                      mainTab === "problems"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Gamepad2 className="h-4 w-4" />
                    Problems
                  </button>
                  <button
                    onClick={() => navigate("/playground")}
                    className="px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <FileCode2 className="h-4 w-4" />
                    Playground
                  </button>
                  <button
                    onClick={() => setMainTab("history")}
                    className={cn(
                      "px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                      mainTab === "history"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <History className="h-4 w-4" />
                    History
                  </button>
                </nav>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4 text-warning" />
                <span>{problems.length} Problems</span>
              </div>
            </div>

            {mainTab === "problems" ? (
              <div className="flex gap-6">
                {/* Left Side - Stats Sidebar */}
                <div className="hidden lg:block w-72 flex-shrink-0">
                  <div className="sticky top-20 space-y-4">
                    {/* User Progress Card */}
                    {user?.id && (
                      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          Your Progress
                        </h3>
                        <CodeLabStats userId={user.id} />
                      </Card>
                    )}

                    {/* Difficulty Breakdown */}
                    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Difficulty
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-xs">Easy</span>
                          </div>
                          <span className="text-xs font-medium text-green-500">
                            {problems.filter(p => p.difficulty === "easy").length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-500" />
                            <span className="text-xs">Medium</span>
                          </div>
                          <span className="text-xs font-medium text-yellow-500">
                            {problems.filter(p => p.difficulty === "medium").length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-xs">Hard</span>
                          </div>
                          <span className="text-xs font-medium text-red-500">
                            {problems.filter(p => p.difficulty === "hard").length}
                          </span>
                        </div>
                      </div>
                    </Card>

                    {/* Quick Tips */}
                    <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-warning" />
                        Pro Tips
                      </h3>
                      <ul className="text-xs text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 mt-0.5 text-success flex-shrink-0" />
                          Start with Easy problems to build confidence
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 mt-0.5 text-success flex-shrink-0" />
                          Read constraints carefully before coding
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 mt-0.5 text-success flex-shrink-0" />
                          Test with sample cases first
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 mt-0.5 text-success flex-shrink-0" />
                          Practice daily for best results
                        </li>
                      </ul>
                    </Card>

                    {/* Company Tags */}
                    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        Top Companies
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {["Google", "Amazon", "Meta", "Apple", "Microsoft"].map((company) => (
                          <Badge key={company} variant="outline" className="text-[10px] px-2 py-0.5">
                            {company}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Right Side - Problems Grid */}
                <div className="flex-1 min-w-0">
                  {/* Problems Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-lg font-semibold">All Problems</h2>
                      <Badge variant="secondary" className="text-xs">
                        {problems.length} total
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Easy
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        Medium
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        Hard
                      </span>
                    </div>
                  </div>

                  {/* Problems List - Table style like LeetCode */}
                  <Card className="overflow-hidden border-border/50">
                    <div className="divide-y divide-border/50">
                      {problems.map((problem, index) => {
                        const attempts = problemAttempts[problem.id];
                        const isSolved = attempts?.bestStatus === "accepted";
                        return (
                          <motion.div
                            key={problem.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.02 }}
                            onClick={() => handleSelectProblem(problem)}
                            className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors group"
                          >
                            {/* Status */}
                            <div className="w-6 flex-shrink-0">
                              {isSolved ? (
                                <CheckCircle2 className="h-5 w-5 text-success" />
                              ) : attempts?.count ? (
                                <Clock className="h-5 w-5 text-warning" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                              )}
                            </div>

                            {/* Title & Tags */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium group-hover:text-primary transition-colors">
                                  {index + 1}. {problem.title}
                                </span>
                                {attempts?.count && !isSolved && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    {attempts.count} attempts
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {problem.topic_tags.slice(0, 3).map((tag) => (
                                  <span key={tag} className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Companies */}
                            <div className="hidden md:flex items-center gap-1">
                              {problem.company_tags.slice(0, 2).map((company) => (
                                <Badge key={company} variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                                  {company}
                                </Badge>
                              ))}
                            </div>

                            {/* Difficulty */}
                            <Badge
                              className={cn(
                                "text-xs px-2 py-0.5 font-medium",
                                problem.difficulty === "easy" && "bg-green-500/10 text-green-500 hover:bg-green-500/20",
                                problem.difficulty === "medium" && "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
                                problem.difficulty === "hard" && "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                              )}
                            >
                              {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                            </Badge>

                            {/* Arrow */}
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </motion.div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </div>
            ) : mainTab === "history" ? (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-lg font-semibold mb-4">Submission History</h2>
                {user?.id && (
                  <SubmissionHistoryFull
                    userId={user.id}
                    onViewCode={(code, lang) => {
                      setCode(code);
                      setLanguage(lang);
                      toast({ title: "Code Loaded", description: "Code has been loaded into memory. Select a problem to use it." });
                    }}
                  />
                )}
              </div>
            ) : null}
          </div>
        </div>
      </AppLayout>
    );
  }

  // IDE view
  return (
    <AppLayout>
      <div className="h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card">
          <Button variant="ghost" size="sm" onClick={() => setSelectedProblem(null)}>
            Code Lab
          </Button>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{selectedProblem.title}</span>
          <Badge className={cn(
            "ml-2 text-xs capitalize",
            {
              easy: "text-success bg-success/10",
              medium: "text-warning bg-warning/10",
              hard: "text-destructive bg-destructive/10",
            }[selectedProblem.difficulty]
          )}>
            {selectedProblem.difficulty}
          </Badge>
        </div>

        {/* Main IDE Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Problem Description */}
          <div className="w-1/2 border-r border-border overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="w-full justify-start border-b rounded-none px-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="editorial" disabled={!selectedProblem.editorial_content}>
                  Editorial
                </TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="p-4 prose prose-sm max-w-none">
                <div
                  className="whitespace-pre-wrap text-sm text-foreground"
                  dangerouslySetInnerHTML={{
                    __html: selectedProblem.description
                      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 rounded">$1</code>')
                      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                      .replace(/```([^`]+)```/g, '<pre class="bg-muted p-2 rounded text-xs overflow-x-auto">$1</pre>')
                  }}
                />

                {selectedProblem.constraints && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-sm mb-2">Constraints:</h4>
                    <pre className="text-xs bg-muted p-2 rounded">{selectedProblem.constraints}</pre>
                  </div>
                )}

                <div className="mt-6">
                  <h4 className="font-semibold text-sm mb-2">Companies:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedProblem.company_tags.map((company) => (
                      <Badge key={company} variant="outline" className="text-xs">
                        <Building2 className="h-3 w-3 mr-1" />
                        {company}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="editorial" className="p-4">
                <p className="text-muted-foreground">Editorial will be unlocked after solving.</p>
              </TabsContent>

              <TabsContent value="submissions" className="p-4">
                <SubmissionHistory
                  userId={user?.id || ""}
                  problemId={selectedProblem.id}
                  onViewCode={(code, lang) => {
                    setCode(code);
                    setLanguage(lang);
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="w-1/2 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Editor */}
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Console */}
            <div className="h-40 border-t border-border bg-muted/50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
                <span className="text-sm font-medium">Console</span>
              </div>
              <div className="p-4 font-mono text-xs overflow-y-auto h-[calc(100%-2.5rem)]">
                {consoleOutput.map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      line.startsWith("[PASSED]") && "text-success font-bold",
                      line.startsWith("[FAILED]") && "text-destructive font-bold",
                      line.startsWith("[ERROR]") && "text-destructive font-bold",
                      line.startsWith("Status: Accepted") && "text-success font-bold",
                      line.startsWith("Status: Wrong") && "text-destructive font-bold",
                      line.startsWith("All test cases passed") && "text-success",
                      line.startsWith("Results:") && "font-semibold"
                    )}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-card">
              <Button variant="outline" onClick={handleRunCode} disabled={isRunning}>
                <Play className="h-4 w-4 mr-2" />
                Run
              </Button>
              <Button onClick={handleSubmit} disabled={isRunning}>
                <Send className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Arena;
