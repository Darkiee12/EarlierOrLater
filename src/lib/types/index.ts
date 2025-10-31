export interface Wikipedia {
  births: Event[];
  deaths: Event[];
  events: Event[];
}

export interface Event {
  text: string;
  pages: Page[];
  year: number;
}

export interface Page {
  wikibase_item: string;
  titles: Titles;
  pageid: number;
  thumbnail?: OriginalImage;
  originalimage?: OriginalImage;
  content_urls: ContentUrls;
  extract: string;
}

interface ContentUrls {
  desktop: PageUrl;
  mobile: PageUrl;
}

interface PageUrl {
  page: string;
}

interface OriginalImage {
  source: string;
  width: number;
  height: number;
}

interface Titles {
  normalized: string;
}

