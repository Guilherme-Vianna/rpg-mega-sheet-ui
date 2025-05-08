"use client";
import React, { useEffect, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { debounce } from "lodash";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { api } from "../../services/api";
import { Section } from "@/app/services/types";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function SheetView({ params }) {
  const unwrappedParams = React.use(params);
  const sheetId = unwrappedParams.id;
  const [isMounted, setIsMounted] = React.useState(false);
  const [layoutReady, setLayoutReady] = React.useState(false);
  const [initialLayoutSet, setInitialLayoutSet] = React.useState(false);

  const [sheet, setSheet] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [showFieldForm, setShowFieldForm] = React.useState(false);
  const [editingField, setEditingField] = React.useState(null);
  const [lockLayout, setLockLayout] = React.useState(true);
  const [lockResizeableLayout, setResizeableLayout] = React.useState(true);
  const [layouts, setLayouts] = React.useState({});
  const [activeSection, setActiveSection] = React.useState(0);
  const [sections, setSections] = React.useState<Section[]>([]);
  const [fieldFormData, setFieldFormData] = React.useState({
    name: "",
    color: "",
    type: "",
    section: 0,
    value: "",
    x: 0,
    y: 0,
    w: 6,
    h: 2,
  });

  const debouncedLayoutChange = React.useCallback(
    debounce(async (layout) => {
      try {
        const updates = layout.map((item) => ({
          id: parseInt(item.i),
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        }));

        await Promise.all(
          updates.map((update) =>
            api.updateField(update.id, {
              x: update.x,
              y: update.y,
              w: update.w,
              h: update.h,
            })
          )
        );
      } catch (err) {
        setError("Failed to save layout: " + err.message);
      }
    }, 1000),
    []
  );

  React.useEffect(() => {
    return () => {
      debouncedLayoutChange.cancel();
    };
  }, [debouncedLayoutChange]);

  React.useEffect(() => {
    fetchSheet();
    fetchSections();
  }, [sheetId]);

  useEffect(() => {
    console.log(sections);
  }, [sections]);

  // Initialize layouts from database data - only once
  React.useEffect(() => {
    if (sheet?.Fields && !initialLayoutSet) {
      // Sort fields by their y position to ensure correct vertical ordering
      const sortedFields = [...sheet.Fields].sort((a, b) => {
        // First sort by y position
        if ((a.y ?? 0) !== (b.y ?? 0)) {
          return (a.y ?? 0) - (b.y ?? 0);
        }
        // If y positions are equal, sort by x position
        return (a.x ?? 0) - (b.x ?? 0);
      });

      const initialLayouts = {
        lg: sortedFields.map((field) => ({
          i: field.id.toString(),
          // Use database values with fallbacks
          x: field.x ?? 0,
          y: field.y ?? 0,
          w: field.w ?? 6,
          h: field.h ?? 2,
        })),
      };

      console.log("Setting initial layouts from database:", initialLayouts);
      setLayouts(initialLayouts);
      setInitialLayoutSet(true);
      setLayoutReady(true);
    }
  }, [sheet, initialLayoutSet]);

  // Set isMounted after a delay to ensure all initial layout events have fired
  React.useEffect(() => {
    if (layoutReady) {
      const timer = setTimeout(() => {
        setIsMounted(true);
        console.log(
          "Component fully mounted, layout changes will now update database"
        );
      }, 1000); // Increased timeout to ensure layout is fully rendered

      return () => clearTimeout(timer);
    }
  }, [layoutReady]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const data = await api.getAllSections(sheetId);
      console.log(data);
      setSections(data);
      setError(null);
    } catch (err) {
      setError("Failed to load sections: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSheet = async () => {
    try {
      setLoading(true);
      const data = await api.getSheetById(sheetId);
      setSheet(data);
      setError(null);
    } catch (err) {
      setError("Failed to load sheet: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "section") {
      setFieldFormData({
        ...fieldFormData,
        [name]: value === "" ? 0 : parseInt(value, 10),
      });
    } else {
      setFieldFormData({
        ...fieldFormData,
        [name]: value,
      });
    }
  };

  const resetFieldForm = () => {
    setFieldFormData({
      color: "",
      type: "",
      name: "",
      section: 0,
      value: "",
      x: 0,
      y: 0,
      w: 6,
      h: 2,
    });
    setEditingField(null);
    setShowFieldForm(false);
  };

  const handleAddField = () => {
    resetFieldForm();
    setShowFieldForm(true);
  };

  const handleUpdateFieldValue = async (fieldId, newValue) => {
    try {
      setLoading(true);

      // Find the field in the sheet
      const field = sheet.Fields.find((f) => f.id === fieldId);
      if (!field) {
        setError(`Field with ID ${fieldId} not found`);
        return;
      }

      // Find the layout information
      const layout = layouts.lg.find((l) => l.i === fieldId.toString());
      if (!layout) {
        setError(`Layout for field ID ${fieldId} not found`);
        return;
      }

      console.log(`Updating field ${fieldId} value to: ${newValue}`);

      // Update the field in the database
      await api.updateField(fieldId, {
        color: field.color,
        type: field.type,
        sectionId: field.sectionId,
        name: field.name, // Keep the existing name
        value: newValue, // Update the value
        x: layout.x, // Keep the current layout position
        y: layout.y,
        w: layout.w,
        h: layout.h,
      });

      const updatedFields = sheet.Fields.map((f) =>
        f.id === fieldId ? { ...f, value: newValue } : f
      );

      setSheet({
        ...sheet,
        Fields: updatedFields,
      });

      setError(null);
      console.log(`Field ${fieldId} value updated successfully`);
    } catch (err) {
      setError(`Failed to update field value: ${err.message}`);
      console.error("Error updating field value:", err);
    } finally {
      setLoading(false);
    }
  };

  // const handleEditField = (field) => {
  //   const layout = layouts.lg.find((l) => l.i === field.id.toString());
  //   setFieldFormData({
  //     color: field.color,
  //     type: field.type,
  //     name: field.name,
  //     value: field.value || "",
  //     x: layout?.x || 0,
  //     y: layout?.y || 0,
  //     w: layout?.w || 6,
  //     h: layout?.h || 2,
  //   });
  //   setEditingField(field.id);
  //   setShowFieldForm(true);
  // };

  const handleLayoutChange = (layout, allLayouts) => {
    // Always update the local layout state
    setLayouts({ ...allLayouts, lg: layout });

    // Only trigger database updates if component is fully mounted
    if (isMounted) {
      console.log("Layout change after mounting, updating database");
      debouncedLayoutChange(layout);
    } else {
      console.log("Initial layout setup, skipping database update");
    }
  };

  const handleFieldSubmit = async (e) => {
    e.preventDefault();

    if (!fieldFormData.name) {
      setError("Field name is required");
      return;
    }

    try {
      setLoading(true);

      if (editingField) {
        await api.updateField(editingField, {
          color: fieldFormData.color,
          type: fieldFormData.type,
          sectionId: fieldFormData.section,
          name: fieldFormData.name,
          value: fieldFormData.value,
          x: fieldFormData.x,
          y: fieldFormData.y,
          w: fieldFormData.w,
          h: fieldFormData.h,
        });
      } else {
        await api.createField({
          color: fieldFormData.color,
          type: fieldFormData.type,
          sectionId: fieldFormData.section,
          sheetId: sheet.id,
          name: fieldFormData.name,
          value: fieldFormData.value,
          x: fieldFormData.x,
          y: fieldFormData.y,
          w: fieldFormData.w,
          h: fieldFormData.h,
        });
      }

      // Update the sheet but preserve the current layout
      const currentLayouts = { ...layouts };
      await fetchSheet();
      setLayouts(currentLayouts);

      resetFieldForm();
      setError(null);
    } catch (err) {
      setError(
        `Failed to ${editingField ? "update" : "create"} field: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (!window.confirm("Are you sure you want to delete this field?")) {
      return;
    }

    try {
      setLoading(true);
      await api.deleteField(fieldId);

      // Update the sheet but preserve the current layout for remaining fields
      const currentLayouts = { ...layouts };
      // Remove the deleted field from layouts
      if (currentLayouts.lg) {
        currentLayouts.lg = currentLayouts.lg.filter(
          (item) => item.i !== fieldId.toString()
        );
      }

      await fetchSheet();
      setLayouts(currentLayouts);

      setError(null);
    } catch (err) {
      setError("Failed to delete field: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !sheet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-4xl">↻</div>
      </div>
    );
  }

  if (error && !sheet) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Don't render the grid until layout is ready
  if (!layoutReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-4xl">↻</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Sheet Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{sheet.name}</h1>
              <p className="text-sm text-gray-500">
                Created at: {new Date(sheet.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setResizeableLayout(!lockResizeableLayout)}
                className="bg-orange-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Lock Resize
              </button>
              <button
                onClick={() => setLockLayout(!lockLayout)}
                className="bg-orange-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Lock Layout
              </button>
              <button
                onClick={handleAddField}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add Field
              </button>
              <button
                onClick={() => window.history.back()}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
            <p>{error}</p>
          </div>
        )}

        <div className="flex gap-10 px-10 py-10">
          {sections.map((section) => (
            <div
              style={{
                backgroundImage: "url('../image.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              className="w-full text-center text-2xl p-3 bg-slate-400 hover:bg-slate-600 rounded-md shadow-md hover:scale-105 transition-all"
              onClick={() => setActiveSection(section.id)}
            >
              {section.name}
            </div>
          ))}
        </div>

        {showFieldForm && (
          <div className="bg-gray-50 p-4 m-4 rounded">
            <h3 className="text-lg font-medium mb-4">
              {editingField ? "Edit Field" : "Add New Field"}
            </h3>
            <form onSubmit={handleFieldSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="fieldName">
                  Field Name
                </label>
                <input
                  type="text"
                  id="fieldName"
                  name="name"
                  value={fieldFormData.name}
                  onChange={handleFieldInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter field name"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2" htmlFor="fieldType">
                  Field Type
                </label>
                <select
                  id="fieldType"
                  name="type"
                  value={fieldFormData.type}
                  onChange={handleFieldInputChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select field type</option>
                  <option value="number">Number</option>
                  <option value="text">Text</option>
                  <option value="calculated_field">Calculated Field</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="sectionValue"
                >
                  Section
                </label>

                <select
                  id="sectionValue"
                  name="section"
                  value={fieldFormData.section}
                  onChange={handleFieldInputChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="0">Select a section</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="fieldValue"
                >
                  Field Value
                </label>
                <input
                  type="text"
                  id="fieldValue"
                  name="value"
                  value={fieldFormData.value}
                  onChange={handleFieldInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter field value"
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="fieldColor"
                >
                  Field Color
                </label>
                <input
                  type="color"
                  id="fieldColor"
                  name="color"
                  value={fieldFormData.color || "#000000"}
                  onChange={handleFieldInputChange}
                  className="w-full h-10 px-1 py-1 border rounded"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={resetFieldForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  disabled={loading}
                >
                  {loading ? "Saving..." : editingField ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Grid Layout */}
        <div className="flex flex-col p-5">
          {sheet.Fields.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded">
              <p className="text-gray-600">No fields added yet.</p>
            </div>
          ) : (
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={100}
              compactType="horizontal"
              isDraggable={false}
              // isResizable={true}
              horizontalCompact={true}
              verticalCompact={false}
              preventCollision={false}
              margin={[10, 10]}
              containerPadding={[0, 0]}
              autoSize={true}
              useCSSTransforms={true}
            >
              {sheet.Fields.filter((x) => x.sectionId === activeSection).map(
                (field, index) => (
                  <div
                    key={field.id}
                    className="flex rounded-sm shadow-md"
                    data-grid={{
                      x: (index * 3) % 12,
                      y: Math.floor((index * 3) / 12),
                      w: 3,
                      h: field.h,
                      minW: 2,
                      maxW: 4,
                      // resizeHandles: ["s"],
                    }}
                    style={{
                      backgroundImage: "url('../image.png')",
                      backgroundColor: field.color || "#FFFFFF",
                      background: `${field.color}33`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <div className="flex w-full h-full p-4 justify-center items-center">
                      <input
                        value={field.value}
                        onChange={(e) =>
                          handleUpdateFieldValue(field.id, e.target.value)
                        }
                        className="w-full h-full text-center border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-md"
                      />
                    </div>
                    <div>
                      <div className="flex w-full p-3 border justify-center items-center shadow-md bg-white rounded-sm">
                        {field.name}
                      </div>
                    </div>
                  </div>
                )
              )}
            </ResponsiveGridLayout>
          )}
        </div>
      </div>
    </div>
  );
}
