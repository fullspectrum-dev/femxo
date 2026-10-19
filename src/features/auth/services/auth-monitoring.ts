export type AuthFailureEvent = {
  endpoint: string;
  status?: number;
  kind: "network" | "http" | "timeout" | "invalid_response";
};

export function reportAuthFailure(event: AuthFailureEvent) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<AuthFailureEvent>("femxo:auth-failure", {
      detail: event,
    })
  );
}
