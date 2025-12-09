'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import DashboardHeader from '@/components/DashboardHeader';

interface PublicHoliday {
  id: string;
  company_id: string;
  name: string;
  date: string;
  is_recurring: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function PublicHolidaysPage() {
  const userId = 'demo-user-123';
  const companyId = '12345678-1234-1234-1234-123456789012'; // Demo company ID

  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<PublicHoliday | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    is_recurring: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHolidays();
  }, [companyId, selectedYear]);

  async function fetchHolidays() {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/settings/holidays?companyId=${companyId}&year=${selectedYear}`
      );
      const data = await response.json();

      if (data.holidays) {
        setHolidays(data.holidays);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveHoliday() {
    setSaving(true);
    try {
      if (editingHoliday) {
        // Update existing holiday
        const response = await fetch('/api/settings/holidays', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            holidayId: editingHoliday.id,
            name: formData.name,
            date: formData.date,
            isRecurring: formData.is_recurring,
          }),
        });

        if (response.ok) {
          await fetchHolidays();
          closeModal();
        }
      } else {
        // Create new holiday
        const response = await fetch('/api/settings/holidays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId,
            name: formData.name,
            date: formData.date,
            isRecurring: formData.is_recurring,
          }),
        });

        if (response.ok) {
          await fetchHolidays();
          closeModal();
        }
      }
    } catch (error) {
      console.error('Error saving holiday:', error);
    } finally {
      setSaving(false);
    }
  }

  async function deleteHoliday(holidayId: string) {
    if (!confirm('Are you sure you want to delete this holiday?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/settings/holidays?holidayId=${holidayId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await fetchHolidays();
      }
    } catch (error) {
      console.error('Error deleting holiday:', error);
    }
  }

  function openAddModal() {
    setFormData({ name: '', date: '', is_recurring: false });
    setEditingHoliday(null);
    setShowAddModal(true);
  }

  function openEditModal(holiday: PublicHoliday) {
    setFormData({
      name: holiday.name,
      date: holiday.date,
      is_recurring: holiday.is_recurring,
    });
    setEditingHoliday(holiday);
    setShowAddModal(true);
  }

  function closeModal() {
    setShowAddModal(false);
    setEditingHoliday(null);
    setFormData({ name: '', date: '', is_recurring: false });
  }

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() + i - 2
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userId={userId} userName="Demo User" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-3 text-gray-600">Loading holidays...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userId={userId} userName="Demo User" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Public Holidays
            </h1>
            <p className="text-gray-600">
              Manage company public holidays for leave calculations
            </p>
          </div>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Holiday
          </Button>
        </div>

        {/* Year Selector */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Viewing holidays for:
              </span>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                About Public Holidays
              </h3>
              <p className="text-sm text-blue-800">
                Public holidays are automatically excluded from leave calculations.
                Mark holidays as &quot;recurring&quot; if they occur on the same date every year (e.g., Christmas, New Year&apos;s Day).
              </p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-primary">
                {holidays.length}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Total Holidays</h3>
            <p className="text-sm text-gray-600">In {selectedYear}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">
                {holidays.filter(h => h.is_recurring).length}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Recurring</h3>
            <p className="text-sm text-gray-600">Annual holidays</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {holidays.filter(h => !h.is_recurring).length}
              </span>
            </div>
            <h3 className="font-semibold mb-1">One-Time</h3>
            <p className="text-sm text-gray-600">Special holidays</p>
          </Card>
        </div>

        {/* Holidays List */}
        {holidays.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No holidays found
            </h3>
            <p className="text-gray-600 mb-4">
              Add public holidays for {selectedYear}
            </p>
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Holiday
            </Button>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Holiday Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day of Week
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {holidays.map((holiday) => (
                    <tr key={holiday.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary mr-3"
                          >
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div className="font-medium text-gray-900">
                            {holiday.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(new Date(holiday.date), 'MMMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(new Date(holiday.date), 'EEEE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {holiday.is_recurring ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Recurring
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            One-Time
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(holiday)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteHoliday(holiday.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Holiday Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Christmas Day"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Recurring Holiday
                    </h4>
                    <p className="text-sm text-gray-600">
                      Occurs every year on this date
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        is_recurring: !formData.is_recurring,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.is_recurring ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.is_recurring ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveHoliday}
                  disabled={!formData.name || !formData.date || saving}
                  className="flex-1"
                >
                  {saving ? 'Saving...' : editingHoliday ? 'Update' : 'Add Holiday'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
