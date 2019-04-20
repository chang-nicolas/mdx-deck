import React, { useReducer, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Router, globalHistory, navigate } from '@reach/router'
import { Global } from '@emotion/core'
import { Swipeable } from 'react-swipeable'
import merge from 'lodash.merge'

import Provider from './Provider'
import Slide from './Slide'
import Presenter from './Presenter'
import Overview from './Overview'
import Grid from './Grid'
import Print from './Print'
import GoogleFonts from './GoogleFonts'
import Catch from './Catch'
import Keyboard from './Keyboard'
import Storage from './Storage'
import Style from './Style'

const NORMAL = 'normal'
const PRESENTER = 'presenter'
const OVERVIEW = 'overview'
const GRID = 'grid'
const PRINT = 'print'
const modes = {
  NORMAL,
  PRESENTER,
  OVERVIEW,
  GRID,
  PRINT,
}

const BaseWrapper = props => <>{props.children}</>

const getIndex = ({ basepath }) => {
  const { pathname } = globalHistory.location
  const root = pathname.replace(basepath, '')
  const n = Number(root.split('/')[1])
  const index = isNaN(n) ? 0 : n
  return index
}

const mergeState = (state, next) =>
  merge({}, state, typeof next === 'function' ? next(state) : next)
const useState = init => useReducer(mergeState, init)

const getWrapper = mode => {
  switch (mode) {
    case PRESENTER:
      return Presenter
    case OVERVIEW:
      return Overview
    case GRID:
      return Grid
    default:
      return BaseWrapper
      break
  }
}

export const MDXDeck = props => {
  const { slides, basepath } = props

  const [state, setState] = useState({
    metadata: {},
    step: 0,
    mode: NORMAL,
  })

  const index = getIndex(props)

  const getMeta = i => {
    console.log('getMeta', i, state.metadata)
    return state.metadata[i] || {}
  }

  const register = (index, meta) => {
    setState({
      metadata: {
        ...state.metadata,
        [index]: {
          ...state.metadata[index],
          meta,
        },
      },
    })
  }

  const goto = nextIndex => {
    const current = getIndex(props)
    const reverse = nextIndex < current
    navigate(basepath + '/' + nextIndex)
    const meta = getMeta(nextIndex)
    setState({
      step: reverse ? meta.steps || 0 : 0,
    })
  }

  const previous = () => {
    const current = getIndex(props)
    const meta = getMeta(current)
    if (meta.steps && state.step > 0) {
      setState({ step: state.step - 1 })
    } else {
      const p = current - 1
      if (p < 0) return
      goto(p)
    }
  }

  const next = () => {
    const current = getIndex(props)
    const meta = getMeta(current)
    if (meta.steps && state.step < meta.steps) {
      setState({ step: state.step + 1 })
    } else {
      const n = current + 1
      if (n > slides.length - 1) return
      goto(n)
    }
  }

  const context = {
    ...state,
    update: setState,
    register,
    index,
    modes,
    goto,
    previous,
    next,
  }

  const [First] = slides
  const Wrapper = getWrapper(state.mode)

  return (
    <Provider {...props} {...context}>
      <Catch>
        <Style {...context} />
        <Keyboard {...props} {...context} />
        <Storage {...context} />
        <GoogleFonts />
        <Wrapper {...props} {...context}>
          <Swipeable onSwipedRight={previous} onSwipedLeft={next}>
            <Router basepath={basepath}>
              <Slide path="/" index={0} context={context}>
                <First path="/" />
              </Slide>
              {slides.map((Component, i) => (
                <Slide key={i} path={i + '/*'} index={i} {...context}>
                  <Component path={i + '/*'} />
                </Slide>
              ))}
              <Print path="print" {...props} />
            </Router>
          </Swipeable>
        </Wrapper>
      </Catch>
    </Provider>
  )
}

MDXDeck.propTypes = {
  slides: PropTypes.array.isRequired,
  headTags: PropTypes.array.isRequired,
}

MDXDeck.defaultProps = {
  basepath: '',
  slides: [],
  headTags: [],
}

export default MDXDeck
