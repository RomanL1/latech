import { Group, Panel, Separator } from 'react-resizable-panels';
import LatexEditor from '../../shared/components/LatexEditor';
import SideNavigationBar from './side-naviagtion-bar/SideNavigationBar';

export function DocumentPage() {
  return (
    <Group>
      <Panel collapsible minSize="20%">
        <SideNavigationBar />
      </Panel>
      <Separator
        className="
    bg-slate-600
    [&[data-separator='hover']]:bg-slate-500
    [&[data-separator='active']]:bg-slate-400
  "
      />
      <Panel>
        <LatexEditor />
      </Panel>
    </Group>
  );
}
