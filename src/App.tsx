import React, { useState } from 'react';
import { useMachine } from '@xstate/react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { boardMachine } from './boardMachine';
import './App.scss';
import { Dropdown, Form, FormControl } from 'rsuite';

const App = () => {
  const [{ matches, context }, send] = useMachine(boardMachine, {
    devTools: true
  });

  const [inputValue, setInputValue] = useState('');
  const resetInputValue = () => setInputValue('');

  return (
    <main>
      <section className="columns">
        {context.columns.map((column) => (
          <div className="column" key={column.id}>
            <header className="column-header">
              <h3>{column.name}</h3>
            </header>

            <section className="column-body">
              {column.cards.map((card) => (
                <div className="card" key={card.id}>
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

      <footer>
        <Form
          fluid
          onSubmit={() => {
            if (inputValue.trim().length === 0) {
              return;
            }

            send({
              type: 'ADD_CARD',
              name: inputValue,
              description: '',
              status: 'TODO'
            });

            resetInputValue();
          }}
        >
          <FormControl
            autoFocus
            size="lg"
            placeholder="What needs to be done?"
            value={inputValue}
            onChange={setInputValue}
          />

          <Dropdown
            title="Add card"
            placement="topStart"
            appearance="primary"
            size="lg"
            className="add-card"
            disabled={matches('viewingCards.adding')}
          >
            {context.columns.map((c, index) => (
              <Dropdown.Item
                appearance="primary"
                key={index}
                type="submit"
                onClick={() => {
                  send({
                    type: 'ADD_CARD',
                    name: inputValue,
                    description: '',
                    status: c.id
                  });

                  resetInputValue();
                }}
              >
                {c.name}
              </Dropdown.Item>
            ))}
          </Dropdown>
        </Form>
      </footer>
    </main>
  );
};

export default App;
