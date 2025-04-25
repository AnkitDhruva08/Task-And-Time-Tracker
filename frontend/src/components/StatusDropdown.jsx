import Select from 'react-select';

const statusOptions = [
  { value: '', label: 'All Status', color: '#555' },
  { value: 'pending', label: 'Pending', color: '#facc15' }, // yellow
  { value: 'approved', label: 'Approved', color: '#22c55e' }, // green
  { value: 'rejected', label: 'Rejected', color: '#ef4444' }, // red
];

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    color: state.data.color,
    fontWeight: state.isSelected ? 'bold' : 'normal',
    backgroundColor: state.isFocused ? '#f1f5f9' : 'white',
    padding: 10,
  }),
  singleValue: (provided, state) => ({
    ...provided,
    color: state.data.color,
  }),
};

export default function StatusDropdown({ filter, setFilter }) {
  const handleChange = (selected) => {
    setFilter({ ...filter, status: selected.value });
  };

  const selectedOption = statusOptions.find(opt => opt.value === filter.status);

  return (
    <div className="w-60">
      <Select
        options={statusOptions}
        value={selectedOption}
        onChange={handleChange}
        styles={customStyles}
        isSearchable={false}
      />
    </div>
  );
}
