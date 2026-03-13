import { memo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

const InputField = memo(
  ({
    label,
    name,
    value,
    onChange,
    required = false,
    type = "text",
    error,
    placeholder,
    disabled = false,
  }) => {
    const handleChange = useCallback(
      (e) => {
        onChange(name, e.target.value);
      },
      [name, onChange]
    );

    return (
      <div className="space-y-2">
        <Label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          id={name}
          name={name}
          value={value || ""}
          onChange={handleChange}
          required={required}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`h-10 transition-all duration-200 ${
            disabled ? "bg-gray-50 cursor-not-allowed" : ""
          } ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
              : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
          }`}
        />
        {error && (
          <span className="text-red-500 text-sm flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {error}
          </span>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
