import { Component, type ReactNode } from 'react';
import { failWebgl } from '@/app/bootstrap';

/**
 * Last line of defense: any render/init error inside the R3F tree (shader
 * compile failure, driver quirk, context creation edge case) tears the
 * canvas down and hands the page to the static premium fallback. The DOM
 * layer owns all real content, so nothing is lost but motion.
 */
interface Props {
  children: ReactNode;
}
interface State {
  failed: boolean;
}

export class WebGLErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: unknown): void {
    console.error('[terra-stone] WebGL error boundary tripped:', error);
    failWebgl();
  }

  override render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
