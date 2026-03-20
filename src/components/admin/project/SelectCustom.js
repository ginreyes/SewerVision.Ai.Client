import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const SelectCustom = ({
  value,
  onChange,
  options,
  className = "",
  disabled = false,
  placeholder = "Select...",
}) => {
  return (
    <Select
      value={value}
      onValueChange={(val) => {
        // Mimic native select event shape for backwards compatibility
        const syntheticEvent = { target: { value: val } };
        onChange(syntheticEvent);
      }}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectCustom;
