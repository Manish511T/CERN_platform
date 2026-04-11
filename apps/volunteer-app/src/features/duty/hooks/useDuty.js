import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  setDutyStatus,
  setToggling,
  selectIsOnDuty,
  selectIsToggling,
} from '../../../store/slices/dutySlice'
import { setUser, selectUser } from '../../../store/slices/authSlice'
import { toggleDutyApi, updateLocationApi } from '../../auth/services/authApi'

const useDuty = () => {
  const dispatch    = useDispatch()
  const isOnDuty    = useSelector(selectIsOnDuty)
  const isToggling  = useSelector(selectIsToggling)
  const user        = useSelector(selectUser)

  const toggleDuty = async () => {
    dispatch(setToggling(true))
    try {
      const { data } = await toggleDutyApi()
      const newStatus = data.data.isOnDuty

      dispatch(setDutyStatus(newStatus))
      dispatch(setUser({ ...user, isOnDuty: newStatus }))

      if (newStatus) {
        // Going on duty — get location and update it
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords
            await updateLocationApi(latitude, longitude)
          },
          () => {},
          { enableHighAccuracy: true }
        )
        toast.success('You are now ON duty. Stay alert!', { icon: '🟢' })
      } else {
        toast.success('You are now OFF duty.', { icon: '🔴' })
      }
    } catch (err) {
      toast.error('Failed to toggle duty status.')
      dispatch(setToggling(false))
    }
  }

  return { isOnDuty, isToggling, toggleDuty }
}

export default useDuty