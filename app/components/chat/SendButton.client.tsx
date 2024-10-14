import React, { memo } from 'react';
import { IconButton } from '~/components/ui/IconButton';
import { classNames } from '~/utils/classNames';

interface SendButtonProps {
  show: boolean;
  isStreaming: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  sendIcon?: React.ReactNode;
  stopIcon?: React.ReactNode;
  sendLabel?: string;
  stopLabel?: string;
  className?: string;
}

export const SendButton: React.FC<SendButtonProps> = memo(
  ({
    show,
    isStreaming,
    onClick,
    sendIcon = <div className="i-bolt:send text-xl" aria-hidden="true" />,
    stopIcon = <div className="i-bolt:stop text-xl" aria-hidden="true" />,
    sendLabel = 'Send message',
    stopLabel = 'Stop generating',
    className,
  }) => {
    if (!show) {
      return null;
    }

    return (
      <IconButton
        className={classNames(
          'absolute bottom-3 right-3',
          isStreaming ? 'text-bolt-elements-textTertiary' : 'text-bolt-elements-textPrimary',
          className,
        )}
        onClick={onClick}
        aria-label={isStreaming ? stopLabel : sendLabel}
      >
     {React.isValidElement(isStreaming ? stopIcon : sendIcon) ? (isStreaming ? stopIcon : sendIcon) : null}
      </IconButton>
    );
  },
);
SendButton.displayName = 'SendButton';
