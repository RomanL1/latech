import { useEffect, useMemo, useState } from 'react';
import type { WebsocketProvider } from 'y-websocket';

interface CursorsProps {
  yProvider: WebsocketProvider;
}

type AwarnessUserList = Map<number, AwarnessUser>;

type AwarnessUser = {
  clientId: string;
  user: {
    name: string;
    color: string;
  };
};

const Cursors = ({ yProvider }: CursorsProps) => {
  const [awarenessUsers, setAwarenessUsers] = useState<AwarnessUserList>(new Map());

  console.log(awarenessUsers);

  useEffect(() => {
    // Add user info to Yjs awareness
    yProvider.awareness.setLocalStateField('user', {
      color: '#fcba03',
    });

    // On changes, update `awarenessUsers`
    function setUsers() {
      // setAwarenessUsers(new Map(yProvider.awareness.getStates()));
      setAwarenessUsers(new Map());
    }
    yProvider.awareness.on('change', setUsers);
    setUsers();

    return () => {
      yProvider.awareness.off('change', setUsers);
    };
  }, [yProvider]);

  const styleSheet = useMemo(() => {
    let cursorStyles = '';

    for (const [clientId, client] of awarenessUsers) {
      if (client?.user) {
        cursorStyles += `
          .yRemoteSelection-${clientId}, 
          .yRemoteSelectionHead-${clientId} {
            --user-color: ${client.user.color};
          }

          .yRemoteSelectionHead-${clientId}::after {
            content: "${'User-' + clientId}";
          }
        `;
      }
    }

    return { __html: cursorStyles };
  }, [awarenessUsers]);
  return <style dangerouslySetInnerHTML={styleSheet} />;
};

export default Cursors;
