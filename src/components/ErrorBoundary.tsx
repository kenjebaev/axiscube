import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: (error: Error) => ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.state.error)
      return (
        <div className="p-6 text-sm text-red-400 bg-neutral-900 border border-red-900 rounded">
          <div className="font-semibold mb-2">Xato yuz berdi</div>
          <pre className="text-xs whitespace-pre-wrap text-red-300/80">
            {String(this.state.error.message || this.state.error)}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-3 px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-xs"
          >
            Qayta urinish
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
