'use client'
import { useEffect } from 'react'

export default function BodyAttributeSetter() {
  useEffect(() => {
    const accent = localStorage.getItem('alminbar-accent') || 'gold'
    const density = localStorage.getItem('alminbar-density') || 'editorial'
    const tessellation = localStorage.getItem('alminbar-tessellation') || 'on'
    document.body.dataset.accent = accent
    document.body.dataset.density = density
    document.body.dataset.tessellation = tessellation
  }, [])
  return null
}
