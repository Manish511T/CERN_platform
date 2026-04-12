import { useEffect, useState } from 'react'
import { Search, UserX, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../../../shared/components/layout/AdminLayout'
import Table       from '../../../shared/components/ui/Table'
import Badge       from '../../../shared/components/ui/Badge'
import { getUsersApi, deactivateUserApi, reactivateUserApi } from '../services/userApi'

const UsersPage = () => {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [total,   setTotal]   = useState(0)

  const load = async (q = '') => {
    setLoading(true)
    try {
      const params = q ? `&search=${encodeURIComponent(q)}` : ''
      const { data } = await getUsersApi(params)
      setUsers(data.data.users || [])
      setTotal(data.data.total || 0)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const t = setTimeout(() => load(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const handleToggle = async (user) => {
    try {
      if (user.isActive) {
        await deactivateUserApi(user._id)
        toast.success(`${user.name} deactivated.`)
      } else {
        await reactivateUserApi(user._id)
        toast.success(`${user.name} reactivated.`)
      }
      load(search)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed.')
    }
  }

  const columns = [
    {
      key:    'name',
      label:  'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center
                          justify-center text-sm font-bold text-blue-600">
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
      key:    'createdAt',
      label:  'Joined',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      }),
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
          onClick={() => handleToggle(row)}
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 text-sm mt-1">{total} registered users</p>
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2
                           w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200
                     rounded-xl text-sm focus:outline-none focus:ring-2
                     focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <Table
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found"
      />
    </AdminLayout>
  )
}

export default UsersPage