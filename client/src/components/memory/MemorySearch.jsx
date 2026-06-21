/**
 * MemorySearch — search input + results for the memory sidebar
 * Props: query, onChange, results, isSearching, onClear
 */
export default function MemorySearch({ query, onChange, onClear }) {
  return (
    <div>
      <input value={query} onChange={onChange} placeholder="Search memories…" />
      {query && <button onClick={onClear}>✕</button>}
    </div>
  );
}
