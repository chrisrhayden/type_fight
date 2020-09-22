// https://github.com/kittykatattack/learningPixi

class Key {
  value: string;

  press: () => void;
  release: () => void;

  down_handle: (evt: KeyboardEvent) => void;
  up_handle: (evt: KeyboardEvent) => void;

  unsubscribe: () => void;

  constructor() {
    this.value = "";

    this.press = null;
    this.release = null;
  }
}

/** keyboard handler */
export function add_key(key_str: string): Key {
  const key = new Key();

  key.value = key_str;
  key.press = () => null;
  key.release = () => null;

  key.down_handle = (event: KeyboardEvent) => {
    if (event.key === key.value) {
      key.press();

      event.preventDefault();
    }
  };

  key.up_handle = (event: KeyboardEvent) => {
    if (event.key === key.value) {
      key.release();

      event.preventDefault();
    }
  };

  const down_handle = key.down_handle.bind(key);
  const up_handle = key.up_handle.bind(key);

  // Detach event listeners
  key.unsubscribe = function () {
    window.removeEventListener("keydown", down_handle);
    window.removeEventListener("keyup", up_handle);
  };

  window.addEventListener("keydown", down_handle, false);

  window.addEventListener("keyup", up_handle, false);

  return key;
}
