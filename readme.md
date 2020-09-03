# Deleting Items with Redux

## Objectives

With this lesson we will continue through our journey through Redux. By the end of
this lesson, you will be able to:

  * Delete individual elements

## Review and Goal

Throughout each code along in this section, notice that we are never updating
the DOM directly. Instead, we use the Redux pattern to have our store hold and
update our state, and we then have React display that state. We want to continue
with this pattern here.  

For this code along, we will continue to work on our Todo application. Our goal 
this time is to add a delete button next to each todo in the list. When a user 
clicks on the delete button for a todo, that todo should be removed from the 
store's state and the DOM should rerender to show the shortened list.

## Deleting A Todo

To implement our delete button, we will create an event handler that dispatches 
a delete action when the button is clicked. Eventually, we'll need to figure out
how to tell the store which todo to delete. For now, though, let's add in the 
button and get the handler for the button's click event set up.

#### Modifying our TodosContainer

Recall that we set up Todo as a presentational component and connected the
TodosContainer to __Redux__. To stick with this organization, let's write a 
new `mapDispatchToProps()` function in TodosContainer to return a delete 
action:


```javascript
// ./src/components/todos/TodosContainer.js
import React, { Component } from 'react';
import { connect } from 'react-redux'
import Todo from './Todo'

class TodosContainer extends Component {

  renderTodos = () => this.props.todos.map((todo, id) => <Todo key={id} text={todo} />)

  render() {
    return(
      <div>
        {this.renderTodos()}
      </div>
    );
  }
};

const mapStateToProps = state => {
  return {
    todos: state.todos
  }
}

const mapDispatchToProps = dispatch => {
  return {
    delete: todoText => dispatch({type: 'DELETE_TODO', payload: todoText })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TodosContainer);
```

Now, TodosContainer will have access to `this.props.delete`, which takes in the
todo text as an argument and sends it as the action's `payload`. 

Next, we need to _pass_ `this.props.delete` down to Todo, so that each Todo component rendered will have access to our 'DELETE_TODO' action:


```js
renderTodos = () => this.props.todos.map((todo, id) => <Todo delete={this.props.delete} key={id} text={todo} />)

```

#### Modifying the Todo Component

Now that `Todo` is receiving `this.props.delete`, let's add our button and get it
hooked up:

```js
import React from 'react';

const Todo = props => {
  return (
    <li>
      <span>{props.text}</span><button>DELETE</button>
    </li>
  )
}

export default Todo;
```

When we click the button next to a given todo we want that specific todo to be 
removed, so let's add an `onClick` attribute to the delete button. Recall that, 
at the moment, our todos are just strings stored in an array. That's all we have 
to work with for now, but we'll change that a bit later. 

To keep this component small, we can provide an anonymous function in-line:

```js
<li>
  <span>{props.text}</span><button onClick={() => props.delete(props.text)}>DELETE</button>
</li>
```

So, what is happening here? We're providing a definition for an anonymous
function. _Inside_ the definition, we're calling `props.delete`, and passing in
`props.text` as the argument. When the delete button is clicked, back in our 
connected TodosContainer the value of `props.text` is passed into our dispatched 
action as the payload.

Let's boot up the app and check out what we've done so far. There is a 
`console.log` in our reducer that displays actions. If you create a todo then 
click the delete button, you should see an action logged in the console that has 
the todo's text content as the payload.

Ok, now we have the ability to dispatch an action to the reducer from each Todo!

## Tell the Store Which Todo to Delete

Because our todos are stored as strings in an array, to delete a todo, we need 
to find a way to remove a specific string from an array. One option is to use 
`filter`. Let's add a second case to our `manageTodo` reducer; in it, we'll 
write a `filter` that returns every todo that _doesn't_ match what is contained 
in `action.payload`:

```js
export default function manageTodo(state = {
  todos: [],
}, action) {
  console.log(action);
  switch (action.type) {
    case 'ADD_TODO':

      return { todos: state.todos.concat(action.payload.text) };

    case 'DELETE_TODO':

      return {todos: state.todos.filter(todo => todo !== action.payload)}

    default:
      return state;
  }
}
```

In our browser, the delete button should now successfully cause todos to
disappear!

There is a problem though. What if you have multiple todos with the same text?
With this set up, every todo that matches `action.payload` will be filtered out.

To fix this, we can give our Todos specific IDs and filter on those instead.

#### Give each Todo an id

A Todo should have an id the moment it gets created. Since the Todo is created in 
our reducer when a CREATE_TODO action is dispatched, let's update that code so 
that it also adds an id.

```javascript
// ./src/reducers/manageTodo.js
import uuid from 'uuid';

export default function manageTodo(state = {
  todos: [],
}, action) {
  console.log(action);
  switch (action.type) {
    case 'ADD_TODO':

      const todo = {
        id: uuid(),
        text: action.payload.text
      }
      return { todos: state.todos.concat(todo) };

    case 'DELETE_TODO':

      return {todos: state.todos.filter(todo => todo !== action.payload)}

    default:
      return state;
  }
}
```

We are using the `uuid` node package to generate an id each time a todo is created; 
don't forget to import it at the top of the file. Now, instead of just storing an 
array of strings in our store, we'll be storing an array of objects, each of which 
has an id and the todo text.

Next we need to update our TodosContainer and Todo component to finish hooking up
our delete action.

#### Update TodosContainer

In TodosContainer, our `renderTodos` method will need to change a little:

```js
renderTodos = () => {
  return this.props.todos.map(todo => <Todo delete={this.props.delete} key={todo.id} todo={todo} />)
}
```

The change is small, but this setup is definitely better. Previously, `key` was
based off the _index_ provided by `map` which is not the best approach. Now it's 
using our randomly generated ID, and is less prone to errors in the virtual DOM. 

The other change is that we are now passing the todo *object* as a prop rather than
just the text. This will enable us to access both `todo.id` and `todo.text` in our 
Todo component.

#### Update the Todo Component

Next, we need to modify the Todo component to work with the todo *object*. To do 
this, we will render `props.todo.text` (instead of `props.text`) and pass 
`props.todo.id` (instead of `props.text`) as the argument to our delete function 
when the button is clicked:

```js
import React from 'react'

const Todo = props => {
  return (
    <li>
      <span>{props.todo.text}</span><button onClick={() => props.delete(props.todo.id)}>DELETE</button>
    </li>
  )
}

export default Todo;
```

Now, when `props.delete` is called, an action is dispatched that contains the _id_ 
as its payload rather than the text.

#### Updating `DELETE_TODO` in the Reducer

Finally, now that we're passing an _id_ to `props.delete`, we need to make one 
more tiny change to our reducer:

```js
case 'DELETE_TODO':

  return {todos: state.todos.filter(todo => todo.id !== action.payload)}
```

Now that `todo` is an object and we're passing the id as the payload, we need 
to match `todo.id` with the payload instead of `todo`.

With this final change, todo objects can be added and deleted, each with their
own unique id!

## Summary

Ok, so in this lesson we covered how to delete a specific Todo. To implement
this, we gave each Todo a unique id, and then made sure we passed that id into
each Todo component. Then we sent along that information when dispatching an 
action via `props.delete`. Finally, we had our reducer update the state by 
filtering out the Todo with the id that was passed as the action's payload.
