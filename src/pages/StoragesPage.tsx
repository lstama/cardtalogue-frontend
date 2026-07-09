import React, { useState } from 'react';
import { SearchLayout } from '../components/layout/Search';
import { StorageCard } from '../components/items/StorageCard';
import { useStorages } from '../hooks/useStorages';

/**
 * Page component for browsing Kard Storages.
 */
const StoragesPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState<number>(20);
  const [offset, setOffset] = useState<number>(0);

  // Fetch storages based on search query and pagination
  const { data, isLoading, error, refetch } = useStorages(limit, offset, query);

  const handleSearch = () => {
    setOffset(0);
    refetch();
  };

  return (
    <SearchLayout
      title="Kard Storages"
      description="Card Storages location information"
      useSearch={(q, l, o) => {
        setQuery(q);
        setLimit(l);
        setOffset(o);
        return useStorages(l, o, q);
      }}
      renderItem={(storage) => <StorageCard key={storage.id} storage={storage} />}
      noResultsText="No storage found"
    />
  );
};

export default StoragesPage;
