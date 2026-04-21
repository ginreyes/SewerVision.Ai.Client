import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { CALENDAR_FILTER_COLORS } from '@/lib/statusConfig';

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

  const colorClasses = CALENDAR_FILTER_COLORS;

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
