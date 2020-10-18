import React, { useState } from 'react';
import { useMachine } from '@xstate/react';

import { boardMachine } from './boardMachine';
import './App.scss';
import {
  Dropdown,
  Form,
  FormControl,
  Icon,
  IconButton,
  Modal,
  Panel
} from 'rsuite';
import { UpdateCard } from './UpdateCard';
import { ConfirmDelete } from './ConfirmDelete';

const App = () => {
  const [{ matches, context }, send] = useMachine(boardMachine, {
    devTools: true
  });

  const [inputValue, setInputValue] = useState('');
  const resetInputValue = () => setInputValue('');

  const loading = ['adding', 'deleting'].some((v) =>
    matches(`viewingCards.${v}`)
  );

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
                <Panel shaded bordered bodyFill key={card.id} className="card">
                  <Panel
                    header={
                      <div className="card-header">
                        <span className="card-name">{card.name}</span>

                        <div>
                          <IconButton
                            icon={<Icon icon="edit2" />}
                            className="edit-card"
                            loading={loading}
                            onClick={() => {
                              send({ type: 'UPDATE_CARD', card });
                            }}
                          />

                          <IconButton
                            icon={<Icon icon="trash2" />}
                            loading={loading}
                            onClick={() => send({ type: 'DELETE_CARD', card })}
                          />
                        </div>
                      </div>
                    }
                  >
                    <p>{card.description}</p>
                  </Panel>
                </Panel>
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

      <Modal
        show={matches('viewingCards.updating')}
        onHide={() => send('EXIT')}
      >
        <UpdateCard
          card={context.pendingCard}
          onClose={() => send('EXIT')}
          onSubmit={(name, description) =>
            send({
              type: 'SUBMIT_UPDATES',
              card: {
                ...context.pendingCard,
                name,
                description
              }
            })
          }
        />
      </Modal>

      <Modal
        backdrop="static"
        show={matches('viewingCards.confirmingDelete')}
        onHide={() => send('EXIT')}
      >
        <ConfirmDelete
          onSubmit={() => send('CONFIRM_DELETE')}
          onClose={() => send('EXIT')}
        />
      </Modal>
    </main>
  );
};

export default App;
