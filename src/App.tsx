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
                            onClick={() => {
                              /*
                                NOTE: This is a hacky-hack...

                                In real apps, I create finite states like
                                "confirmingDelete", and show a custom confirmation
                                component, wired with
                                "CONFIRM" and "REJECT" transitions
                              */

                              // I repeat, HACK.
                              const confirmedDelete = window.confirm(
                                'Are you sure you want to delete this card?'
                              );

                              if (confirmedDelete) {
                                send({ type: 'DELETE_CARD', id: card.id });
                              }
                            }}
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
        show={matches('viewingCards.updating') && !!context.pendingCard}
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
    </main>
  );
};

export default App;
