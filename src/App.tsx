import React, { useState } from 'react';
import { useMachine } from '@xstate/react';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { boardMachine } from './boardMachine';
import './App.scss';
import {
  Button,
  ButtonToolbar,
  ControlLabel,
  Dropdown,
  Form,
  FormControl,
  FormGroup,
  HelpBlock,
  Icon,
  IconButton
} from 'rsuite';

const App = () => {
  const [{ matches, context }, send] = useMachine(boardMachine, {
    devTools: true
  });

  const [inputValue, setInputValue] = useState('');

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
            setInputValue('');
          }}
        >
          <FormControl
            autoFocus
            size="lg"
            placeholder="What needs to be done?"
            value={inputValue}
            onChange={setInputValue}
          />

          {/* <IconButton
            icon={<Icon icon="plus" />}
            size="lg"
            appearance="primary"
            type="submit"
            className="add-card"
          >
            ADD
          </IconButton> */}

          <Dropdown
            title="Add card"
            placement="topStart"
            appearance="primary"
            size="lg"
          >
            {context.columns.map((c, index) => (
              <Dropdown.Item appearance="primary" key={index} type="submit">
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
