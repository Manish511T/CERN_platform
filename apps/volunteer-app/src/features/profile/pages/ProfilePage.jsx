import { useSelector } from 'react-redux'
import { Shield, Phone, Mail, MapPin } from 'lucide-react'
import { selectUser }   from '../../../store/slices/authSlice'
import { selectIsOnDuty } from '../../../store/slices/dutySlice'
import PageWrapper from '../../../shared/components/layout/PageWrapper'
import useAuth     from '../../../shared/hooks/useAuth'
import useDuty     from '../../duty/hooks/useDuty'

const ProfilePage = () => {
  const user      = useSelector(selectUser)
  const isOnDuty  = useSelector(selectIsOnDuty)
  const { logout } = useAuth()
  const { toggleDuty, isToggling } = useDuty()

  return (
    <PageWrapper title="Profile">
      <div className="space-y-4">
        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center
                          justify-center mx-auto mb-3 text-3xl font-bold
                          text-green-600">
            {user?.name?.[0]}
          </div>
          <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-sm text-slate-500">Volunteer</span>
            <span className={`
              text-xs font-semibold px-2.5 py-1 rounded-full
              ${isOnDuty
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-500'
              }
            `}>
              {isOnDuty ? '● On Duty' : '○ Off Duty'}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl border border-slate-100
                        divide-y divide-slate-50">
          {[
            { icon: Mail,   label: 'Email',  value: user?.email },
            { icon: Phone,  label: 'Phone',  value: user?.phone || 'Not set' },
            { icon: MapPin, label: 'Branch', value: user?.branchVerified
                ? 'Verified ✓'
                : 'Not verified'
            },
            { icon: Shield, label: 'Status', value: user?.isActive
                ? 'Active'
                : 'Inactive'
            },
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
        </div>

        {/* Duty toggle */}
        <button
          onClick={toggleDuty}
          disabled={isToggling}
          className={`
            w-full py-3 rounded-xl font-semibold text-sm
            transition-colors disabled:opacity-60
            ${isOnDuty
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-600 hover:bg-green-100'
            }
          `}
        >
          {isToggling
            ? 'Updating...'
            : isOnDuty ? 'Go Off Duty' : 'Go On Duty'
          }
        </button>

        <button
          onClick={logout}
          className="w-full py-3 bg-slate-100 hover:bg-slate-200
                     text-slate-600 font-medium rounded-xl transition-colors"
        >
          Sign out
        </button>
      </div>
    </PageWrapper>
  )
}

export default ProfilePage