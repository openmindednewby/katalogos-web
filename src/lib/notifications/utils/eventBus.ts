


type NotificationEvent = 'signout' | 'success' | (string & {});

type Listener = (event: NotificationEvent, payload?: unknown) => void;

const listeners = new Set<Listener>();

export function addListener(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function notify<R>(event: NotificationEvent, payload?: R): void {
  for (const l of Array.from(listeners))
    try {
      l(event, payload);
    } catch {
      // ignore listener errors
    }

}

export function notifySignOut(message?: string): void {
  notify('signout', { message });
}

export function notifySuccess(message?: string): void {
  notify('success', { message });
}

export function notifyError(message?: string): void {
  notify('error', { message });
}
