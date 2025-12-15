export type Action = {
  id: string;
  habit_id: string;
  start_time: string;
  end_time: string;
};

export type ActionBody = {
  habit_id: string;
  start_time: string;
  end_time: string;
};

export type Reading = {
  id: string;
  action_id: string;
  book_id: string;
  number_of_characters: number;
  breaths: number;
  number_of_characters_per_minute: number;
  number_of_breaths_per_minute: number;
};

export type BookType = {
  id: string;
  name: string;
  image:string;
  total_pages: number;
  average_of_characters_per_minute: number;
  current_page: number; //poner default value 0
};

export type BookBody = {
  name: string;
  image:string;
  total_pages: number;
  average_of_characters_per_minute: number;
  current_page: number; //poner default value 0
};
