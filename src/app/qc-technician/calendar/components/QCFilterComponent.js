import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export default function QCEventFilters({ filters, setFilters }) {
  const handleFilterChange = (filterName) => {
    if (filterName === "viewAll") {
      const newValue = !filters.viewAll;
      setFilters({
        viewAll: newValue,
        qcReviews: newValue,
        deadlines: newValue,
        meetings: newValue,
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
        updatedFilters.qcReviews &&
        updatedFilters.deadlines &&
        updatedFilters.meetings &&
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

  const colorClasses = {
    viewAll: "data-[state=checked]:bg-[#8491A2] data-[state=checked]:border-[#8491A2]",
    qcReviews: "data-[state=checked]:bg-[#2D99FF] data-[state=checked]:border-[#2D99FF]",
    deadlines: "data-[state=checked]:bg-[#FF3D1C] data-[state=checked]:border-[#FF3D1C]",
    meetings: "data-[state=checked]:bg-[#696CFF] data-[state=checked]:border-[#696CFF]",
    personal: "data-[state=checked]:bg-[#FFAB00] data-[state=checked]:border-[#FFAB00]",
    business: "data-[state=checked]:bg-[#03C3EC] data-[state=checked]:border-[#03C3EC]",
    family: "data-[state=checked]:bg-[#71DD37] data-[state=checked]:border-[#71DD37]",
    holiday: "data-[state=checked]:bg-[#F59E0B] data-[state=checked]:border-[#F59E0B]",
    etc: "data-[state=checked]:bg-[#8B5CF6] data-[state=checked]:border-[#8B5CF6]",
  };

  const filterOptions = [
    { id: "viewAll", label: "View All" },
    { id: "qcReviews", label: "QC Reviews" },
    { id: "deadlines", label: "Deadlines" },
    { id: "meetings", label: "Meetings" },
    { id: "personal", label: "Personal" },
    { id: "business", label: "Business" },
    { id: "family", label: "Family" },
    { id: "holiday", label: "Holiday" },
    { id: "etc", label: "Other" },
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
              className={`${colorClasses[id] || ''} border`}
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

