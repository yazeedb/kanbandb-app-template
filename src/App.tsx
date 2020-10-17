import React from 'react';
import './App.css';
import KanbanDB from 'kanbandb/dist/KanbanDB';

function initialize() {
  /**
   *
   * Use KanbanDB like so (but you might want to move it) - types are provided:
   *
   */

  KanbanDB.connect('');
}

function App() {
  // Initialize DB communications.
  initialize();

  return <main></main>;
}

export default App;
