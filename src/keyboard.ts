/** a keyboard handler
 *
 * this is basically entirely taken from
 * https://github.com/kittykatattack/learningPixi
 *
 * NOTE: this will change at some point to handle input in the main game loop
 */


/** make a key handler */
export function add_key(event_queue: Event[], key_str: string): () => void {
  const down_handle = (event: KeyboardEvent) => {
    if (event.key === key_str) {
      event_queue.push(event);

      event.preventDefault();
    }
  };

  const up_handle = (event: KeyboardEvent) => {
    if (event.key === key_str) {
      event_queue.push(event);

      event.preventDefault();
    }
  };

  // Detach event listeners
  const unsubscribe = function () {
    window.removeEventListener("keydown", down_handle);
    window.removeEventListener("keyup", up_handle);
  };

  window.addEventListener("keydown", down_handle, false);

  window.addEventListener("keyup", up_handle, false);

  return unsubscribe;
}
