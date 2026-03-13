import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export default function EventFilters({ filters, setFilters }) {


  const handleFilterChange = (filterName) => {
    if (filterName === "viewAll") {
      const newValue = !filters.viewAll;
      setFilters({
        viewAll: newValue,
        personal: newValue,
        business: newValue,
        family: newValue,
        holiday: newValue,
        etc: newValue,
      });
    } else {
      const updatedFilters = {
        ...filters,
        [filterName]: !filters[filterName],
      };

      const allChecked =
        updatedFilters.personal &&
        updatedFilters.business &&
        updatedFilters.family &&
        updatedFilters.holiday &&
        updatedFilters.etc;

      setFilters({
        ...updatedFilters,
        viewAll: allChecked,
      });
    }
  };

  // Tailwind-safe static color classes with data attribute selector
  const colorClasses = {
    viewAll: "data-[state=checked]:bg-[#8491A2] data-[state=checked]:border-[#8491A2]",
    personal: "data-[state=checked]:bg-[#FF3D1C] data-[state=checked]:border-[#FF3D1C]",
    business: "data-[state=checked]:bg-[#696CFF] data-[state=checked]:border-[#696CFF]",
    family: "data-[state=checked]:bg-[#FFAB00] data-[state=checked]:border-[#FFAB00]",
    holiday: "data-[state=checked]:bg-[#71DD37] data-[state=checked]:border-[#71DD37]",
    etc: "data-[state=checked]:bg-[#03C3EC] data-[state=checked]:border-[#03C3EC]",
  };

  const filterOptions = [
    { id: "viewAll", label: "View All" },
    { id: "personal", label: "Personal" },
    { id: "business", label: "Business" },
    { id: "family", label: "Family" },
    { id: "holiday", label: "Holiday" },
    { id: "etc", label: "ETC" },
  ];

  return (
    <div className="space-y-3">
      <p className="text-lg font-semibold text-gray-800">Event Filters</p>

      <div className="space-y-3">
        {filterOptions.map(({ id, label }) => (
          <div key={id} className="flex items-center space-x-2">
            <Checkbox
              id={id}
              checked={filters[id]}
              onCheckedChange={() => handleFilterChange(id)}
              className={`${colorClasses[id]} border`}
            />
            <label htmlFor={id} className="text-sm font-medium text-gray-700 cursor-pointer">
              {label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
