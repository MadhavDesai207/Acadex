import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, CheckCircle, ArrowLeft } from 'lucide-react';
import WeeklyGrid from '../../components/WeeklyGrid';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Select from '../../components/Select';
import ConfirmDialog from '../../components/ConfirmDialog';
import TimetableForm from './TimetableForm';
import timetableService from '../../services/timetableService';
import authService from '../../services/authService';
import apiClient from '../../services/apiClient';

const TimetablePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentUser = authService.getLocalUser() || {};
  const fromBatch = searchParams.get('batchId');
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role);

  const [slots, setSlots] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(searchParams.get('batchId') || '');
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [alert, setAlert] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    apiClient.get('/batches').then((r) => {
      const list = r.data.data || r.data || [];
      setBatches(list.filter((b) => b.isActive));
    });
  }, []);

  const loadSlots = async () => {
    if (!selectedBatch) { setSlots([]); return; }
    setLoading(true);
    const data = await timetableService.getBatchTimetable(selectedBatch);
    setSlots(data || []);
    setLoading(false);
  };

  useEffect(() => { loadSlots(); }, [selectedBatch]);

  const handleSubmit = async (formData) => {
    let res;
    if (editingSlot) {
      res = await timetableService.updateSlot(editingSlot.id, formData);
    } else {
      res = await timetableService.createSlot(formData);
    }
    if (res.success) {
      setAlert({ message: res.message });
      setIsFormOpen(false);
      setEditingSlot(null);
      loadSlots();
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const openConfirmDelete = (id) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setConfirmLoading(true);
    try {
      const res = await timetableService.deleteSlot(confirmDelete);
      if (res.success) {
        setAlert({ message: 'Slot removed' });
        loadSlots();
        setTimeout(() => setAlert(null), 3000);
      }
    } finally {
      setConfirmLoading(false);
      setConfirmDelete(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {fromBatch && (
              <button onClick={() => navigate(`/batches/${fromBatch}`)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">Timetable</h1>
              <p className="text-xs md:text-sm text-slate-400">Weekly schedule per batch.</p>
            </div>
          </div>
          {isAdmin && selectedBatch && (
            <Button variant="primary" onClick={() => { setEditingSlot(null); setIsFormOpen(true); }} className="flex items-center gap-2">
              <Plus size={16} /> <span>Add Slot</span>
            </Button>
          )}
        </div>

        {alert && (
          <div className="flex gap-2.5 p-3 rounded-lg bg-status-success/15 border border-status-success/30 text-status-success text-sm">
            <CheckCircle size={18} className="shrink-0 mt-0.5" />
            <span>{alert.message}</span>
          </div>
        )}

        <div className="glass-card max-w-xs flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Select Batch</label>
          <Select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
            <option value="">Choose a batch...</option>
            {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
        </div>

        {loading && (
          <div className="text-slate-400 text-sm">Loading timetable...</div>
        )}

        {!loading && selectedBatch && (
          <div className="overflow-x-auto">
            <WeeklyGrid
              slots={slots}
              onEdit={isAdmin ? (slot) => { setEditingSlot(slot); setIsFormOpen(true); } : null}
              onDelete={isAdmin ? openConfirmDelete : null}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {!selectedBatch && (
          <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
            Select a batch to view its timetable.
          </div>
        )}

        <Modal
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setEditingSlot(null); }}
          title={editingSlot ? 'Edit Slot' : 'Add Timetable Slot'}
        >
          <TimetableForm
            onSubmit={handleSubmit}
            initialData={editingSlot}
            batchId={selectedBatch}
            onClose={() => { setIsFormOpen(false); setEditingSlot(null); }}
          />
        </Modal>

        <ConfirmDialog
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleConfirmDelete}
          loading={confirmLoading}
          title="Remove Timetable Slot?"
          description="This timetable slot will be permanently deleted."
          confirmLabel="Yes, Remove"
          variant="danger"
        />
      </div>
    </>
  );
};

export default TimetablePage;
