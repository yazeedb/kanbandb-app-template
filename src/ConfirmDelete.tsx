import React, { FC } from 'react';
import { Modal, Button, Icon } from 'rsuite';

interface ConfirmDeleteProps {
  onSubmit: () => void;
  onClose: () => void;
}

export const ConfirmDelete: FC<ConfirmDeleteProps> = ({
  onSubmit,
  onClose
}) => (
  <>
    <Modal.Header style={{ display: 'flex', alignItems: 'center' }}>
      <Icon
        icon="remind"
        style={{
          color: '#ffb300',
          fontSize: '32px',
          marginRight: '15px'
        }}
      />

      <h3>Are you sure?</h3>
    </Modal.Header>

    <Modal.Body>
      <h5 style={{ fontWeight: 'normal' }}>
        Once you delete this task, you cannot recover it.
      </h5>
    </Modal.Body>

    <Modal.Footer>
      <Button onClick={onSubmit} appearance="primary" color="red">
        Delete forever
      </Button>
      <Button onClick={onClose} appearance="subtle">
        Cancel
      </Button>
    </Modal.Footer>
  </>
);
