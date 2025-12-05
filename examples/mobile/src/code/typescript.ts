export const typescriptCode = `/**
 * Advanced React component with hooks, Context API, and TypeScript
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { debounce, throttle } from 'lodash';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

interface DataTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: any, item: T) => React.ReactNode;
  }>;
  onRowClick?: (item: T) => void;
  pageSize?: number;
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  onRowClick,
  pageSize = 10,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLTableElement>(null);

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Filter
    if (searchTerm) {
      result = result.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        const modifier = sortDirection === 'asc' ? 1 : -1;

        if (aVal < bVal) return -1 * modifier;
        if (aVal > bVal) return 1 * modifier;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
    }, 300),
    []
  );

  // Handle sort
  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log('Table is visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (tableRef.current) {
      observer.observe(tableRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="data-table">
      <input
        type="text"
        placeholder="Search..."
        onChange={(e) => debouncedSearch(e.target.value)}
        className="search-input"
      />

      <table ref={tableRef}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                onClick={() => col.sortable && handleSort(col.key)}
                className={col.sortable ? 'sortable' : ''}
              >
                {col.label}
                {sortColumn === col.key && (
                  <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className="table-row"
            >
              {columns.map((col) => (
                <td key={String(col.key)}>
                  {col.render ? col.render(item[col.key], item) : String(item[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Async data fetching
export async function fetchUsers(): Promise<User[]> {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Promise chain example
Promise.resolve(42)
  .then((x) => x * 2)
  .then((x) => x + 10)
  .catch((err) => console.error(err))
  .finally(() => console.log('Done'));

// Generator function
function* fibonacci() {
  let [prev, curr] = [0, 1];
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

// Class with decorators (TypeScript)
class UserService {
  private users: User[] = [];

  @log
  @cache(1000)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }

  @validate
  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const newUser = { ...user, id: Date.now() };
    this.users.push(newUser);
    return newUser;
  }
}

// Decorator functions
function log(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(\`Calling \${key} with\`, args);
    return original.apply(this, args);
  };
}

function cache(ttl: number) {
  const cache = new Map();
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const cacheKey = JSON.stringify(args);
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }
      const result = await original.apply(this, args);
      cache.set(cacheKey, result);
      setTimeout(() => cache.delete(cacheKey), ttl);
      return result;
    };
  };
}

function validate(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    // Validation logic here
    return original.apply(this, args);
  };
}
`;
