import { Quiz } from "./types";

export const FAANG_QUIZZES: Quiz[] = [
  // Data Structures & Algorithms
  {
    id: "dsa-arrays",
    title: "Arrays & Strings Mastery",
    topic: "Data Structures",
    difficulty: "easy",
    duration_minutes: 10,
    description: "Test your knowledge of array manipulation, string operations, and common patterns.",
    questions: [
      {
        id: "q1",
        question: "What is the time complexity of accessing an element by index in an array?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        correctIndex: 0,
        explanation: "Array access by index is O(1) because arrays store elements in contiguous memory locations."
      },
      {
        id: "q2",
        question: "Which technique is most efficient for finding if a sorted array contains a target value?",
        options: ["Linear search", "Binary search", "Hash table lookup", "Breadth-first search"],
        correctIndex: 1,
        explanation: "Binary search is O(log n) and is the optimal approach for sorted arrays."
      },
      {
        id: "q3",
        question: "What is the two-pointer technique primarily used for?",
        options: ["Sorting arrays", "Finding pairs or subarrays with certain properties", "Graph traversal", "Tree balancing"],
        correctIndex: 1,
        explanation: "Two-pointer technique efficiently finds pairs or subarrays meeting specific conditions in O(n) time."
      },
      {
        id: "q4",
        question: "What is the space complexity of reversing a string in-place?",
        options: ["O(n)", "O(1)", "O(log n)", "O(n²)"],
        correctIndex: 1,
        explanation: "In-place reversal only uses a constant amount of extra space regardless of input size."
      },
      {
        id: "q5",
        question: "Which data structure is best for checking if an element exists in O(1) average time?",
        options: ["Array", "Linked List", "Hash Set", "Binary Search Tree"],
        correctIndex: 2,
        explanation: "Hash sets provide O(1) average case lookup time using hash functions."
      }
    ]
  },
  {
    id: "dsa-trees",
    title: "Trees & Graphs Deep Dive",
    topic: "Data Structures",
    difficulty: "medium",
    duration_minutes: 15,
    description: "Master tree traversals, graph algorithms, and hierarchical data structures.",
    questions: [
      {
        id: "q1",
        question: "What is the time complexity of searching in a balanced BST?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
        correctIndex: 2,
        explanation: "Balanced BST halves the search space each step, giving O(log n) complexity."
      },
      {
        id: "q2",
        question: "Which traversal visits nodes in sorted order for a BST?",
        options: ["Pre-order", "In-order", "Post-order", "Level-order"],
        correctIndex: 1,
        explanation: "In-order traversal (left, root, right) visits BST nodes in ascending order."
      },
      {
        id: "q3",
        question: "What algorithm finds the shortest path in an unweighted graph?",
        options: ["DFS", "BFS", "Dijkstra's", "Bellman-Ford"],
        correctIndex: 1,
        explanation: "BFS explores level by level, naturally finding shortest paths in unweighted graphs."
      },
      {
        id: "q4",
        question: "What is the maximum number of nodes at level L of a binary tree?",
        options: ["L", "2L", "2^L", "2^(L+1)"],
        correctIndex: 2,
        explanation: "Each level can have at most 2^L nodes (root is level 0)."
      },
      {
        id: "q5",
        question: "Which algorithm detects cycles in a directed graph?",
        options: ["Kruskal's", "Topological Sort", "DFS with coloring", "Prim's"],
        correctIndex: 2,
        explanation: "DFS with three-color marking (white, gray, black) efficiently detects back edges indicating cycles."
      },
      {
        id: "q6",
        question: "What is the height of an AVL tree with n nodes?",
        options: ["O(n)", "O(log n)", "O(√n)", "O(1)"],
        correctIndex: 1,
        explanation: "AVL trees maintain balance, ensuring height is always O(log n)."
      }
    ]
  },
  {
    id: "dsa-dp",
    title: "Dynamic Programming Patterns",
    topic: "Algorithms",
    difficulty: "hard",
    duration_minutes: 20,
    description: "Challenge yourself with DP concepts, memoization, and optimization techniques.",
    questions: [
      {
        id: "q1",
        question: "What are the two key properties required for dynamic programming?",
        options: ["Sorting and searching", "Optimal substructure and overlapping subproblems", "Divide and conquer", "Greedy choice and local optimum"],
        correctIndex: 1,
        explanation: "DP requires optimal substructure (optimal solution built from subproblems) and overlapping subproblems (same subproblems solved multiple times)."
      },
      {
        id: "q2",
        question: "What is the time complexity of the classic 0/1 Knapsack problem with DP?",
        options: ["O(n)", "O(nW)", "O(2^n)", "O(n²)"],
        correctIndex: 1,
        explanation: "0/1 Knapsack DP uses a 2D table of n items × W capacity, giving O(nW) complexity."
      },
      {
        id: "q3",
        question: "Which DP pattern is used for the Longest Common Subsequence problem?",
        options: ["1D array", "2D table", "Tree recursion", "Graph traversal"],
        correctIndex: 1,
        explanation: "LCS uses a 2D table where dp[i][j] represents the LCS of first i chars of string1 and first j chars of string2."
      },
      {
        id: "q4",
        question: "What is memoization?",
        options: ["Bottom-up DP approach", "Top-down DP with caching", "A sorting technique", "A graph algorithm"],
        correctIndex: 1,
        explanation: "Memoization is top-down DP that caches recursive call results to avoid recomputation."
      },
      {
        id: "q5",
        question: "What is the space-optimized complexity for the Fibonacci sequence using DP?",
        options: ["O(n)", "O(1)", "O(log n)", "O(n²)"],
        correctIndex: 1,
        explanation: "Fibonacci only needs the previous two values, so O(1) space suffices."
      },
      {
        id: "q6",
        question: "Which problem is solved using the Kadane's algorithm?",
        options: ["Longest Increasing Subsequence", "Maximum Subarray Sum", "Edit Distance", "Coin Change"],
        correctIndex: 1,
        explanation: "Kadane's algorithm finds maximum subarray sum in O(n) time using DP principles."
      },
      {
        id: "q7",
        question: "What is the recurrence relation for the Coin Change (minimum coins) problem?",
        options: ["dp[i] = dp[i-1] + dp[i-2]", "dp[i] = min(dp[i], dp[i-coin] + 1)", "dp[i][j] = dp[i-1][j-1]", "dp[i] = max(dp[i-1], dp[i-2] + arr[i])"],
        correctIndex: 1,
        explanation: "For each amount i, we try each coin and take minimum of current and (subproblem + 1 coin)."
      }
    ]
  },
  // System Design
  {
    id: "system-design-basics",
    title: "System Design Fundamentals",
    topic: "System Design",
    difficulty: "medium",
    duration_minutes: 15,
    description: "Learn scalability, load balancing, caching, and distributed systems concepts.",
    questions: [
      {
        id: "q1",
        question: "What is horizontal scaling?",
        options: ["Adding more RAM to a server", "Adding more servers to handle load", "Upgrading CPU", "Using faster storage"],
        correctIndex: 1,
        explanation: "Horizontal scaling adds more machines to distribute load, while vertical scaling upgrades a single machine."
      },
      {
        id: "q2",
        question: "What is the CAP theorem about?",
        options: ["CPU, Architecture, Performance", "Consistency, Availability, Partition tolerance trade-offs", "Cache, API, Protocol design", "Compression, Authentication, Persistence"],
        correctIndex: 1,
        explanation: "CAP theorem states distributed systems can only guarantee 2 of 3: Consistency, Availability, Partition tolerance."
      },
      {
        id: "q3",
        question: "What is the primary purpose of a CDN?",
        options: ["Database replication", "Serving static content from edge locations", "Load balancing", "Data encryption"],
        correctIndex: 1,
        explanation: "CDNs cache and serve static content from geographically distributed edge servers to reduce latency."
      },
      {
        id: "q4",
        question: "Which caching strategy writes to cache and database simultaneously?",
        options: ["Write-through", "Write-back", "Write-around", "Cache-aside"],
        correctIndex: 0,
        explanation: "Write-through updates both cache and database at the same time, ensuring consistency."
      },
      {
        id: "q5",
        question: "What is sharding?",
        options: ["Encrypting data", "Splitting data across multiple databases", "Compressing data", "Replicating data"],
        correctIndex: 1,
        explanation: "Sharding horizontally partitions data across multiple database instances based on a shard key."
      },
      {
        id: "q6",
        question: "What load balancing algorithm distributes requests evenly in sequence?",
        options: ["Random", "Least connections", "Round-robin", "IP hash"],
        correctIndex: 2,
        explanation: "Round-robin distributes requests sequentially across servers in a circular order."
      }
    ]
  },
  {
    id: "system-design-advanced",
    title: "Designing Scalable Systems",
    topic: "System Design",
    difficulty: "hard",
    duration_minutes: 20,
    description: "Advanced concepts: message queues, microservices, database design patterns.",
    questions: [
      {
        id: "q1",
        question: "What is the main benefit of message queues in distributed systems?",
        options: ["Faster database queries", "Decoupling services and async processing", "Better UI performance", "Reduced memory usage"],
        correctIndex: 1,
        explanation: "Message queues decouple producers from consumers, enabling async processing and better fault tolerance."
      },
      {
        id: "q2",
        question: "What is eventual consistency?",
        options: ["Data is always consistent", "All nodes see same data immediately", "Data will become consistent over time", "Data is never consistent"],
        correctIndex: 2,
        explanation: "Eventual consistency means replicas will converge to the same state given enough time without new updates."
      },
      {
        id: "q3",
        question: "What is a circuit breaker pattern used for?",
        options: ["Encrypting data", "Preventing cascading failures", "Load balancing", "Data validation"],
        correctIndex: 1,
        explanation: "Circuit breaker prevents cascading failures by failing fast when a service is unhealthy."
      },
      {
        id: "q4",
        question: "What is the purpose of an API Gateway?",
        options: ["Store data", "Single entry point for routing, auth, rate limiting", "Run background jobs", "Monitor servers"],
        correctIndex: 1,
        explanation: "API Gateway provides a unified entry point handling cross-cutting concerns like auth, routing, and rate limiting."
      },
      {
        id: "q5",
        question: "What is database replication primarily used for?",
        options: ["Reducing storage costs", "High availability and read scaling", "Data encryption", "Schema migration"],
        correctIndex: 1,
        explanation: "Replication maintains copies of data for fault tolerance and distributing read load."
      }
    ]
  },
  // Behavioral / Leadership
  {
    id: "behavioral-amazon",
    title: "Amazon Leadership Principles",
    topic: "Behavioral",
    difficulty: "medium",
    duration_minutes: 12,
    description: "Test your knowledge of Amazon's 16 Leadership Principles and how to apply them.",
    questions: [
      {
        id: "q1",
        question: "Which Amazon LP emphasizes starting with customer needs?",
        options: ["Bias for Action", "Customer Obsession", "Ownership", "Invent and Simplify"],
        correctIndex: 1,
        explanation: "Customer Obsession: Leaders start with the customer and work backwards."
      },
      {
        id: "q2",
        question: "What does 'Disagree and Commit' mean?",
        options: ["Always agree with your manager", "Voice disagreement but commit once decision is made", "Never compromise", "Avoid conflict"],
        correctIndex: 1,
        explanation: "Leaders can respectfully challenge decisions but once made, commit wholly."
      },
      {
        id: "q3",
        question: "Which LP is about taking long-term ownership?",
        options: ["Bias for Action", "Ownership", "Deliver Results", "Think Big"],
        correctIndex: 1,
        explanation: "Ownership: Leaders act on behalf of the entire company, never saying 'that's not my job.'"
      },
      {
        id: "q4",
        question: "What does 'Earn Trust' emphasize?",
        options: ["Always being right", "Listening, speaking candidly, treating others respectfully", "Working alone", "Avoiding criticism"],
        correctIndex: 1,
        explanation: "Leaders listen attentively, speak candidly, and are vocally self-critical."
      },
      {
        id: "q5",
        question: "Which LP encourages taking calculated risks?",
        options: ["Frugality", "Bias for Action", "Are Right, A Lot", "Learn and Be Curious"],
        correctIndex: 1,
        explanation: "Bias for Action: Speed matters in business. Many decisions are reversible."
      }
    ]
  },
  // CS Fundamentals
  {
    id: "cs-os",
    title: "Operating Systems Essentials",
    topic: "CS Fundamentals",
    difficulty: "medium",
    duration_minutes: 15,
    description: "Processes, threads, memory management, and concurrency concepts.",
    questions: [
      {
        id: "q1",
        question: "What is the difference between a process and a thread?",
        options: ["No difference", "Threads share memory, processes have separate address spaces", "Processes are faster", "Threads can't communicate"],
        correctIndex: 1,
        explanation: "Threads within a process share memory and resources, while processes have isolated address spaces."
      },
      {
        id: "q2",
        question: "What is a deadlock?",
        options: ["A fast process", "Circular wait where processes can't proceed", "A memory leak", "A cache miss"],
        correctIndex: 1,
        explanation: "Deadlock occurs when processes wait circularly for resources held by each other."
      },
      {
        id: "q3",
        question: "What is virtual memory?",
        options: ["RAM only", "Abstraction allowing disk as extended memory", "CPU cache", "Network storage"],
        correctIndex: 1,
        explanation: "Virtual memory uses disk space to extend available memory, providing memory isolation and protection."
      },
      {
        id: "q4",
        question: "What is a mutex used for?",
        options: ["Faster computation", "Mutual exclusion in concurrent access", "Memory allocation", "Network communication"],
        correctIndex: 1,
        explanation: "Mutex ensures only one thread can access a critical section at a time."
      },
      {
        id: "q5",
        question: "What causes a context switch?",
        options: ["Keyboard input", "Timer interrupt, I/O, or higher priority process", "Compiling code", "Installing software"],
        correctIndex: 1,
        explanation: "Context switches occur on interrupts, I/O waits, or when scheduler preempts for higher priority tasks."
      }
    ]
  },
  {
    id: "cs-networking",
    title: "Networking & Protocols",
    topic: "CS Fundamentals",
    difficulty: "medium",
    duration_minutes: 12,
    description: "TCP/IP, HTTP, DNS, and web protocols every engineer should know.",
    questions: [
      {
        id: "q1",
        question: "What is the main difference between TCP and UDP?",
        options: ["TCP is faster", "TCP guarantees delivery, UDP doesn't", "UDP is more secure", "No difference"],
        correctIndex: 1,
        explanation: "TCP provides reliable, ordered delivery with acknowledgments; UDP is faster but unreliable."
      },
      {
        id: "q2",
        question: "What does DNS primarily do?",
        options: ["Encrypt data", "Translate domain names to IP addresses", "Route packets", "Compress files"],
        correctIndex: 1,
        explanation: "DNS resolves human-readable domain names to machine IP addresses."
      },
      {
        id: "q3",
        question: "What HTTP status code indicates 'Not Found'?",
        options: ["200", "301", "404", "500"],
        correctIndex: 2,
        explanation: "404 indicates the requested resource was not found on the server."
      },
      {
        id: "q4",
        question: "What is the purpose of the TCP three-way handshake?",
        options: ["Encrypt data", "Establish a reliable connection", "Compress packets", "Route traffic"],
        correctIndex: 1,
        explanation: "SYN, SYN-ACK, ACK establishes a reliable bidirectional connection with sequence numbers."
      },
      {
        id: "q5",
        question: "What layer does HTTP operate on in the OSI model?",
        options: ["Network", "Transport", "Application", "Data Link"],
        correctIndex: 2,
        explanation: "HTTP is an application layer protocol built on top of TCP."
      }
    ]
  },
  // Language Specific
  {
    id: "js-fundamentals",
    title: "JavaScript Deep Dive",
    topic: "Languages",
    difficulty: "medium",
    duration_minutes: 12,
    description: "Closures, promises, event loop, and JS quirks every developer should master.",
    questions: [
      {
        id: "q1",
        question: "What is a closure in JavaScript?",
        options: ["A way to close the browser", "Function with access to outer scope variables", "A loop construct", "An error handler"],
        correctIndex: 1,
        explanation: "Closures allow inner functions to access outer function's scope even after outer function returns."
      },
      {
        id: "q2",
        question: "What is the event loop responsible for?",
        options: ["Rendering UI", "Managing async callbacks and execution order", "Memory allocation", "Network requests"],
        correctIndex: 1,
        explanation: "Event loop manages the call stack and callback queue, enabling async non-blocking execution."
      },
      {
        id: "q3",
        question: "What does 'use strict' do?",
        options: ["Makes code faster", "Enables stricter parsing and error handling", "Compresses code", "Adds types"],
        correctIndex: 1,
        explanation: "'use strict' catches common mistakes and prevents use of certain problematic features."
      },
      {
        id: "q4",
        question: "What is the difference between == and ===?",
        options: ["No difference", "=== checks type and value, == coerces types", "== is faster", "=== is deprecated"],
        correctIndex: 1,
        explanation: "=== (strict equality) compares without type coercion; == converts types before comparing."
      },
      {
        id: "q5",
        question: "What is Promise.all() used for?",
        options: ["Cancel promises", "Wait for all promises to resolve", "Create a single promise", "Handle errors"],
        correctIndex: 1,
        explanation: "Promise.all() waits for all promises to resolve (or any to reject) before continuing."
      }
    ]
  },
  {
    id: "python-fundamentals",
    title: "Python Proficiency",
    topic: "Languages",
    difficulty: "easy",
    duration_minutes: 10,
    description: "Python-specific concepts: generators, decorators, GIL, and Pythonic patterns.",
    questions: [
      {
        id: "q1",
        question: "What is a Python generator?",
        options: ["A class that generates classes", "A function that yields values lazily", "A random number creator", "A loop construct"],
        correctIndex: 1,
        explanation: "Generators use 'yield' to produce values one at a time, saving memory for large sequences."
      },
      {
        id: "q2",
        question: "What is the GIL in Python?",
        options: ["Global Import Lock", "Global Interpreter Lock limiting thread execution", "Graphics Interface Library", "General Input Layer"],
        correctIndex: 1,
        explanation: "GIL allows only one thread to execute Python bytecode at a time, affecting CPU-bound multithreading."
      },
      {
        id: "q3",
        question: "What does a decorator do?",
        options: ["Adds colors to output", "Wraps a function to extend its behavior", "Deletes functions", "Creates classes"],
        correctIndex: 1,
        explanation: "Decorators are functions that modify or extend other functions without changing their source code."
      },
      {
        id: "q4",
        question: "What is a list comprehension?",
        options: ["A way to understand lists", "Concise syntax for creating lists", "A sorting algorithm", "A debugging tool"],
        correctIndex: 1,
        explanation: "List comprehensions provide a concise way to create lists: [x*2 for x in range(10)]."
      },
      {
        id: "q5",
        question: "What is the difference between a list and a tuple?",
        options: ["No difference", "Lists are mutable, tuples are immutable", "Tuples are faster for iteration", "Lists can only hold numbers"],
        correctIndex: 1,
        explanation: "Lists can be modified after creation; tuples are fixed and hashable."
      }
    ]
  },
  // SQL & Databases
  {
    id: "sql-mastery",
    title: "SQL & Database Mastery",
    topic: "Databases",
    difficulty: "medium",
    duration_minutes: 12,
    description: "JOINs, indexing, transactions, and query optimization techniques.",
    questions: [
      {
        id: "q1",
        question: "What is the difference between INNER JOIN and LEFT JOIN?",
        options: ["No difference", "LEFT JOIN includes all rows from left table", "INNER JOIN is faster", "LEFT JOIN excludes nulls"],
        correctIndex: 1,
        explanation: "LEFT JOIN returns all rows from left table plus matching rows from right; INNER JOIN only matching rows."
      },
      {
        id: "q2",
        question: "What is an index used for in databases?",
        options: ["Sorting data alphabetically", "Speeding up data retrieval", "Compressing data", "Encrypting data"],
        correctIndex: 1,
        explanation: "Indexes create data structures (like B-trees) that speed up lookups at the cost of write performance."
      },
      {
        id: "q3",
        question: "What does ACID stand for in databases?",
        options: ["Add, Create, Insert, Delete", "Atomicity, Consistency, Isolation, Durability", "Automatic, Cached, Indexed, Distributed", "None of these"],
        correctIndex: 1,
        explanation: "ACID properties ensure reliable transaction processing in databases."
      },
      {
        id: "q4",
        question: "What is database normalization?",
        options: ["Making all data lowercase", "Organizing data to reduce redundancy", "Speeding up queries", "Adding more indexes"],
        correctIndex: 1,
        explanation: "Normalization structures data into related tables to minimize redundancy and dependency."
      },
      {
        id: "q5",
        question: "What is a primary key?",
        options: ["The first column", "A unique identifier for each row", "The most important data", "An encryption key"],
        correctIndex: 1,
        explanation: "Primary key uniquely identifies each record in a table and cannot be null."
      }
    ]
  }
];

export const QUIZ_TOPICS = [
  { id: "all", label: "All Topics" },
  { id: "Data Structures", label: "Data Structures" },
  { id: "Algorithms", label: "Algorithms" },
  { id: "System Design", label: "System Design" },
  { id: "Behavioral", label: "Behavioral" },
  { id: "CS Fundamentals", label: "CS Fundamentals" },
  { id: "Languages", label: "Languages" },
  { id: "Databases", label: "Databases" },
];
