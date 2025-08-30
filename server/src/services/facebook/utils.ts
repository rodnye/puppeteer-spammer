export const matchGroup = (s: string) => /(\/groups\/|^)(\d{10,})/.exec(s)?.[2];
export const matchPost = (s: string) => /(\/posts\/|^)(\d{10,})/.exec(s)?.[2];
