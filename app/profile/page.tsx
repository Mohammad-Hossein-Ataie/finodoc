import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { getSession } from '@/lib/auth';
import ProfileForm from './ProfileForm';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  await dbConnect();
  const user = await User.findById((session as any).userId)
    .select({ name: 1, mobile: 1, role: 1, email: 1 })
    .lean();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <ProfileForm
        user={{
          _id: String((user as any)._id),
          name: user.name || '',
          mobile: user.mobile || '',
          role: user.role || 'user',
          email: user.email || '',
        }}
      />
    </div>
  );
}
