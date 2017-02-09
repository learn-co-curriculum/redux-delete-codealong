import React, { Component } from 'react';

class Todo extends Component {

  handleOnClick() {
    this.props.store.dispatch({
      type: 'DELETE_TODO',
      id: this.props.id,
    });
  }

  render() {
    return (
      <li>
        {this.props.text}
        <button onClick={() => this.handleOnClick()}>X</button>
      </li>
    );
  }
};

export default Todo
