"use client";
import React from "react";
import { api } from "../services/api";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [sheets, setSheets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [showForm, setShowForm] = React.useState(false);
  const [editingSheet, setEditingSheet] = React.useState(null);
  const [formData, setFormData] = React.useState({
    name: "",
    userId: "",
  });

  React.useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      setLoading(true);
      const data = await api.getAllSheets();
      setSheets(data);
      setError(null);
    } catch (err) {
      setError("Failed to load sheets: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (sheetId) => {
    router.push(`/sheets/${sheetId}`);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "userId" ? parseInt(value, 10) || "" : value,
    });
  };

  // Reset form to default state
  const resetForm = () => {
    setFormData({ name: "", userId: "" });
    setEditingSheet(null);
    setShowForm(false);
  };

  // Open form for creating a new sheet
  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  // Open form for editing an existing sheet
  const handleEdit = (sheet) => {
    setFormData({
      name: sheet.name,
      userId: sheet.userId,
    });
    setEditingSheet(sheet.id);
    setShowForm(true);
  };

  // Submit form to create or update a sheet
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      setError("Name and User ID are required");
      return;
    }

    try {
      setLoading(true);

      // Pegando o ID do usuário do localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user.id;

      if (editingSheet) {
        await api.updateSheet(editingSheet, {
          name: formData.name,
          userId: userId,
        });
      } else {
        // Create new sheet
        await api.createSheet({
          name: formData.name,
          userId: userId,
        });
      }

      // Refresh the list
      await fetchSheets();
      resetForm();
      setError(null);
    } catch (err) {
      setError(
        `Failed to ${editingSheet ? "update" : "create"} sheet: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete a sheet
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sheet?")) {
      return;
    }

    try {
      setLoading(true);
      await api.deleteSheet(id);
      await fetchSheets();
      setError(null);
    } catch (err) {
      setError("Failed to delete sheet: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sheets Management</h1>
        <p className="text-gray-600">Create and manage your sheets</p>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={handleAddNew}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add New Sheet
        </button>

        <button
          onClick={fetchSheets}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded flex items-center"
          disabled={loading}
        >
          <span className={loading ? "animate-spin mr-2" : "hidden"}>↻</span>
          Refresh
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingSheet ? "Edit Sheet" : "Create New Sheet"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="name">
                Sheet Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter sheet name"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Saving..." : editingSheet ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm ? (
        <div className="text-center py-8">
          <div className="animate-spin text-4xl">↻</div>
          <p className="mt-2 text-gray-600">Loading sheets...</p>
        </div>
      ) : sheets.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded text-center">
          <p className="text-gray-600">
            No sheets found. Create your first sheet!
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
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
              {sheets.map((sheet) => (
                <tr key={sheet.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sheet.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sheet.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sheet.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sheet.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleView(sheet.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(sheet)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(sheet.id)}
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
  );
}
