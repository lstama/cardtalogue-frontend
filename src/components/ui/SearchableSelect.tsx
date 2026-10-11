import { Dropdown } from './Dropdown'

// SearchableSelect is the shared dropdown plus a search input: the page owns the
// search term (onSearchQueryChange) so the query can also feed the API.
export const SearchableSelect = ({
  label,
  value,
  options,
  onChange,
  onSearchQueryChange,
}: {
  label: string
  value: number
  options: { id: number; name: string }[]
  onChange: (id: number) => void
  onSearchQueryChange: (query: string) => void
}) => Dropdown({
  label,
  value,
  options,
  onChange,
  onSearch: onSearchQueryChange,
})
