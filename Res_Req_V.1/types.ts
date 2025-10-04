
export interface Resource {
  item_number: number;
  item_english: string;
  item_arabic: string;
  unit: string;
  category: string;
}

export interface RequestItem extends Resource {
  quantity: number;
}

export type Language = 'en' | 'ar';
