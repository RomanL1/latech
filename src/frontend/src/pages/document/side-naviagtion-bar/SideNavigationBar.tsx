import { Tabs } from '@radix-ui/themes';
import { LucideFile, LucideSettings } from 'lucide-react';
import styles from './SideNavigationBar.module.css';
import FileTree from '../file-tree/FileTree';
import type { SampleFile } from '../sampleData';
import { useState } from 'react';

interface SideNavigationBarProps {
  selectedFile?: SampleFile;
  setSeledtedFile: (file?: SampleFile) => void;
}

const SideNavigationBar = ({ selectedFile, setSeledtedFile }: SideNavigationBarProps) => {
  const [selectedTab, setSelectedTab] = useState('file');

  return (
    <Tabs.Root
      defaultValue="file"
      orientation="vertical"
      value={selectedTab}
      onValueChange={setSelectedTab}
      className={styles.tabsRoot}
    >
      <Tabs.List className={styles.tabsList}>
        <Tabs.Trigger value="file">
          <LucideFile />
        </Tabs.Trigger>
        <Tabs.Trigger value="settings">
          <LucideSettings />
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="file" className={styles.tabsContent}>
        <FileTree selectedFile={selectedFile} setSelectedFile={setSeledtedFile} setSelectedTab={setSelectedTab} />
      </Tabs.Content>
      <Tabs.Content value="settings" className={styles.tabsContent}>
        <LucideSettings />
        Settings content
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default SideNavigationBar;
