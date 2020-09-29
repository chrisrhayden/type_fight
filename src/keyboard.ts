/** a keyboard handler */

export function make_default_keys(
  keys: Record<string, () => void>,
  events: KeyboardEvent[]
): boolean {
  keys["w"] = add_key(events, "w");
  keys["d"] = add_key(events, "d");
  keys["a"] = add_key(events, "a");
  keys["s"] = add_key(events, "s");

  // up-right
  keys["e"] = add_key(events, "e");
  // up-left
  keys["q"] = add_key(events, "q");
  // down-right
  keys["x"] = add_key(events, "x");
  // down-left
  keys["z"] = add_key(events, "z");

  keys["ArrowUp"] = add_key(events, "ArrowUp");
  keys["ArrowDown"] = add_key(events, "ArrowDown");
  keys["ArrowLeft"] = add_key(events, "ArrowLeft");
  keys["ArrowRight"] = add_key(events, "ArrowRight");

  return true;
}

/** make a key handler */
export function add_key(event_queue: Event[], key_str: string): () => void {
  const up_handle = (event: KeyboardEvent) => {
    if (event.key === key_str) {
      event_queue.push(event);

      event.preventDefault();
    }
  };

  const down_handle = (event: KeyboardEvent) => {
    if (event.key === key_str) {
      event_queue.push(event);

      event.preventDefault();
    }
  };

  // Detach event listeners
  const unsubscribe = function () {
    window.removeEventListener("keyup", up_handle);
    window.removeEventListener("keydown", down_handle);
  };

  window.addEventListener("keyup", up_handle, false);
  window.addEventListener("keydown", down_handle, false);

  return unsubscribe;
}
