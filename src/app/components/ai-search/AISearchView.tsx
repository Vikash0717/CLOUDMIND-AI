import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Sparkles, FileText, Image, Video, Clock, Tag } from 'lucide-react';
import api from '../../../lib/api';

interface SearchResult {
  id: string;
  name: string;
  type: string;
  path: string;
  size: string;
  relevance: number;
  snippet: string;
  lastModified: string;
  tags: string[];
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    name: 'Q4 Financial Report.pdf',
    type: 'PDF Document',
    path: '/Documents/Finance/',
    size: '2.4 MB',
    relevance: 95,
    snippet: 'Contains quarterly revenue analysis, expense breakdown, and profit margins for Q4 2024...',
    lastModified: '2024-03-10',
    tags: ['Finance', 'Reports', 'Q4'],
  },
  {
    id: '2',
    name: 'Budget Planning.xlsx',
    type: 'Excel Spreadsheet',
    path: '/Documents/Finance/',
    size: '1.2 MB',
    relevance: 88,
    snippet: 'Annual budget allocation across departments with financial projections...',
    lastModified: '2024-03-08',
    tags: ['Finance', 'Budget', 'Planning'],
  },
  {
    id: '3',
    name: 'Invoice_2024_March.pdf',
    type: 'PDF Document',
    path: '/Documents/Finance/Invoices/',
    size: '156 KB',
    relevance: 82,
    snippet: 'Monthly invoices for services rendered in March 2024...',
    lastModified: '2024-03-14',
    tags: ['Finance', 'Invoice'],
  },
];

export function AISearchView() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.post('/ai/search', { query });
      setResults(res.data.results || []);
    } catch (err) {
      console.error("Search failed", err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const exampleQueries = [
    'Find all financial documents from last quarter',
    'Show me images from the marketing campaign',
    'Documents shared with John in the last week',
    'Large video files taking up storage space',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Search</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Search your files using natural language queries
        </p>
      </div>

      <Card className="border-0 shadow-lg dark:bg-gray-800">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Smart Semantic Search
            </h2>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search files using natural language... (e.g., 'Show me all presentations from last month')"
              className="pl-12 pr-4 py-6 text-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isSearching ? 'Searching...' : 'Search with AI'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              className="dark:border-gray-600"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length === 0 && !isSearching && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Try these example queries:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exampleQueries.map((example, index) => (
              <Card
                key={index}
                className="border-0 shadow-md dark:bg-gray-800 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setQuery(example)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{example}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Found {results.length} results
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Sparkles className="w-4 h-4" />
              AI-powered relevance sorting
            </div>
          </div>

          <div className="space-y-3">
            {results.map((result) => (
              <Card
                key={result.id}
                className="border-0 shadow-md dark:bg-gray-800 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {result.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded">
                            {result.relevance}% match
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {result.snippet}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {result.type}
                        </span>
                        <span>{result.size}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(result.lastModified).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          {result.path}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        {result.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded flex items-center gap-1"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
