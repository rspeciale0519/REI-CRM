import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import Card from '@/components/ui/Card';

interface SearchResult {
  id: string;
  type: 'property' | 'contact' | 'deal' | 'task';
  title: string;
  subtitle?: string;
  link: string;
}

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call to backend search endpoint
        // This is a mock implementation
        const mockResults: SearchResult[] = [
          {
            id: '1',
            type: 'property',
            title: '123 Main St',
            subtitle: 'Single Family Home - Active',
            link: '/properties/1'
          },
          {
            id: '2',
            type: 'contact',
            title: 'John Smith',
            subtitle: 'Buyer - Active',
            link: '/contacts/2'
          },
          // Add more mock results as needed
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setResults(mockResults);
      } catch (error) {
        console.error('Search failed:', error);
        // Handle error appropriately
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      performSearch();
    }
  }, [query]);

  const getTypeIcon = (type: string) => {
    // You can import and use different icons based on the type
    return <SearchIcon size={18} />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Search Results</h1>
        <p className="mt-1 text-sm text-gray-500">
          {query ? `Showing results for "${query}"` : 'Enter a search term to begin'}
        </p>
      </div>

      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </Card>
      ) : results.length > 0 ? (
        <Card>
          <ul className="divide-y divide-gray-200">
            {results.map((result) => (
              <li key={`${result.type}-${result.id}`} className="py-4">
                <a href={result.link} className="flex items-start space-x-4 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {result.title}
                    </p>
                    {result.subtitle && (
                      <p className="text-sm text-gray-500 truncate">
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </Card>
      ) : query ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">No results found for "{query}"</p>
          </div>
        </Card>
      ) : null}
    </div>
  );
};

export default Search; 