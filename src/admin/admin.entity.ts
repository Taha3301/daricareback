import { ChildEntity } from 'typeorm';
import { User } from '../user/user.entity';

@ChildEntity('admin')
export class Admin extends User { }
