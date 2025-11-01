import { Equals, IsArray, IsOptional, IsString } from 'class-validator';
import { matchUser } from './utils';
import { join } from 'path';
import { SESSIONS_DIR } from '../core/config';
import { randomUUID } from 'crypto';

export class FbPostDto {
  @IsString()
  postId: string;

  @IsString()
  groupId: string;
  
  @IsOptional()
  @IsArray()
  tags: string[] = [];

  @IsOptional()
  @IsString()
  desc: string = '';

  get url() {
    return FbPostDto.makeUrl(this.groupId, this.postId);
  }

  static makeUrl(groupId: string, postId: string) {
    return `https://www.facebook.com/groups/${groupId}/posts/${postId}`;
  }
}

export class FbGroupDto {
  @IsString()
  groupId: string;
  
  @IsOptional()
  @IsString()
  name: string | null = null;
  
  @IsArray()
  postIds: string[] = [];
  
  @IsArray()
  tags: string[] = [];

  get url() {
    return FbGroupDto.makeUrl(this.groupId);
  }

  static makeUrl(groupId: string) {
    return `https://www.facebook.com/groups/${groupId}`;
  }
}

export class FbCommentDto {
  @IsString()
  id: string;

  @IsString()
  groupId: string;

  @IsString()
  postId: string;

  /**
   * Tiempo en formato sencillo:
   * 
   * @example 
   * "recientemente"
   * "hace 5 min"
   * "1 h"
   * "7 d"
   * 
   */
  @IsString()
  @IsOptional()
  simpleDate?: string;
  
  /**
   * Nombre y apellidos del autor
   */
  @IsString()
  author: string; 
  
  /**
   * El contenido del comentario
   */
  @IsString()
  comment: string;

  @IsString()
  private _authorId?: string;
  set authorId(unsafeId: string) {
    this._authorId = matchUser(unsafeId);
  }
  get authorId(): string | undefined {
    return this._authorId;
  }
  get authorUrl() {
    if (!this.authorId) return undefined;
    return `https://www.facebook.com/profile.php?id=${this.authorId}`;
  }

  get url() {
    return `https://www.facebook.com/groups/${this.groupId}/posts/${this.postId}/?comment_id=${this.id}`;
  }
}

export class FbUserDto {
  @IsString()
  sessionId: string;
  
  @IsString()
  user: string;

  @IsString()
  pass: string;

  @IsString()
  fbUser: string;

  @IsString()
  fbPass: string;

  @IsString()
  @IsOptional()
  sessionUrl: string;

  get browserSessionDir() {
    return join(SESSIONS_DIR, this.sessionId);
  }
}