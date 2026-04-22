import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout from "../../../shared/components/layout/AdminLayout";
import Table from "../../../shared/components/ui/Table";
import Badge from "../../../shared/components/ui/Badge";
import Modal from "../../../shared/components/ui/Model";
import api from "../../../services/api";
import {
  getBranchesApi,
  createBranchApi,
  deleteBranchApi,
  manageVolunteerApi,
} from "../services/branchApi";

const INITIAL_FORM = {
  name: "",
  code: "",
  latitude: "",
  longitude: "",
  radiusMeters: 15000,
  contactPhone: "",
  address: "",
};

const BranchesPage = () => {
  const [branches,       setBranches]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [createModal,    setCreateModal]    = useState(false);
  const [form,           setForm]           = useState(INITIAL_FORM);
  const [submitting,     setSubmitting]     = useState(false);

  // ── Assign volunteer state ──────────────────────────────────────────────────
  const [assignModal,    setAssignModal]    = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [allVolunteers,  setAllVolunteers]  = useState([]);
  const [assigningId,    setAssigningId]    = useState("");
  const [assigning,      setAssigning]      = useState(false);

  // ── Load branches ───────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getBranchesApi();
      setBranches(data.data.branches || []);
    } catch {
      toast.error("Failed to load branches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Create branch ───────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createBranchApi({
        ...form,
        latitude:     parseFloat(form.latitude),
        longitude:    parseFloat(form.longitude),
        radiusMeters: parseInt(form.radiusMeters),
      });
      toast.success("Branch created!");
      setCreateModal(false);
      setForm(INITIAL_FORM);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create branch.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete branch ───────────────────────────────────────────────────────────
  const handleDelete = async (branchId, name) => {
    if (!confirm(`Delete branch "${name}"? This cannot be undone.`)) return;
    try {
      await deleteBranchApi(branchId);
      toast.success("Branch deleted.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete.");
    }
  };

  // ── Open assign modal + load all volunteers ─────────────────────────────────
  const openAssignModal = async (branch) => {
    setSelectedBranch(branch);
    setAssigningId("");
    setAssignModal(true);
    try {
      const { data } = await api.get("/user?role=volunteer&limit=100");
      setAllVolunteers(data.data.users || []);
    } catch {
      toast.error("Failed to load volunteers.");
    }
  };

  // ── Assign volunteer to branch ──────────────────────────────────────────────
  const handleAssignVolunteer = async () => {
    if (!assigningId) return;
    setAssigning(true);
    try {
      await manageVolunteerApi(selectedBranch._id, assigningId, "assign");
      toast.success("Volunteer assigned to branch.");
      setAssignModal(false);
      setAssigningId("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to assign.");
    } finally {
      setAssigning(false);
    }
  };

  // ── Table columns ───────────────────────────────────────────────────────────
  const columns = [
    {
      key:   "name",
      label: "Branch",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-400">{row.code}</p>
        </div>
      ),
    },
    {
      key:   "admin",
      label: "Admin",
      render: (row) =>
        row.admin ? (
          <span className="text-slate-700">{row.admin.name}</span>
        ) : (
          <Badge variant="gray">Unassigned</Badge>
        ),
    },
    {
      key:   "radiusMeters",
      label: "Coverage",
      render: (row) => `${(row.radiusMeters / 1000).toFixed(0)}km`,
    },
    {
      key:   "isActive",
      label: "Status",
      render: (row) => (
        <Badge variant={row.isActive ? "green" : "gray"} dot>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key:   "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          {/* ── Assign Volunteer button ── */}
          <button
            onClick={() => openAssignModal(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                       text-xs font-medium bg-blue-50 text-blue-600
                       hover:bg-blue-100 transition-colors"
          >
            + Assign Volunteer
          </button>

          {/* ── Delete button ── */}
          <button
            onClick={() => handleDelete(row._id, row.name)}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       hover:bg-red-50 text-slate-400 hover:text-red-500
                       transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const inputClass = `
    w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
  `;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Branches</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage geographic response regions
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600
                     hover:bg-blue-700 text-white font-medium text-sm
                     rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Branch
        </motion.button>
      </div>

      {/* Branches table */}
      <Table
        columns={columns}
        data={branches}
        loading={loading}
        emptyMessage="No branches created yet"
      />

      {/* ── CREATE BRANCH MODAL ──────────────────────────────────────────── */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Create New Branch"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Branch Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Delhi North Branch"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Branch Code *
              </label>
              <input
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                placeholder="DEL-N"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Latitude *
              </label>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))}
                placeholder="28.7041"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Longitude *
              </label>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => setForm((p) => ({ ...p, longitude: e.target.value }))}
                placeholder="77.1025"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Coverage Radius (meters)
            </label>
            <input
              type="number"
              value={form.radiusMeters}
              onChange={(e) => setForm((p) => ({ ...p, radiusMeters: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Contact Phone
            </label>
            <input
              value={form.contactPhone}
              onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
              placeholder="9000000001"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Address
            </label>
            <input
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              placeholder="North Delhi, Delhi"
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCreateModal(false)}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl
                         text-slate-600 font-medium text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700
                         text-white font-medium text-sm rounded-xl
                         disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && (
                <span className="w-4 h-4 border-2 border-white
                                 border-t-transparent rounded-full animate-spin" />
              )}
              Create Branch
            </button>
          </div>
        </form>
      </Modal>

      {/* ── ASSIGN VOLUNTEER MODAL ───────────────────────────────────────── */}
      <Modal
        open={assignModal}
        onClose={() => setAssignModal(false)}
        title={`Assign Volunteer to ${selectedBranch?.name || 'Branch'}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Select a volunteer to assign to this branch. They will appear in
            the Branch Admin's volunteer list and can be verified from there.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Select Volunteer
            </label>
            <select
              value={assigningId}
              onChange={(e) => setAssigningId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200
                         text-sm focus:outline-none focus:ring-2
                         focus:ring-blue-500"
            >
              <option value="">-- Choose a volunteer --</option>
              {allVolunteers.length === 0 && (
                <option disabled>No volunteers found</option>
              )}
              {allVolunteers.map((vol) => (
                <option key={vol._id} value={vol._id}>
                  {vol.name} ({vol.email})
                  {vol.branchId ? " — already in a branch" : " — unassigned"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setAssignModal(false)}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl
                         text-slate-600 text-sm hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignVolunteer}
              disabled={!assigningId || assigning}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white
                         text-sm font-medium rounded-xl disabled:opacity-50
                         flex items-center justify-center gap-2"
            >
              {assigning && (
                <span className="w-4 h-4 border-2 border-white
                                 border-t-transparent rounded-full animate-spin" />
              )}
              Assign to Branch
            </button>
          </div>
        </div>
      </Modal>

    </AdminLayout>
  );
};

export default BranchesPage;