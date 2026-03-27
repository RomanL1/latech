import { Flex, Tabs } from '@radix-ui/themes';
import { LucideFile, LucideSettings } from 'lucide-react';
import styles from './SideNavigationBar.module.css';
import FileTree from '../file-tree/FileTree';

const SideNavigationBar = () => (
  <Tabs.Root defaultValue="file" orientation="vertical">
    <Flex className={styles.container}>
      <Tabs.List className={styles.sidebar}>
        <Tabs.Trigger value="file">
          <LucideFile />
        </Tabs.Trigger>
        <Tabs.Trigger value="settings">
          <LucideSettings />
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="file">
        <Flex align="center" gap="2" p="3">
          <FileTree />
        </Flex>
      </Tabs.Content>
      <Tabs.Content value="settings">
        <Flex align="center" gap="2">
          <LucideSettings />
          Settings content
        </Flex>
      </Tabs.Content>
    </Flex>
  </Tabs.Root>
);

export default SideNavigationBar;
