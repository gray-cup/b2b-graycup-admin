import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { DashboardLayout } from '@/app/components/dashboard-layout'
import { ConsumerProductRequestsTable } from './table'

export default async function ConsumerProductRequestsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <DashboardLayout>
      <ConsumerProductRequestsTable />
    </DashboardLayout>
  )
}
