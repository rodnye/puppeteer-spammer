export const matchGroup = (s: string) => /(\/groups\/|^)(\d{10,})/.exec(s)?.[2];
export const matchPost = (s: string) => /(\/posts\/|^)(\d{10,})/.exec(s)?.[2];
export const matchUser = (s: string) => /(\/user\/|^)(\d{10,})/.exec(s)?.[2];
export const matchComment = (s: string) => /(\?{0,1}comment_id\=|^)(\d{10,})/.exec(s)?.[2];