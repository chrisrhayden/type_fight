// https://github.com/kittykatattack/learningPixi

class Key {
  value: string;
  is_down: boolean;
  is_up: boolean;

  press: () => void;
  release: () => void;

  down_handle: (evt: KeyboardEvent) => void;
  up_handle: (evt: KeyboardEvent) => void;

  unsubscribe: () => void;

  constructor() {
    this.value = "";
    this.is_down = false;
    this.is_up = true;

    this.press = null;
    this.release = null;
  }
}

// TODO: there should probably be a better event handler in general
export function add_key(key_str: string): Key {
  const key = new Key();

  key.value = key_str;
  key.is_down = false;
  key.is_up = true;
  key.press = undefined;
  key.release = undefined;

  // the is_* in the handlers are a little unnecessary i think
  // maybe to not get messed up by multiple key presses? unlikely
  key.down_handle = (event) => {
    if (event.key === key.value) {
      if (key.is_up && key.press) {
        key.press();
      }

      key.is_down = true;
      key.is_up = false;

      event.preventDefault();
    }
  };

  key.up_handle = (event) => {
    if (event.key === key.value) {
      if (key.is_down && key.release) {
        key.release();
      }

      key.is_down = false;
      key.is_up = true;

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

  window.addEventListener(
    "keydown", down_handle, false
  );

  window.addEventListener(
    "keyup", up_handle, false
  );

  return key;
}
