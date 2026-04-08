import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import React from 'react'
import { PageTemplate } from '@/components/PageTemplate'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  const page = result.docs[0]

  if (!page) {
    return notFound()
  }

  return <PageTemplate page={page} />
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const pages = await payload.find({
    collection: 'pages',
    limit: 100,
    select: {
      slug: true,
    },
  })

  return pages.docs.map(({ slug }) => ({
    slug,
  }))
}
