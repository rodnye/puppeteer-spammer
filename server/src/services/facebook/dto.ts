export class FbPostDto {
  id: string;
  groupId: string;
  tags: string[] = [];
  desc: string = '';

  get url() {
    return FbPostDto.makeUrl(this.groupId, this.id);
  }

  static makeUrl(groupId: string, postId: string) {
    return `https://www.facebook.com/groups/${groupId}/posts/${postId}`;
  }
}

export class FbGroupDto {
  id: string;
  name: string | null;
  posts: Record<string, FbPostDto>;
  tags: string[] = [];

  get url() {
    return FbGroupDto.makeUrl(this.id);
  }

  static makeUrl(groupId: string) {
    return `https://www.facebook.com/groups/${groupId}`;
  }
}
