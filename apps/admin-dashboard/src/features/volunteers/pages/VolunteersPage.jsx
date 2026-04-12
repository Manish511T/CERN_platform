import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, UserCheck, UserX, Activity } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../../../shared/components/layout/AdminLayout'
import Table       from '../../../shared/components/ui/Table'
import Badge       from '../../../shared/components/ui/Badge'
import {
  getVolunteersApi,
  deactivateUserApi,
  reactivateUserApi,
} from '../services/volunteerApi'

const VolunteersPage = () => {
  const [volunteers, setVolunteers] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [total,      setTotal]      = useState(0)

  const load = async (q = '') => {
    setLoading(true)
    try {
      const params = q ? `&search=${encodeURIComponent(q)}` : ''
      const { data } = await getVolunteersApi(params)
      setVolunteers(data.data.users || [])
      setTotal(data.data.total || 0)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => load(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const handleToggleActive = async (vol) => {
    try {
      if (vol.isActive) {
        await deactivateUserApi(vol._id)
        toast.success(`${vol.name} deactivated.`)
      } else {
        await reactivateUserApi(vol._id)
        toast.success(`${vol.name} reactivated.`)
      }
      load(search)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed.')
    }
  }

  const columns = [
    {
      key:    'name',
      label:  'Volunteer',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center
                          justify-center text-sm font-bold text-green-600
                          shrink-0">
            {row.name?.[0]}
          </div>
          <div>
            <p className="font-medium text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key:    'phone',
      label:  'Phone',
      render: (row) => row.phone || '—',
    },
    {
      key:    'isOnDuty',
      label:  'Duty',
      render: (row) => (
        <Badge variant={row.isOnDuty ? 'green' : 'gray'} dot>
          {row.isOnDuty ? 'On Duty' : 'Off Duty'}
        </Badge>
      ),
    },
    {
      key:    'branchVerified',
      label:  'Branch',
      render: (row) => (
        <Badge variant={row.branchVerified ? 'blue' : 'yellow'}>
          {row.branchVerified ? 'Verified' : 'Unverified'}
        </Badge>
      ),
    },
    {
      key:    'isActive',
      label:  'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'green' : 'red'} dot>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key:    'actions',
      label:  'Actions',
      render: (row) => (
        <button
          onClick={() => handleToggleActive(row)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
            font-medium transition-colors
            ${row.isActive
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-600 hover:bg-green-100'
            }
          `}
        >
          {row.isActive
            ? <><UserX className="w-3.5 h-3.5" /> Deactivate</>
            : <><UserCheck className="w-3.5 h-3.5" /> Activate</>
          }
        </button>
      ),
    },
  ]

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Volunteers</h1>
          <p className="text-slate-500 text-sm mt-1">
            {total} total volunteers
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2
                           w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200
                     rounded-xl text-sm focus:outline-none focus:ring-2
                     focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <Table
        columns={columns}
        data={volunteers}
        loading={loading}
        emptyMessage="No volunteers found"
      />
    </AdminLayout>
  )
}

export default VolunteersPage