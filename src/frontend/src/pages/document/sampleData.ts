export const sampleData: SampleFile[] = [
  {
    id: '1',
    name: 'file1.jpg',
    type: 'image/jpeg',
    path: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'file2.jpg',
    type: 'image/jpeg',
    path: 'https://s7g10.scene7.com/is/image/heliosgesundheit/AdobeStock_160449025:16-9',
  },
  {
    id: '3',
    name: 'file3.jpg',
    type: 'image/jpeg',
    path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Banana-Single.jpg/1920px-Banana-Single.jpg',
  },
  {
    id: '4',
    name: 'file4.jpg',
    type: 'image/jpeg',
    path: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=800&q=80',
  },
  { id: '5', name: 'test.tex', type: 'text/latex', content: `aaabbbccc\ncccc;` },
];

export type ImageFile = {
  id: string;
  name: string;
  type: 'image/jpeg';
  path: string;
};

export type LatexFile = {
  id: string;
  name: string;
  type: 'text/latex';
  content: string;
};

export type SampleFile = ImageFile | LatexFile;
