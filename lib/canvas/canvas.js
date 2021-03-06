export class Canvas {
  static #canvasProperties = ["width", "height", "style"];

  #isAutoSized;

  #canvasElement;
  #drawingContext;

  constructor(width, height) {
    this.#canvasElement = document.createElement("canvas");
    this.#drawingContext = this.#canvasElement.getContext("2d");

    this.resize(width, height);

    this.#insertToDocument();
    this.#listenToWindowResize();

    return new Proxy(this, this.#canvasProxyHandler);
  }

  // Public attributes
  get isAutoSized() {
    return this.#isAutoSized;
  }

  // Public methods
  resize(width, height) {
    this.#isAutoSized = width === undefined || height === undefined;

    if (this.#isAutoSized) {
      this.#autoSize();
    } else {
      this.#canvasElement.width = width;
      this.#canvasElement.height = height;
    }
  }

  clear() {
    this.#drawingContext.clearRect(0, 0, this.width, this.height);
  }

  // Private methods
  #autoSize() {
    this.#canvasElement.width = window.innerWidth;
    this.#canvasElement.height = window.innerHeight;
  }

  #insertToDocument() {
    const scriptElement = document.body.querySelector("script");
    const hasScriptElement = scriptElement !== null;

    if (hasScriptElement) {
      scriptElement.insertAdjacentElement("beforebegin", this.#canvasElement);
    } else {
      document.body.insertAdjacentElement("beforeend", this.#canvasElement);
    }
  }

  #listenToWindowResize() {
    window.addEventListener("resize", this.#onWindowResize.bind(this));
  }

  #onWindowResize() {
    if (!this.#isAutoSized) {
      return;
    }

    this.#canvasElement.width = window.innerWidth;
    this.#canvasElement.height = window.innerHeight;
  }

  get #canvasProxyHandler() {
    return {
      get: this.#proxyGetFunction.bind(this),
      set: this.#proxySetFunction.bind(this),
    };
  }

  #proxyGetFunction(target, property) {
    if (property in target) {
      return this.#wrapProxiedProperty(target, property);
    }

    if (Canvas.#canvasProperties.includes(property)) {
      return this.#wrapProxiedProperty(target.#canvasElement, property);
    }

    return this.#wrapProxiedProperty(target.#drawingContext, property);
  }

  #proxySetFunction(target, property, value) {
    if (property in target) {
      return (target[property] = value);
    }

    if (Canvas.#canvasProperties.includes(property)) {
      return (target.#canvasElement[property] = value);
    }

    return (target.#drawingContext[property] = value);
  }

  #wrapProxiedProperty(target, property) {
    if (typeof target[property] !== "function") {
      return target[property];
    }

    return (...args) => target[property].call(target, ...args);
  }
}
