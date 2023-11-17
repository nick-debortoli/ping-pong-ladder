import { ChangeEvent, useState } from "react";
import "./DropdownSelect.scss";

interface DropdownSelectProps {
  dropdownOptions: { value: string; label: string }[];
  id: string;
  label?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  dropdownOptions,
  label,
  id,
  onChange,
}) => {
  const [selectedValue, setSelectedValue] = useState(dropdownOptions[0].value);

  const handleChange = (e) => {
    setSelectedValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="select-container">
      {label && (
        <label className="dropdown-label" htmlFor={`${id}-dropdown`}>
          {label}
        </label>
      )}
      <select
        id={`${id}-dropdown`}
        value={selectedValue}
        onChange={handleChange}
        className="dropdown-select"
      >
        {dropdownOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownSelect;
