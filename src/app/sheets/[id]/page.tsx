"use client";
import React from "react";
import { api } from "../../services/api";

export default function SheetView({ params }) {
  const unwrappedParams = React.use(params);
  const sheetId = unwrappedParams.id;

  const [sheet, setSheet] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [showFieldForm, setShowFieldForm] = React.useState(false);
  const [editingField, setEditingField] = React.useState(null);
  const [fieldFormData, setFieldFormData] = React.useState({
    name: "",
    value: "",
  });

  React.useEffect(() => {
    fetchSheet();
  }, [sheetId]);

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
    setFieldFormData({
      ...fieldFormData,
      [name]: value,
    });
  };

  const resetFieldForm = () => {
    setFieldFormData({ name: "", value: "" });
    setEditingField(null);
    setShowFieldForm(false);
  };

  const handleAddField = () => {
    resetFieldForm();
    setShowFieldForm(true);
  };

  const handleEditField = (field) => {
    setFieldFormData({
      name: field.name,
      value: field.value || "",
    });
    setEditingField(field.id);
    setShowFieldForm(true);
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
          name: fieldFormData.name,
          value: fieldFormData.value,
        });
      } else {
        await api.createField({
          sheetId: sheet.id,
          name: fieldFormData.name,
          value: fieldFormData.value,
        });
      }

      await fetchSheet();
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
      await fetchSheet();
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

  return (
    <div className="container mx-auto p-4 max-w-4xl">
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
            <button
              onClick={() => window.history.back()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              Back
            </button>
          </div>
        </div>

        {/* Fields Section */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Fields</h2>
            <button
              onClick={handleAddField}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Field
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}

          {/* Field Form */}
          {showFieldForm && (
            <div className="bg-gray-50 p-4 rounded mb-6">
              <h3 className="text-lg font-medium mb-4">
                {editingField ? "Edit Field" : "Add New Field"}
              </h3>
              <form onSubmit={handleFieldSubmit} className="space-y-4">
                <div>
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="fieldName"
                  >
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

          {/* Fields List */}
          {sheet.Fields.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded">
              <p className="text-gray-600">No fields added yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sheet.Fields.map((field) => (
                    <tr key={field.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {field.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {field.value || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(field.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditField(field)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteField(field.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
