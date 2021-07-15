/** a keyboard handler */

export function makeDefaultKeys(
  keys: Record<string, () => void>,
  events: KeyboardEvent[]
): boolean {
  keys["w"] = addKey(events, "w");
  keys["d"] = addKey(events, "d");
  keys["a"] = addKey(events, "a");
  keys["s"] = addKey(events, "s");

  // up-right
  keys["e"] = addKey(events, "e");
  // up-left
  keys["q"] = addKey(events, "q");
  // down-right
  keys["x"] = addKey(events, "x");
  // down-left
  keys["z"] = addKey(events, "z");

  keys["ArrowUp"] = addKey(events, "ArrowUp");
  keys["ArrowDown"] = addKey(events, "ArrowDown");
  keys["ArrowLeft"] = addKey(events, "ArrowLeft");
  keys["ArrowRight"] = addKey(events, "ArrowRight");

  return true;
}

/** make a key handler */
export function addKey(eventQueue: Event[], keyStr: string): () => void {
  const upHandle = (event: KeyboardEvent) => {
    if (event.key === keyStr) {
      eventQueue.push(event);

      event.preventDefault();
    }
  };

  const downHandle = (event: KeyboardEvent) => {
    if (event.key === keyStr) {
      eventQueue.push(event);

      event.preventDefault();
    }
  };

  // Detach event listeners
  const unsubscribe = function () {
    window.removeEventListener("keyup", upHandle);
    window.removeEventListener("keydown", downHandle);
  };

  window.addEventListener("keyup", upHandle, false);
  window.addEventListener("keydown", downHandle, false);

  return unsubscribe;
}
