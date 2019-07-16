/** @jsx jsx */
import { jsx } from 'theme-ui'
import { useState, useEffect } from 'react'
import useDeck from '../hooks/use-deck'
import { modes } from '../constants'

export default props => {
  const [height, setHeight] = useState('100vh')
  const { mode } = useDeck()

  useEffect(() => {
    // handle mobile safari height
    setHeight(window.innerHeight)
    const handleResize = e => {
      setHeight(window.innerHeight)
    }
    const stopTouch = e => {
      if (mode !== modes.normal) return
      e.preventDefault()
    }
    window.addEventListener('resize', handleResize)
    document.body.addEventListener('touchstart', stopTouch)
    return () => {
      window.removeEventListener('resize', handleResize)
      document.body.removeEventListener('touchstart', stopTouch)
    }
  }, [mode])

  return (
    <div
      {...props}
      sx={{
        width: '100vw',
        height: mode !== modes.print ? height : '100vh',
        variant: 'styles.root',
        '*': {
          boxSizing: 'border-box',
        },
      }}
    />
  )
}
