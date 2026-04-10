import { useSelector } from 'react-redux'
import { User, Phone, Mail, Shield } from 'lucide-react'
import { selectUser } from '../../../store/slices/authSlice'
import { Card, Badge } from '../../../shared/components/ui'
import PageWrapper from '../../../shared/components/layout/PageWrapper'
import useAuth from '../../../shared/hooks/useAuth'
import { Button } from '../../../shared/components/ui'

const roleColors = {
  user:         'blue',
  volunteer:    'green',
  branch_admin: 'purple',
  super_admin:  'red',
}

const ProfilePage = () => {
  const user   = useSelector(selectUser)
  const { logout } = useAuth()

  return (
    <PageWrapper title="Profile">
      <div className="space-y-4">
        {/* Avatar + Name */}
        <Card padding="lg" className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center
                          justify-center mx-auto mb-4 text-3xl font-bold text-blue-600">
            {user?.name?.[0]}
          </div>
          <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
          <div className="mt-2 flex justify-center">
            <Badge variant={roleColors[user?.role] || 'blue'} dot>
              {user?.role?.replace('_', ' ')}
            </Badge>
          </div>
        </Card>

        {/* Details */}
        <Card padding="none" className="divide-y divide-slate-50">
          {[
            { icon: Mail,   label: 'Email',  value: user?.email },
            { icon: Phone,  label: 'Phone',  value: user?.phone || 'Not set' },
            { icon: Shield, label: 'Status', value: user?.isActive ? 'Active' : 'Inactive' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center
                              justify-center shrink-0">
                <Icon className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-800">{value}</p>
              </div>
            </div>
          ))}
        </Card>

        <Button variant="danger" size="full" onClick={logout}>
          Sign out
        </Button>
      </div>
    </PageWrapper>
  )
}

export default ProfilePage