'use client'

import { useState, useMemo, useEffect } from 'react'
import { PageHeader } from '@/app/components/page-header'
import { Badge, Button, Text, Input, Select, toast } from '@medusajs/ui'
import { format } from 'date-fns'
import { useSubmissions, updateSubmission, deleteSubmission } from '@/lib/hooks/use-submissions'
import { DownloadButton } from '@/app/components/download-button'

interface ConsumerProductRequest {
  id: string
  name: string
  email: string
  phone: string
  category: string | null
  product_name: string
  details: string | null
  status: string
  resolved: boolean
  created_at: string
}

export function ConsumerProductRequestsTable() {
  const [filter, setFilter] = useState<'all' | 'resolved' | 'unresolved'>('unresolved')
  const [search, setSearch] = useState('')

  const resolvedParam = filter === 'all' ? null : filter === 'resolved' ? 'true' : 'false'
  const { data, isLoading, isValidating } = useSubmissions({
    table: 'Consumer_Product_Request',
    resolved: resolvedParam,
  })

  const filteredData = useMemo(() => {
    if (!search) return data as ConsumerProductRequest[]
    const searchLower = search.toLowerCase()
    return (data as ConsumerProductRequest[]).filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchLower)
      )
    )
  }, [data, search])

  useEffect(() => {
    setSearch('')
  }, [filter])

  const toggleResolved = async (id: string, currentValue: boolean) => {
    try {
      await updateSubmission('Consumer_Product_Request', id, !currentValue, resolvedParam)
      toast.success(currentValue ? 'Marked as unresolved' : 'Marked as resolved')
    } catch {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    try {
      await deleteSubmission('Consumer_Product_Request', id, resolvedParam)
      toast.success('Deleted successfully')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a')
    } catch {
      return dateString
    }
  }

  return (
    <>
      <PageHeader
        title="Consumer Product Requests"
        description="Product requests submitted by consumers"
        action={<DownloadButton tableName="Consumer_Product_Request" title="Consumer Product Requests" />}
      />

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3 items-center flex-wrap">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <Select.Trigger>
              <Select.Value placeholder="Filter" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="unresolved">Unresolved</Select.Item>
              <Select.Item value="resolved">Resolved</Select.Item>
              <Select.Item value="all">All</Select.Item>
            </Select.Content>
          </Select>
          {isValidating && !isLoading && (
            <Text className="text-xs text-ui-fg-muted">Updating...</Text>
          )}
        </div>
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-full sm:max-w-xs"
        />
      </div>

      {isLoading ? (
        <div className="p-8 text-center">
          <Text className="text-ui-fg-subtle">Loading...</Text>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="p-8 text-center bg-ui-bg-base rounded-lg border border-ui-border-base">
          <Text className="text-ui-fg-subtle">No consumer product requests found</Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="bg-ui-bg-base rounded-lg border border-ui-border-base p-4 flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <Text className="font-medium text-ui-fg-base truncate">{item.name}</Text>
                  <Text className="text-sm text-ui-fg-subtle">{item.email}</Text>
                </div>
                <Badge color={item.resolved ? 'green' : 'orange'} className="shrink-0">
                  {item.resolved ? 'Resolved' : 'Pending'}
                </Badge>
              </div>

              {/* Product Info */}
              <div className="bg-ui-bg-subtle rounded-md p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <Text className="text-xs text-ui-fg-muted uppercase tracking-wide">Product</Text>
                  {item.category && (
                    <Badge color="blue" className="text-xs">{item.category}</Badge>
                  )}
                </div>
                <Text className="font-medium text-ui-fg-base">{item.product_name}</Text>
              </div>

              {/* Details */}
              {item.details && (
                <div>
                  <Text className="text-xs text-ui-fg-muted uppercase tracking-wide mb-1">Details</Text>
                  <Text className="text-sm text-ui-fg-subtle line-clamp-2">{item.details}</Text>
                </div>
              )}

              {/* Contact Info */}
              <div className="text-sm space-y-1">
                <div className="flex gap-2">
                  <Text className="text-ui-fg-muted shrink-0">Phone:</Text>
                  <Text className="text-ui-fg-base">{item.phone}</Text>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-ui-border-base mt-auto">
                <Text className="text-xs text-ui-fg-muted">{formatDate(item.created_at)}</Text>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => toggleResolved(item.id, item.resolved)}
                  >
                    {item.resolved ? 'Unresolve' : 'Resolve'}
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <Text className="text-sm text-ui-fg-subtle">
          Showing {filteredData.length} of {data.length} items
        </Text>
      </div>
    </>
  )
}
