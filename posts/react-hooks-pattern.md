---
title: "Custom React Hook for API Calls - A Reusable Pattern"
date: "2025-08-09"
description: "A reusable React hook pattern I use for all my API calls. Handles loading, error states, and caching automatically with TypeScript support."
---

# Custom React Hook for API Calls

One pattern I keep using across all my React projects is a custom hook for handling API calls. It eliminates so much boilerplate and makes components much cleaner.

## The Problem

Every API call in React needs the same things:
- Loading state management
- Error handling  
- Success/data state
- Often some form of caching or re-fetching

Writing this over and over gets old fast, and it's easy to forget edge cases.

## My Solution

Here's the custom hook I've been using:

```typescript
import { useState, useEffect } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  deps?: any[];
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const { initialData = null, deps = [] } = options;
  
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, deps);

  return { data, loading, error, refetch: fetchData };
}
```

## Real-World Usage Examples

**Basic user profile compone