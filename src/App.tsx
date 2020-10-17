import React from 'react';
import { useMachine } from '@xstate/react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { boardMachine } from './boardMachine';
import './App.scss';

const App = () => {
  const [{ matches, context }, send] = useMachine(boardMachine, {
    devTools: true
  });

  return (
    <main>
      <section className="columns">
        {context.columns.map((column) => (
          <div className="column">
            <header className="column-header">
              <h2>{column.name}</h2>
            </header>

            <section className="column-body">
              {column.cards.map((card) => (
                <div className="card">
                  <header className="card-header">
                    <span className="name">{card.name}</span>

                    <button className="edit-card">
                      <FaEdit />
                    </button>

                    <button className="delete-card">
                      <FaTrash />
                    </button>
                  </header>

                  <section className="card-description">
                    {card.description}
                  </section>
                </div>
              ))}
            </section>
          </div>
        ))}
      </section>
    </main>
  );
};

export default App;
