# avalon

[![Version Badge][version-image]][project-url]
[![License][license-image]][license-url]
[![Build Status][build-image]][build-url]

> JavaScript micro-framework for building single page web applications

## Install

Download the [CJS](https://github.com/ryanmorr/avalon/raw/master/dist/cjs/avalon.js), [ESM](https://github.com/ryanmorr/avalon/raw/master/dist/esm/avalon.js), [UMD](https://github.com/ryanmorr/avalon/raw/master/dist/umd/avalon.js) versions or install via NPM:

```sh
npm install @ryanmorr/avalon
```

## Usage

Avalon is an all-in-one solution to manage state, routing, and views for web apps:

```javascript
import avalon from '@ryanmorr/avalon';

const app = avalon({
    count: 0
});

app.mutation('increment', ({count}) => {
    return {
        count: count + 1
    };
});

app.action('handleClick', ({commit}) => {
    commit('increment');
});

app.view(parent, (html, {count}, dispatch) => html`
    <div>
        <p>Count: ${count}</p>
        <button onclick=${dispatch('handleClick')}>Increment</button>
    </div>
`);
```

Check out the [TodoMVC example](https://github.com/ryanmorr/avalon-todomvc).

## API

### `avalon(state?)`

Create an application instance with an initial state as a plain key/value object. The `title` property is reserved for the current document title, changing it will automatically update the document title:

```javascript
const app = avalon({
    title: 'Hello World',
    foo: 1,
    bar: 2
});
```

------

### `mutation(name, callback)`

Define a mutation by providing a name and a callback function that synchronously changes state by returning a partial state object that will be merged into the application state:

```javascript
app.mutation('foo', (state, payload) => {
    return {
        foo: payload
    };
});
```

------

### `commit(name, payload?)`

Call a mutation to update application state by providing its name and an optional payload, returns the partial state that resulted from the mutation:

```javascript
app.mutation('foo', (state, n) => ({foo: n + 10}));

app.commit('foo', 10); //=> {foo: 20}
```

------

### `action(name, callback)`

Define an action by providing a name and a callback function that can be used to respond to DOM event listeners, perform async operations, dispatch other actions, commit mutations, etc. The action callback function is provided an object of relevant data and convenience functions as the first parameter:

```javascript
app.action('foo', ({state, params, event, dispatch, commit, navigate, redirect, emit}) => {
    /**
     * state - the current state of the app
     * params - key/value object provided to the dispatcher or null if not provided
     * event - the event object of user triggered DOM events or null if not applicable
     * commit - function for calling mutations
     * dispatch - function for dispatching actions or routes
     * navigate - function for navigating to a URL path and dispatching a route
     * redirect - function for redirecting to a URL path and dispatching a route
     * emit - function for emitting a custom event
     */
});
```

To better support async operations, define a second parameter for resolving a call (and optionally a third parameter for rejecting a call) as part of the action callback function's signature. Dispatching an async action will automatically return a promise. Here's an example of how you might implement an async action to fetch data from the server:

```javascript
app.action('load', ({params, commit}, resolve, reject) => {
    commit('isLoading', true);
    request('/get', params).then((data) => {
        commit('isLoading', false);
        commit('setData', data);
        resolve(data);
    }).catch((error) => {
        commit('isLoading', false);
        commit('setError', error);
        reject(error);
    });
});

app.dispatch('load', {id: 'foo'}).then((data) => {
    // Handle data
}).catch((error) => {
    // Handle error
});
```

------

### `route(path, callback)`

Routes work exactly like actions, except they also respond to changes in the URL path, such as user-triggered click events and form submits, programmatic calls to the `navigate` and `redirect` methods, and moving forwards and backwards in the session history stack. A route must be defined with a leading forward slash:

```javascript
app.route('/foo', ({state, path, params, event, dispatch, commit, navigate, redirect, emit}) => {
    /**
     * state - the current state of the app
     * path - the URL path that matched the route
     * params - key/value object extracted from a route's parameters or null if it's a static route
     * event - the event object of user triggered DOM events or null if not applicable
     * commit - function for calling mutations
     * dispatch - function for dispatching actions or routes
     * navigate - function for navigating to a URL path and dispatching a route
     * redirect - function for redirecting to a URL path and dispatching a route
     * emit - function for emitting a custom event
     */
});
```

Routes support parameters, optional parameters, and wildcards:

```javascript
// Matches routes like "/a/b/c" and "/x/y/z"
app.route('/:foo/:bar/:baz', ({params: {foo, bar, baz}}) => {
    // Do something
});

// Matches routes like "/a/b" and "/a"
app.route('/:foo/:bar?', ({params: {foo, bar}}) => {
    // Do something
});

// Matches routes like "/", "/a", and "/a/b/c"
app.route('/*', ({params: {wildcard}}) => {
    // Do something
});
```

------

### `dispatch(name?, params?)`

Dispatch an action with optional parameters or a route. If no arguments are provided the current URL path is used by default. Returns the return value of the action/route callback function or a promise if it's an async action/route.

```javascript
// Dispatch an action with parameters
app.dispatch('foo', {foo: 1, bar: 2});

// Dispatch the first matching route (parameters are extracted from the URL path)
app.dispatch('/foo/bar/baz');

// Dispatching an async action/route returns a promise
app.dispatch('load').then((data) => {
    // Do something
})
```

------

### `view(element, callback)`

Define a view to be immediately rendered and automatically updated via virtual DOM when the state changes. The view callback function is provided a virtual DOM builder via tagged templates, the current state, and a convenient dispatch function for dispatching actions and routes as the result of a DOM event listener with optional parameters as a key/value object:

```javascript
app.view(parentElement, (html, state, dispatch) => html`
    <div>
        <p>Name: ${state.name}</p>
        <button onclick=${dispatch('handleClick', {foo: 1, bar: 2})}>Increment</button>
    </div>
`);
```

Views support attributes/properties, CSS styles as a string or object, event listeners indicated by a prefix of "on", keyed nodes for efficient list diffs, and stateless functional components:

``` javascript
const Item = (html, props, dispatch) => html`
    <li key=${props.id} onclick=${dispatch('handleClick', {id: props.id})}>
        ${props.children}
    </li>
`;

app.view(parentElement, (html, state) => html`
    <ul class="list">
        ${state.items.map((item) => html`
            <${Item} id=${item.id}>${item.name}<//>
        `)}
    </ul>
`);
```

------

### `navigate(path)`

Pushes a new entry onto the history stack with the provided URL path and dispatches the first matching route. Returns the return value of the route callback function or a promise if it's an async route:

```javascript
app.route('/foo', () => 'bar');

app.path(); //=> "/"
history.length; //=> 0

app.navigate('/foo'); //=> "bar"

app.path(); //=> "/foo"
history.length; //=> 1
```

------

### `redirect(path)`

Replaces the current history entry with the provided URL path and dispatches the first matching route. Returns the return value of the route callback function or a promise if it's an async route:

```javascript
app.route('/foo', () => 'bar');

app.path(); //=> "/"
history.length; //=> 0

app.redirect('/foo'); //=> "bar"

app.path(); //=> "/foo"
history.length; //=> 0
```

------

### `on(name, callback)`

Subscribe to application events, returns a function to remove that specific listener:

```javascript
// Listen for state changes
app.on('mutation', (name, nextState, prevState, partialState) => {
    // Do something
});

// Listen for when an action/route is dispatched
app.on('dispatch', (type, state, name, params, event, returnValue) => {
    // Do something
});

// Listen for when the URL path changes
app.on('pathchange', (path) => {
    // Do something
});

// Listen for when a view has been rendered
app.on('render', (parentElement) => {
    // Do something
});

// Define your own custom event with parameters
const stop = app.on('foo', (a, b, c, d) => {
    // Do something
});

// Stop listening for custom event
stop();
```

------

### `emit(name, ...args?)`

Trigger a custom event with optional arguments:

```javascript
app.on('foo', (a, b, c, d) => {
    // Do something
});

app.emit('foo', 1, 2, 3, 4);
```

------

### `state()`

Get the current state object:

```javascript
const app = avalon({
    title: 'Hello World'
    foo: 1,
    bar: 2
});

app.state(); //=> {title: "Hello World", foo: 1, bar: 2}
```

------

### `path()`

Get the current URL path:

```javascript
app.navigate('/foo');

app.path(); //=> "/foo"
```

------

### `use(plugin)`

Add a plugin by providing a callback function that is immediately invoked with the application instance and the current state. Returns the return value of the plugin callback function:

```javascript
// A simple logging plugin
const log = app.use((app, state) => {
    const events = [
        'mutation',
        'dispatch',
        'pathchange',
        'render'
    ];
    events.forEach((name) => app.on(name, console.log.bind(console, name)));
    return console.log.bind(console, 'avalon');
});
```

## License

This project is dedicated to the public domain as described by the [Unlicense](http://unlicense.org/).

[project-url]: https://github.com/ryanmorr/avalon
[version-image]: https://img.shields.io/github/package-json/v/ryanmorr/avalon?color=blue&style=flat-square
[build-url]: https://github.com/ryanmorr/avalon/actions
[build-image]: https://img.shields.io/github/actions/workflow/status/ryanmorr/avalon/node.js.yml?style=flat-square
[license-image]: https://img.shields.io/github/license/ryanmorr/avalon?color=blue&style=flat-square
[license-url]: UNLICENSE
