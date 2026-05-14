import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { WarningCircleIcon } from "@phosphor-icons/react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[50vh] items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-danger/10">
              <WarningCircleIcon size={32} weight="duotone" className="text-danger" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-neutral-dark">
              Algo salió mal
            </h2>
            <p className="mb-6 text-sm text-neutral-dark/60">
              Ocurrió un error inesperado. Intentá recargar la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="cursor-pointer rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
