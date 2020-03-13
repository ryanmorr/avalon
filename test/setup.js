let events = [];
const addEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function addEvent(type, fn) {
    events.push([this, type, fn]);
    addEventListener.call(this, type, fn);
};

afterEach(() => {
    events.forEach((args) => {
        const el = args.shift();
        el.removeEventListener(...args);
    });
    events = [];
});
