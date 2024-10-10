export type ItemType = 'file' | 'folder';

export interface Item {
  id: string;
  extension?: string;
  items?: Item[];
  itemsCount?: number;
  name: string;
  size: number;
  type: ItemType;
  createdAt?: number | null;
}
