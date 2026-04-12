import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCheck, UserX, CheckCircle, XCircle,
  RefreshCw, Phone, Mail, Search,
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

const ACTION_LABELS = {
  verify:   { label: 'Verify',    color: 'bg-teal-600 hover:bg-teal-700',   icon: CheckCircle },
  unverify: { label: 'Unverify',  color: 'bg-yellow-500 hover:bg-yellow-600', icon: XCircle  },
}

const VolunteerCard = ({ volunteer, branchId, onRefresh }) => {
  const [loading,       setLoading]       = useState(false)
  const [showStats,     setShowStats]     = useState(false)
  const [stats,         setStats]         = useState(null)
  const [statsLoading,  setStatsLoading]  = useState(false)

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
    } catch {}
    finally { setStatsLoading(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
    >
      {/* Main row */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            text-lg font-bold flex-shrink-0
            ${volunteer.branchVerified ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-500'}
          `}>
            {volunteer.name?.[0]}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-slate-900">{volunteer.name}</p>
              {volunteer.branchVerified && (
                <span className="flex items-center gap-1 text-xs text-teal-600
                                 bg-teal-50 px-2 py-0.5 rounded-full font-medium">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Mail className="w-3 h-3" />
                {volunteer.email}
              </span>
              {volunteer.phone && (
                <a href={`tel:${volunteer.phone}`}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  <Phone className="w-3 h-3" />
                  {volunteer.phone}
                </a>
              )}
            </div>

            {/* Badges */}
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant={volunteer.isOnDuty ? 'green' : 'gray'} dot>
                {volunteer.isOnDuty ? 'On Duty' : 'Off Duty'}
              </Badge>
              <Badge variant={volunteer.isActive ? 'teal' : 'red'} dot>
                {volunteer.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {!volunteer.branchVerified && (
                <Badge variant="yellow">Pending Verification</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {/* Verify / Unverify */}
          {volunteer.branchVerified ? (
            <button
              onClick={() => handleAction('unverify')}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs
                         font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100
                         transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Remove Verification
            </button>
          ) : (
            <button
              onClick={() => handleAction('verify')}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs
                         font-medium bg-teal-600 text-white hover:bg-teal-700
                         transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading
                ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <CheckCircle className="w-3.5 h-3.5" />
              }
              Verify Volunteer
            </button>
          )}

          {/* Assign / Unassign */}
          <button
            onClick={() => handleAction('unassign')}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs
                       font-medium bg-red-50 text-red-600 hover:bg-red-100
                       transition-colors disabled:opacity-50"
          >
            <UserX className="w-3.5 h-3.5" />
            Remove from Branch
          </button>

          {/* Activate / Deactivate */}
          <button
            onClick={handleToggleActive}
            disabled={loading}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs
              font-medium transition-colors disabled:opacity-50
              ${volunteer.isActive
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-green-50 text-green-600 hover:bg-green-100'
              }
            `}
          >
            {volunteer.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
            {volunteer.isActive ? 'Deactivate' : 'Activate'}
          </button>

          {/* Stats toggle */}
          <button
            onClick={loadStats}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs
                       font-medium bg-blue-50 text-blue-600 hover:bg-blue-100
                       transition-colors ml-auto"
          >
            📊 {showStats ? 'Hide Stats' : 'View Stats'}
          </button>
        </div>
      </div>

      {/* Stats panel */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-50 overflow-hidden"
          >
            <div className="p-4 bg-slate-50">
              {statsLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent
                                   rounded-full animate-spin" />
                  Loading stats...
                </div>
              ) : stats ? (
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Total Accepted', value: stats.totalAccepted, color: 'text-blue-600' },
                    { label: 'Resolved',        value: stats.totalResolved, color: 'text-green-600' },
                    { label: 'Pending',         value: stats.totalPending,  color: 'text-yellow-600' },
                    { label: 'Success Rate',    value: `${stats.resolutionRate}%`, color: 'text-teal-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                      <p className={`text-xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No stats available.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const VolunteersPage = () => {
  const user     = useSelector(selectUser)
  const branchId = user?.branchId
  const [volunteers, setVolunteers] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState('all')
  // filter: all | pending | verified | on_duty

  const load = async () => {
    if (!branchId) return
    setLoading(true)
    try {
      const { data } = await getBranchVolunteersApi(branchId)
      setVolunteers(data.data.volunteers || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [branchId])

  const filtered = volunteers.filter(v => {
    const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase())
      || v.email.toLowerCase().includes(search.toLowerCase())

    const matchFilter = filter === 'all'
      ? true
      : filter === 'pending'  ? !v.branchVerified
      : filter === 'verified' ? v.branchVerified
      : filter === 'on_duty'  ? v.isOnDuty
      : true

    return matchSearch && matchFilter
  })

  const pendingCount = volunteers.filter(v => !v.branchVerified).length

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Volunteers</h1>
          <p className="text-slate-500 text-sm mt-1">
            {volunteers.length} total •{' '}
            {pendingCount > 0 && (
              <span className="text-yellow-600 font-medium">
                {pendingCount} pending verification
              </span>
            )}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border
                     border-slate-200 rounded-xl text-sm font-medium text-slate-600
                     hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {!branchId ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <p className="font-semibold text-yellow-800">⚠️ No Branch Assigned</p>
          <p className="text-yellow-700 text-sm mt-1">
            Contact Super Admin to assign you to a branch.
          </p>
        </div>
      ) : (
        <>
          {/* Pending verification alert */}
          {pendingCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 bg-yellow-50 border border-yellow-200 rounded-2xl p-4
                         flex items-center gap-3"
            >
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-yellow-800">
                  {pendingCount} volunteer{pendingCount > 1 ? 's' : ''} awaiting verification
                </p>
                <p className="text-sm text-yellow-700">
                  Unverified volunteers cannot receive branch-priority SOS alerts.
                  Verify them to include them in priority dispatch.
                </p>
              </div>
              <button
                onClick={() => setFilter('pending')}
                className="ml-auto px-3 py-1.5 bg-yellow-200 hover:bg-yellow-300
                           text-yellow-800 text-xs font-semibold rounded-lg transition-colors
                           flex-shrink-0"
              >
                Show pending
              </button>
            </motion.div>
          )}

          {/* Search + Filter */}
          <div className="flex gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search volunteers..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200
                           rounded-xl text-sm focus:outline-none focus:ring-2
                           focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl
                         text-sm focus:outline-none focus:ring-2 focus:ring-teal-500
                         text-slate-700 cursor-pointer"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="on_duty">On Duty</option>
            </select>
          </div>

          {/* Volunteer list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-36 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <p className="text-4xl mb-3">👤</p>
              <p className="font-medium text-slate-600">No volunteers found</p>
              <p className="text-sm text-slate-400 mt-1">
                {search ? 'Try a different search term' : 'No volunteers assigned to your branch yet'}
              </p>
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
        </>
      )}
    </AdminLayout>
  )
}

export default VolunteersPage