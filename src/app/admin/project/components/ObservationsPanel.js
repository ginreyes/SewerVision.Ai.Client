"use client";

import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Eye,
  Edit3,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import ObservationFilterPopover from "./ObservationFilter";
import ObservationAction from "./ObservationAction";
import { useRouter } from "next/navigation";

const ObservationsPanel = (props) => {
  const { observations = [], onAddObservation, pacpCodes , projectId } = props;

  const project_id = projectId

  //states
  const [isExpanded, setIsExpanded] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="font-medium">OBSERVATIONS</span>
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <Button
            onClick={onAddObservation}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center space-x-1 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Observation</span>
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {/* Search + Filter */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search observations..."
                className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="relative">
                  <button
                    onClick={() => setShowFilter(!showFilter)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded flex items-center space-x-1"
                  >
                    <Filter className="h-3 w-3" />
                    <span>Filter</span>
                  </button>

                  {showFilter && (
                    <ObservationFilterPopover
                      pacpCodes={pacpCodes}
                      onClose={() => setShowFilter(!showFilter)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {showActions && (
                <ObservationAction
                  onClose={() => setShowActions(false)}
                  onExport={() => console.log("Export")}
                  onCopy={() => console.log("Copy")}
                  onShare={() => console.log("Share")}
                  onSettings={() => console.log("Settings")}
                />
              )}
            </div>
          </div>

          {/* Observations Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {[
                    "#",
                    "Distance",
                    "PACP Code",
                    "Observation",
                    "Time",
                    "Remarks",
                    "Snapshot",
                    "Actions",
                  ].map((head) => (
                    <th
                      key={head}
                      className="text-left py-3 px-4 text-sm font-medium text-gray-700"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {observations.map((obs, index) => (
                  <tr
                    key={obs._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm">{obs._id}</td>
                    <td className="py-3 px-4 text-sm">{obs.distance}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {obs.pacpCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{obs.observation}</td>
                    <td className="py-3 px-4 text-sm">{obs.time}</td>
                    <td className="py-3 px-4 text-sm">{obs.remarks}</td>
                    <td className="py-3 px-4 text-sm">
                      {obs.snapshot ? (
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <PlayCircle className="h-4 w-4 text-blue-600" />
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          No snapshot
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                          </button>
                        </PopoverTrigger>

                        <PopoverContent className="w-40 p-2 space-y-1">
                          <DropdownItem
                            icon={<Eye />}
                            label="View Details"
                            onClick={() =>
                              router.push(
                                `/admin/project/observationpages/${obs._id}?projectId=${project_id}`
                              )
                            }
                          />

                          <DropdownItem icon={<Edit3 />} label="Edit" />
                          <DropdownItem
                            icon={<PlayCircle />}
                            label="Go to Time"
                          />
                          <hr className="my-1" />
                          
                        </PopoverContent>
                      </Popover>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ icon, label, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 ${className}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default ObservationsPanel;
