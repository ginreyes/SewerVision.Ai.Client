import { Edit3, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

const EditableSection = ({
  title,
  children,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  saving = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button variant="ghost" onClick={onEdit}>
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={onCancel}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button variant="success" onClick={onSave} disabled={saving}>
                <Save className="h-3 w-3 mr-1" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

export default EditableSection;
