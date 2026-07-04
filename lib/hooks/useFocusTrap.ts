'use client'

import { useEffect, type RefObject } from 'react'

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * Traps keyboard focus inside `ref` while `active`, moves focus in on mount,
 * and restores it to the previously-focused element on unmount. Makes an
 * overlay behave like a real modal dialog for keyboard + screen-reader users.
 */
export function useFocusTrap(ref: RefObject<HTMLElement>, active = true) {
  useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return
    const restoreTo = document.activeElement as HTMLElement | null

    const visibleFocusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      )

    // Move focus into the dialog (first control, or the container itself).
    const first = visibleFocusables()[0]
    ;(first ?? node).focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = visibleFocusables()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      const activeEl = document.activeElement
      if (e.shiftKey && activeEl === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && activeEl === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    node.addEventListener('keydown', onKey)
    return () => {
      node.removeEventListener('keydown', onKey)
      // Restore focus to whatever launched the overlay.
      restoreTo?.focus?.({ preventScroll: true })
    }
  }, [ref, active])
}
