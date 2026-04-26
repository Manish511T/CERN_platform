import {
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  SkeletonCard,
  SkeletonButton,
} from "../../../shared/components/ui/Skeleton"; // adjust path

const AuthPageSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center gap-4">
        <SkeletonCircle size={64} />
        <Skeleton width={220} height={24} />
        <Skeleton width={260} height={14} />
      </div>

      {/* Card */}
      <SkeletonCard className="w-full max-w-md">
        <div className="flex flex-col gap-5">
          
          {/* Title */}
          <Skeleton width={120} height={20} />

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Skeleton width={100} height={12} />
            <Skeleton height={44} />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Skeleton width={120} height={12} />
            <Skeleton height={44} />
          </div>

          {/* Button */}
          <SkeletonButton fullWidth />

          {/* Footer text */}
          <div className="flex justify-center">
            <Skeleton width={180} height={12} />
          </div>
        </div>
      </SkeletonCard>

      {/* Bottom text */}
      <div className="mt-6">
        <Skeleton width={200} height={12} />
      </div>
    </div>
  );
};

export default AuthPageSkeleton;