import { useMemo } from 'react';
import type { AwarenessUserList } from '../LatexEditor';

interface CursorsProps {
  awarenessUsers: AwarenessUserList;
}

const Cursors = ({ awarenessUsers }: CursorsProps) => {
  const styleSheet = useMemo(() => {
    let cursorStyles = '';

    for (const [clientId, client] of awarenessUsers) {
      if (!client.user?.color) continue;

      cursorStyles += `
      .yRemoteSelection-${clientId}, 
      .yRemoteSelectionHead-${clientId} {
        --user-color: ${client.user.color};
      }

      .yRemoteSelectionHead-${clientId}::after {
        content: "${client.user.name ?? `User-${clientId}`}";
      }
    `;
    }

    return { __html: cursorStyles };
  }, [awarenessUsers]);

  return <style dangerouslySetInnerHTML={styleSheet} />;
};

export default Cursors;
