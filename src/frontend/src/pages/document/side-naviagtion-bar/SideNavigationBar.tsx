import { Flex, Tabs } from '@radix-ui/themes';
import { LucideFile, LucideSettings } from 'lucide-react';
import styles from './SideNavigationBar.module.css';
import FileTree from '../file-tree/FileTree';
import type { SampleFile } from '../sampleData';

interface SideNavigationBarProps {
  selectedFile?: SampleFile;
  setSeledtedFile: (file: SampleFile) => void;
}

const SideNavigationBar = ({ selectedFile, setSeledtedFile }: SideNavigationBarProps) => (
  <Tabs.Root defaultValue="file" orientation="vertical" className={styles.container}>
    <Flex className={styles.container}>
      <Tabs.List className={styles.sidebar}>
        <Tabs.Trigger value="file">
          <LucideFile />
        </Tabs.Trigger>
        <Tabs.Trigger value="settings">
          <LucideSettings />
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="file" className={styles.content}>
        <FileTree selectedFile={selectedFile} setSelectedFile={setSeledtedFile} />
      </Tabs.Content>
      <Tabs.Content value="settings" className={styles.content}>
        <Flex align="center" gap="2">
          <LucideSettings />
          Settings content
        </Flex>
      </Tabs.Content>
    </Flex>
  </Tabs.Root>
);

export default SideNavigationBar;
