// Entombed type for mausoleum
interface Entombed {
    name: string;       // json tag: "name"
    title: string;      // json tag: "title"
    life_years: string; // json tag: "life_years"
    about: string[];    // json tag: "about"
  }
  
  // PageFullInfo type
  interface PageFullInfo {
    // base - list
    id: number;                // json tag: "id"
    title: string;             // json tag: "title"
    thumbnail_url: string;     // json tag: "thumbnail_url"
    lang: string;              // json tag: "lang"
    page_type: string;         // json tag: "page_type"
    trid: number;              // json tag: "trid"
  
    // common
    location_url: string;      // json tag: "location_url"
    built_at: string;          // json tag: "built_at"
    built_by: string;          // json tag: "built_by"
    architect: string;         // json tag: "architect"
    location_str: string;      // json tag: "location_str"
    properties: string[];      // json tag: "properties"
  
    // mosque
    changes?: string[];        // json tag: "changes" (omitempty)
  
    // mausoleum
    contains?: Entombed[];     // json tag: "contains" (omitempty)
  }
  

  export type {
    PageFullInfo,
    Entombed
  }