// @ts-nocheck
import React from 'react';
import { registerComponent } from './container'

const MessageDecorator = registerComponent("MessageDecorator", [
  "useDecoratedMessage",
])<{ message: string }>(({ message, __deps }) => {
  const decoratedMessage = __deps.useDecoratedMessage(message);

  return <p>{decoratedMessage}</p>;
});

export default MessageDecorator;