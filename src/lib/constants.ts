export const LANGUAGES = [
  'German',
  'English',
  'Muted',
  'French',
  'Japanese',
  'Italian',
  'Spanish',
  'Portuguese',
  'Danish',
  'Finnish',
  'Swedish',
  'Norwegian',
  'Dutch',
  'Czech',
  'Polish',
  'Turkish',
  'Hungarian',
  'Bulgarian',
  'Russian',
  'Chinese',
  'Korean'
] as const;

export const FSK_RATINGS = ['FSK-0', 'FSK-6', 'FSK-12', 'FSK-16', 'FSK-18'] as const;

export const FORMATS = ['MKV', 'AVI', 'MPEG', 'IMG', 'IFO', 'WMV', 'MP4', 'DIVX', 'FLV'] as const;

export const TAGS = [
  'Low Quality',
  'Missing Time',
  'Broken File',
  'Watch later',
  'Wrong Language',
  'Watch never',
  'CamRip',
  'MicDubbed',
  'Cancelled'
] as const;

export const SCORES = [
  'Crappy Movie',
  'Bad Movie',
  'Not recommended',
  'Good enough',
  'Recommended',
  'Masterpiece',
  'Unset',
  'Average'
] as const;

export const GENRES = [
  'NO_GENRE',
  'Disaster Movie',
  'Road Movie',
  'Western',
  'Italo-Western',
  'Sentimental film',
  'Thriller',
  'Actionthriller',
  'Psychothriller',
  'Science Fiction',
  'Comedy',
  'Slapstick-Comedy',
  'Screwball-Comedy',
  'Gangstermovie',
  'Crime Story',
  'War Movie',
  'Porno',
  'Softporno',
  'Hardcore-Porno',
  'Actionmovie',
  'Animation',
  'Cartoon',
  'Anime',
  'Stop-Motion-Movie',
  'Puppet Movie',
  'Claymation',
  'Computer Animation Movie',
  'Martial-Arts-Movie',
  'Samuraimovie',
  'Horror Movie',
  'Slasher',
  'Teenhorror',
  'Creature',
  'ComingOfAge',
  'Documentary',
  'Adventure',
  'Romance',
  'Mystery',
  'Fantasy',
  'Family',
  'Drama',
  'Anti-War Movie',
  'Biographie',
  'Sport',
  'Music',
  'Musical',
  'History',
  'Film Noir',
  'Kids movie',
  'Soap opera',
  'Slice of Life',
  'Shounen',
  'Shoujo',
  'School',
  'Mecha',
  'Parody',
  'Isekai',
  'Seinen'
] as const;

export const PAGE_SIZE = 48;

export type Language = (typeof LANGUAGES)[number];
export type FskRating = (typeof FSK_RATINGS)[number];
export type Format = (typeof FORMATS)[number];
export type Tag = (typeof TAGS)[number];
export type Score = (typeof SCORES)[number];
export type Genre = (typeof GENRES)[number];
