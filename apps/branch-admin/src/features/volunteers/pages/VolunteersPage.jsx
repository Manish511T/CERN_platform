import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCheck, UserX, CheckCircle, XCircle,
  RefreshCw, Phone, Mail, Search, AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { selectUser }  from '../../../store/slices/authSlice'
import AdminLayout     from '../../../shared/components/layout/AdminLayout'
import Badge           from '../../../shared/components/ui/Badge'
import {
  getBranchVolunteersApi,
  manageVolunteerApi,
  deactivateUserApi,
  reactivateUserApi,
  getVolunteerStatsApi,
} from '../services/volunteerApi'

// ── Volunteer Card ────────────────────────────────────────────────────────────

const VolunteerCard = ({ volunteer, branchId, onRefresh }) => {
  const [loading,      setLoading]      = useState(false)
  const [showStats,    setShowStats]    = useState(false)
  const [stats,        setStats]        = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const handleAction = async (action) => {
    setLoading(true)
    try {
      await manageVolunteerApi(branchId, volunteer._id, action)
      toast.success(`Volunteer ${action}d successfully.`)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${action}.`)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async () => {
    setLoading(true)
    try {
      if (volunteer.isActive) {
        await deactivateUserApi(volunteer._id)
        toast.success(`${volunteer.name} deactivated.`)
      } else {
        await reactivateUserApi(volunteer._id)
        toast.success(`${volunteer.name} reactivated.`)
      }
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed.')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (stats) { setShowStats(s => !s); return }
    setShowStats(true)
    setStatsLoading(true)
    try {
      const { data } = await getVolunteerStatsApi(volunteer._id)
      setStats(data.data.stats)
    } catch {
      toast.error('Failed to load stats.')
    } finally {
      setStatsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden
                 shadow-sm"
    >
      <div className="p-5">
        {/* Avatar + Info */}
        <div className="flex items-start gap-4">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            text-lg font-bold shrink-0
            ${volunteer.branchVerified
              ? 'bg-teal-100 text-teal-600'
              : 'bg-slate-100 text-slate-500'
            }
          `}>
            {volunteer.name?.[0]?.toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name + verified badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-slate-900">{volunteer.name}</p>
              {volunteer.branchVerified && (
                <span className="inline-flex items-center gap-1 text-xs
                                 text-teal-600 bg-teal-50 px-2 py-0.5
                                 rounded-full font-medium border border-teal-100">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
            </div>

            {/* Contact info */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Mail className="w-3 h-3" />
                {volunteer.email}
              </span>
              {volunteer.phone && (
                <a href={`tel:${volunteer.phone}`}
                  className="flex items-center gap-1 text-xs text-blue-500
                             hover:text-blue-700 hover:underline">
                  <Phone className="w-3 h-3" />
                  {volunteer.phone}
                </a>
              )}
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant={volunteer.isOnDuty ? 'green' : 'gray'} dot>
                {volunteer.isOnDuty ? 'On Duty' : 'Off Duty'}
              </Badge>
              <Badge variant={volunteer.isActive ? 'teal' : 'red'} dot>
                {volunteer.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {!volunteer.branchVerified && (
                <Badge variant="yellow">⚠ Pending Verification</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-50 mt-4 pt-4">
          <div className="flex flex-wrap gap-2">
            {/* VERIFY / UNVERIFY */}
            {volunteer.branchVerified ? (
              <button
                onClick={() => handleAction('unverify')}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                           text-xs font-medium bg-yellow-50 text-yellow-700
                           hover:bg-yellow-100 border border-yellow-100
                           transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Remove Verification
              </button>
            ) : (
              <button
                onClick={() => handleAction('verify')}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                           text-xs font-semibold bg-teal-600 text-white
                           hover:bg-teal-700 shadow-sm transition-colors
                           disabled:opacity-50"
              >
                {loading
                  ? <span className="w-3.5 h-3.5 border-2 border-white
                                     border-t-transparent rounded-full animate-spin" />
                  : <CheckCircle className="w-3.5 h-3.5" />
                }
                Verify Volunteer
              </button>
            )}

            {/* REMOVE FROM BRANCH */}
            <button
              onClick={() => {
                if (!confirm(`Remove ${volunteer.name} from your branch?`)) return
                handleAction('unassign')
              }}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                         text-xs font-medium bg-red-50 text-red-600
                         hover:bg-red-100 border border-red-100
                         transition-colors disabled:opacity-50"
            >
              <UserX className="w-3.5 h-3.5" />
              Remove from Branch
            </button>

            {/* ACTIVATE / DEACTIVATE */}
            <button
              onClick={handleToggleActive}
              disabled={loading}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs
                font-medium transition-colors disabled:opacity-50 border
                ${volunteer.isActive
                  ? 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                  : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-100'
                }
              `}
            >
              {volunteer.isActive
                ? <><UserX className="w-3.5 h-3.5" /> Deactivate</>
                : <><UserCheck className="w-3.5 h-3.5" /> Activate</>
              }
            </button>

            {/* STATS */}
            <button
              onClick={loadStats}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                         text-xs font-medium bg-blue-50 text-blue-600
                         hover:bg-blue-100 border border-blue-100
                         transition-colors ml-auto"
            >
              📊 {showStats ? 'Hide' : 'Stats'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Drawer */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-4 bg-slate-50">
              {statsLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="w-4 h-4 border-2 border-slate-400
                                   border-t-transparent rounded-full animate-spin" />
                  Loading rescue stats...
                </div>
              ) : stats ? (
                <div className="grid grid-cols-4 gap-3 text-center">
                  {[
                    { label: 'Accepted',    value: stats.totalAccepted,  color: 'text-blue-600'  },
                    { label: 'Resolved',    value: stats.totalResolved,  color: 'text-green-600' },
                    { label: 'Pending',     value: stats.totalPending,   color: 'text-yellow-600'},
                    { label: 'Success',     value: `${stats.resolutionRate}%`, color: 'text-teal-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <p className={`text-xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No stats available yet.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const VolunteersPage = () => {
  const user = useSelector(selectUser)

  // Normalize branchId — could be string OR populated object after session restore
  const branchId = user?.branchId?._id
    ? user.branchId._id.toString()
    : user?.branchId?.toString() || null

  const [volunteers, setVolunteers] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState('all')

  const load = async () => {
    if (!branchId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Fetching volunteers for branchId:', branchId)
      const { data } = await getBranchVolunteersApi(branchId)
      console.log('Volunteers response:', data)
      setVolunteers(data.data.volunteers || [])
    } catch (err) {
      console.error('Volunteer fetch error:', err.response?.data || err.message)
      setError(err.response?.data?.error || 'Failed to load volunteers.')
      toast.error('Failed to load volunteers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [branchId])  // re-fetch if branchId changes

  // Client-side filter + search
  const filtered = volunteers.filter(v => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || v.name?.toLowerCase().includes(q)
      || v.email?.toLowerCase().includes(q)
      || v.phone?.includes(q)

    const matchFilter =
      filter === 'all'      ? true :
      filter === 'pending'  ? !v.branchVerified :
      filter === 'verified' ? v.branchVerified :
      filter === 'on_duty'  ? v.isOnDuty :
      filter === 'inactive' ? !v.isActive :
      true

    return matchSearch && matchFilter
  })

  const pendingCount  = volunteers.filter(v => !v.branchVerified).length
  const onDutyCount   = volunteers.filter(v => v.isOnDuty).length
  const verifiedCount = volunteers.filter(v => v.branchVerified).length

  // ── No branch assigned ──────────────────────────────────────────────────────
  if (!branchId) {
    return (
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Volunteers</h1>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6
                        flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-800">No Branch Assigned</p>
            <p className="text-yellow-700 text-sm mt-1">
              You are not assigned to any branch yet. Contact your Super Admin
              to assign you to a branch before you can manage volunteers.
            </p>
            <p className="text-yellow-600 text-xs mt-2 font-mono">
              Your ID: {user?.id || user?._id}
            </p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Volunteers</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Branch: <span className="font-medium text-slate-700">
              {user?.branchInfo?.name || user?.branchId?.name || branchId}
            </span>
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border
                     border-slate-200 rounded-xl text-sm font-medium
                     text-slate-600 hover:bg-slate-50 disabled:opacity-50
                     transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{volunteers.length}</span> total
        </div>
        <div className="text-sm text-slate-500">
          <span className="font-semibold text-green-600">{verifiedCount}</span> verified
        </div>
        <div className="text-sm text-slate-500">
          <span className="font-semibold text-blue-600">{onDutyCount}</span> on duty
        </div>
        {pendingCount > 0 && (
          <div className="text-sm">
            <span className="font-semibold text-yellow-600">{pendingCount}</span>
            <span className="text-yellow-600"> awaiting verification</span>
          </div>
        )}
      </div>

      {/* Pending alert banner */}
      <AnimatePresence>
        {pendingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-5 bg-yellow-50 border border-yellow-200 rounded-2xl
                       p-4 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-yellow-800 text-sm">
                {pendingCount} volunteer{pendingCount > 1 ? 's' : ''} pending verification
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Unverified volunteers are excluded from branch-priority SOS dispatch.
              </p>
            </div>
            <button
              onClick={() => setFilter('pending')}
              className="px-3 py-1.5 bg-yellow-200 hover:bg-yellow-300
                         text-yellow-800 text-xs font-semibold rounded-lg
                         transition-colors shrink-0"
            >
              Show pending
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Filter bar */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200
                       rounded-xl text-sm focus:outline-none focus:ring-2
                       focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl
                     text-sm text-slate-700 focus:outline-none focus:ring-2
                     focus:ring-teal-500 cursor-pointer"
        >
          <option value="all">All ({volunteers.length})</option>
          <option value="pending">Pending ({pendingCount})</option>
          <option value="verified">Verified ({verifiedCount})</option>
          <option value="on_duty">On Duty ({onDutyCount})</option>
          <option value="inactive">Inactive ({volunteers.filter(v => !v.isActive).length})</option>
        </select>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-700 text-sm font-medium">{error}</p>
          <button onClick={load} className="text-red-600 text-xs underline mt-1">
            Try again
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          {volunteers.length === 0 ? (
            <>
              <p className="text-4xl mb-3">👥</p>
              <p className="font-medium text-slate-600">No volunteers in your branch</p>
              <p className="text-sm text-slate-400 mt-2">
                Ask Super Admin to assign volunteers to your branch, or
                volunteers can self-assign via the Super Admin panel.
              </p>
            </>
          ) : (
            <>
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium text-slate-600">No results</p>
              <p className="text-sm text-slate-400 mt-1">
                Try a different search or filter
              </p>
              <button
                onClick={() => { setSearch(''); setFilter('all') }}
                className="mt-3 text-teal-600 text-sm underline"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(vol => (
            <VolunteerCard
              key={vol._id}
              volunteer={vol}
              branchId={branchId}
              onRefresh={load}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  )
}

export default VolunteersPage