export class FbPostDto {
  id: string;
  groupId: string;

  get url() {
    return `https://www.facebook.com/groups/${this.groupId}/${this.id}`;
  }
}

export class FbGroupDto {
  id: string;
  name: string | null;
  posts: Record<string, FbPostDto>;

  get url() {
    return `https://www.facebook.com/groups/${this.id}`;
  }
}
