import React from 'react'
import { Typography, Box } from '@mui/material'

export const RichText: React.FC<{ data: any }> = ({ data }) => {
  if (!data || !data.root || !data.root.children) return null

  return (
    <Box>
      {data.root.children.map((node: any, i: number) => {
        if (node.type === 'paragraph') {
          return (
            <Typography key={i} variant="body1" paragraph>
              {node.children?.map((child: any, j: number) => {
                if (child.type === 'text') {
                  return <span key={j}>{child.text}</span>
                }
                return null
              })}
            </Typography>
          )
        }
        if (node.type === 'heading') {
          const variant = `h${node.tag.replace('h', '')}` as any
          return (
            <Typography key={i} variant={variant} gutterBottom>
              {node.children?.map((child: any, j: number) => {
                if (child.type === 'text') {
                  return <span key={j}>{child.text}</span>
                }
                return null
              })}
            </Typography>
          )
        }
        return null
      })}
    </Box>
  )
}
