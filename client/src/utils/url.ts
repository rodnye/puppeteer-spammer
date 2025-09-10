export const makeGroupUrl = (groupId: string) => {
  return `https://www.facebook.com/groups/${groupId}`;
};
export const makePostUrl = (groupId: string, postId: string) => {
  return `https://www.facebook.com/groups/${groupId}/posts/${postId}`;
};

export const extractGroupId = (s: string) =>
  /(\/groups\/|^)(\d{10,})/.exec(s)?.[2];
export const extractPostId = (s: string) =>
  /(\/posts\/|^)(\d{10,})/.exec(s)?.[2];
export const extractUserId = (s: string) =>
  /(\/user\/|^)(\d{10,})/.exec(s)?.[2];
export const extractCommentId = (s: string) =>
  /(\?{0,1}comment_id\=|^)(\d{10,})/.exec(s)?.[2];
