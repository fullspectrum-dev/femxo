/*
 * jsdom has no HTMLDialogElement.showModal()/close(). This stand-in only
 * toggles `open`, enough for component tests; the real modal behaviour
 * (focus trap, Esc, inert page) is covered by Playwright in a browser.
 * Import it from a Vitest setup file.
 */
if (typeof HTMLDialogElement !== "undefined" && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

export {};
